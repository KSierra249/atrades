import { Request, Response } from "express";
import {
  CreateGoSpreadsheetRequest,
  CreateGoSpreadsheetResponse,
  InstaCaption,
  CaptionData
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

// wip
const extractCaptionData = async (caption: string): Promise<CaptionData> => {
  const prompt = `
    Given a instagram caption, extract the following information:
    - The amount of sets by: bc:🫘🩵🩵❌(This is 3 sets, excluding the ❌)
    - The joiners, which are the users that joined the GO, and their corresponding emojis: 🎄 - @jcangel017 and 🥑 - gom
    - The members, which can come in the format of "name: emojis", for example: "John: 🫘🩵🩵❌"

    Create a JSON with the following format:
    {
      "amountOfsets": number,
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
          "emojis": string[]
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
}

// wip
export const createGoSpreadsheetHandler = async (req: Request<CreateGoSpreadsheetRequest>, res: Response<CreateGoSpreadsheetResponse>) => {
  const { url } = req.body;

  try {
    const caption = await getInstaCaption(url);
    const captionData = await extractCaptionData(caption);
    const response: CreateGoSpreadsheetResponse = {
      kind: 'ok',
      data: captionData
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
