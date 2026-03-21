import { Static, Type } from '@sinclair/typebox';
import { ApiResponse } from './api-helper';

export type InstaCaption = {
  caption: string;
}

export const CreateGoSpreadsheetRequestSchema = Type.Object({
  url: Type.String()
});

export type CreateGoSpreadsheetRequest = Static<typeof CreateGoSpreadsheetRequestSchema>;

// TODO: Remove the caption field once we have the spreadsheet generation working, this is just for testing the apify integration
export type CreateGoSpreadsheetResponse = ApiResponse<{
  caption: string;
}>;
