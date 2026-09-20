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
  amountOfSets: number;
  unclaimed: number;
  unclaimedSets: number[];
}

export type CaptionData = {
  joiners: Joiner[];
  members: Member[];
}

export type JoinerData = {
  emoji: string;
  username: string;
  memberClaims: string[];
  total: number;
}

export type MasterListData = {
  storeName: string;
  setName: string;
  setFrom: string;
  deadline: string;
  pricePerCard: number;
  totalPrice: number;
  joinerData: JoinerData[];
}

export const CreateGoSpreadsheetRequestSchema = Type.Object({
  url: Type.String(),
  spreadsheetUrl: Type.String(),
  storeName: Type.String(),
  setName: Type.String(),
  setFrom: Type.String(),
  deadline: Type.String(),
  pricePerCard: Type.Number()
});

export type CreateGoSpreadsheetRequest = Static<typeof CreateGoSpreadsheetRequestSchema>;

export type CreateGoSpreadsheetResponse = ApiResponse<{
  data: MasterListData;
  spreadsheetId: string;
  spreadsheetUrl: string;
  worksheetTitle: string;
}>;
