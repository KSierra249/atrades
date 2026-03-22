import { Static, Type } from '@sinclair/typebox';
import { ApiResponse } from './api-helper';

export type InstaCaption = {
  caption: string;
}

export type Joiner = {
  username: string;
  emoji: string;
}

export type Member = {
  name: string;
  emojis: string[];
}

export type CaptionData = {
  amountOfsets: number;
  joiners: Joiner[];
  members: Member[];
}

export const CreateGoSpreadsheetRequestSchema = Type.Object({
  url: Type.String()
});

export type CreateGoSpreadsheetRequest = Static<typeof CreateGoSpreadsheetRequestSchema>;

// wip
export type CreateGoSpreadsheetResponse = ApiResponse<{
  data: CaptionData;
}>;
