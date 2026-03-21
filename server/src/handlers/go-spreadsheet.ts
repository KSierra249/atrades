import { Request, Response } from "express";
import { CreateGoSpreadsheetRequest, CreateGoSpreadsheetResponse } from "../types/go-spreadsheet";
import { apifyClient } from "../apify";
import { ApiError } from "../types/api-helper";
import { InstaCaption } from "../types/go-spreadsheet";

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
export const createGoSpreadsheetHandler = async (req: Request<CreateGoSpreadsheetRequest>, res: Response<CreateGoSpreadsheetResponse>) => {
  const { url } = req.body;

  try {
    const caption = await getInstaCaption(url);
    const response: CreateGoSpreadsheetResponse = {
      kind: 'ok',
      caption
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
