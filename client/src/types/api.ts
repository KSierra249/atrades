export type ApiError = { kind: 'error'; message: string };

export type SignInRequest = { email: string; password: string };
export type SignInResponse = { kind: 'ok'; token: string } | ApiError;

export type CreateGoSpreadsheetRequest = {
  url: string;
  spreadsheetUrl: string;
  storeName: string;
  setName: string;
  setFrom: string;
  deadline: string;
  pricePerCard: number;
};

export type CreateGoSpreadsheetResponse =
  | {
      kind: 'ok';
      spreadsheetId: string;
      spreadsheetUrl: string;
      worksheetTitle: string;
      data: object;
    }
  | ApiError;

export type GoogleAuthStatusResponse =
  | { connected: false }
  | { connected: true; email: string };
