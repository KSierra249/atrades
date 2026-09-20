export type GoFormValues = {
  spreadsheetUrl: string;
  storeName: string;
  setName: string;
  setFrom: string;
  deadline: string;
  price: string;
  instaPostLink: string;
};

export type GoFormField = keyof GoFormValues;

export const INITIAL_GO_FORM_VALUES: GoFormValues = {
  spreadsheetUrl: '',
  storeName: '',
  setName: '',
  setFrom: '',
  deadline: '',
  price: '',
  instaPostLink: '',
};
