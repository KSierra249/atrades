import { Request, Response } from "express";
import {
  CreateGoSpreadsheetRequest,
  CreateGoSpreadsheetResponse,
  InstaCaption,
  CaptionData,
  MasterListData,
  JoinerData,
} from "../types/go-spreadsheet";
import { apifyClient } from "../apify";
import { ApiError } from "../types/api-helper";
import { openai } from "../open-ai";

const getInstaCaption = async (url: string): Promise<string> => {
  const input = {
    addParentData: false,
    directUrls: [url],
    resultsLimit: 200,
    resultsType: "posts",
    searchLimit: 1,
    searchType: "hashtag"
  };

  const run = await apifyClient
    .actor("apify/instagram-scraper")
    .call(input);
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  if (items.length === 0) {
    throw new Error("No data found for the provided URL");
  }
  const captionData = items[0] as InstaCaption;
  return captionData.caption;
};

const extractCaptionData = async (caption: string): Promise<CaptionData> => {
  const prompt = `
    Given a instagram caption, extract the following information:
    - The amount of sets by: bc:🫘🩵🩵❌(This is 3 sets, excluding the ❌)
    - The joiners, which are the users that joined the GO, and their corresponding emojis: 🎄 - @jcangel017 and 🥑 - gom
    - The members, which can come in the format of "name: emojis", for example: "John: 🫘🩵🩵❌"
    - The amount of check marks (✅) associated with each member set that value to "unclaimed" in the JSON output. cb:🫘🍀🥳🎀✅✅ -> "unclaimed": 2
    - If a member has no sets claimed, set "amountOfSets" to 0 and "unclaimed" to 0.
    - Add the indices which those check marks appear in the caption for each member in a list called "unclaimedSets". cb:🫘🍀🥳🎀✅✅ -> "unclaimedSets": [4, 5]

    Create a JSON with the following format:
    {
      "joiners": [
        {
          "username": string,
          "emoji": string
        },
        ...
      ],
      "members": [
        {
          "name": string,
          "emojis": string[],
          "amountOfSets": number,
          "unclaimed": number,
          "unclaimedSets": number[]
        },
        ...
      ]
    }

    Here is the caption: ${caption}
  `;
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that extracts structured data from instagram captions."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
  });

  const choices = response.choices;
  if (choices.length === 0) {
    throw new Error("No choices returned from OpenAI");
  }
  const firstChoice = choices[0];
  if (!firstChoice || !firstChoice.message || typeof firstChoice.message.content !== "string") {
    throw new Error("No content in the generated caption data");
  }

  let content = firstChoice.message.content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(content) as CaptionData;
};

const getMemberClaimsData = (captionData: CaptionData): Map<string, string[]> => {
  const joinerEmojis = new Set(captionData.joiners.map(joiner => joiner.emoji));
  const memberClaims = new Map<string, string[]>(
    captionData.joiners.map(joiner => [joiner.emoji, []])
  );
  const randomlySelectedEmojis = new Set<string>();

  captionData.members.forEach(member => {
    member.emojis.forEach(emoji => {
      if (joinerEmojis.has(emoji)) {
        memberClaims.get(emoji)?.push(member.name);
      }
    });
  });

  captionData.members.forEach(unclaimedMember => {
    unclaimedMember.unclaimedSets.forEach(setIndex => {
      const eligibleEmojis = [
        ...new Set(
          captionData.members
            .filter(member => member !== unclaimedMember)
            .map(member => member.emojis[setIndex])
            .filter(
              (emoji): emoji is string =>
                typeof emoji === 'string' &&
                joinerEmojis.has(emoji) &&
                !randomlySelectedEmojis.has(emoji)
            )
        )
      ];

      if (eligibleEmojis.length === 0) {
        return;
      }

      const selectedEmoji =
        eligibleEmojis[Math.floor(Math.random() * eligibleEmojis.length)];
      if (selectedEmoji) {
        memberClaims.get(selectedEmoji)?.push(unclaimedMember.name);
        randomlySelectedEmojis.add(selectedEmoji);
      }
    });
  });

  return memberClaims;
};

const getMemberCardCount = (memberName: string): number => {
  const otMatch = memberName.trim().match(/^ot\s*(\d+)$/i);
  if (!otMatch) {
    return 1;
  }

  const cardCount = Number(otMatch[1]);
  return Number.isSafeInteger(cardCount) && cardCount > 0 ? cardCount : 1;
};

const getJoinerTotal = (
  captionData: CaptionData,
  joinerEmoji: string,
  pricePerCard: number
): number => {
  const joinerEmojis = new Set(captionData.joiners.map(joiner => joiner.emoji));

  const directCardCount = captionData.members.reduce(
    (total, member) => {
      const claimCount = member.emojis.filter(
        emoji => emoji === joinerEmoji
      ).length;
      return total + claimCount * getMemberCardCount(member.name);
    },
    0
  );
  let total = directCardCount * pricePerCard;

  const unclaimedSetIndexes = new Set(
    captionData.members.flatMap(member => member.unclaimedSets)
  );

  unclaimedSetIndexes.forEach(setIndex => {
    const unclaimedCardCount = captionData.members
      .filter(member => member.unclaimedSets.includes(setIndex))
      .reduce(
        (cardCount, member) =>
          cardCount + getMemberCardCount(member.name),
        0
      );

    const sharingEmojis = new Set(
      captionData.members
        .map(member => member.emojis[setIndex])
        .filter(
          (emoji): emoji is string =>
            typeof emoji === 'string' && joinerEmojis.has(emoji)
        )
    );

    if (sharingEmojis.has(joinerEmoji) && sharingEmojis.size > 0) {
      total += (unclaimedCardCount * pricePerCard) / sharingEmojis.size;
    }
  });

  return Number(total.toFixed(2));
};

const getJoinerData = (captionData: CaptionData, pricePerCard: number): JoinerData[] => {
  return captionData.joiners.map(joiner => ({
    emoji: joiner.emoji,
    username: joiner.username,
    memberClaims: getMemberClaimsData(captionData).get(joiner.emoji) ?? [],
    total: getJoinerTotal(captionData, joiner.emoji, pricePerCard)
  }));
};

const buildMasterListData = (
  captionData: CaptionData,
  storeName: string,
  setName: string,
  setFrom: string,
  deadline: string,
  pricePerCard: number
): MasterListData => {
  const joinerData = getJoinerData(captionData, pricePerCard);
  return {
    storeName,
    setName,
    setFrom,
    deadline,
    pricePerCard,
    totalPrice: captionData.members.reduce(
      (sum, member) =>
        sum +
        member.amountOfSets *
          getMemberCardCount(member.name) *
          pricePerCard,
      0
    ),
    joinerData,
  };
};

// wip
export const createGoSpreadsheetHandler = async (req: Request<CreateGoSpreadsheetRequest>, res: Response<CreateGoSpreadsheetResponse>) => {
  const {
    url,
    storeName,
    setName,
    setFrom,
    deadline,
    pricePerCard
  } = req.body;

  try {
    const caption = await getInstaCaption(url);
    const captionData = await extractCaptionData(caption);
    console.log(captionData);
    const masterListData = buildMasterListData(
      captionData,
      storeName,
      setName,
      setFrom,
      deadline,
      pricePerCard
    );
    const response: CreateGoSpreadsheetResponse = {
      kind: 'ok',
      data: masterListData
    };
    res.status(200).json(response);
  } catch (e) {
    const response: ApiError = {
      kind: 'error',
      message: e instanceof Error ? e.message : 'Unknown error'
    };
    res.status(500).json(response);
  } 
};
