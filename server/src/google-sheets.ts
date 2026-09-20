import type { Request } from 'express';
import { google } from 'googleapis';
import { getAuthorizedGoogleClient } from './google-session';
import type { MasterListData } from './types/go-spreadsheet';

const getSpreadsheetId = (url: string): string => {
  const id = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  if (!id) throw new Error('INVALID_SPREADSHEET_URL');
  return id;
};

const getUniqueTitle = (requested: string, existingTitles: string[]): string => {
  const title = requested.replace(/[:\\/?*\[\]]/g, '-').slice(0, 100) || 'GO Worksheet';
  const existing = new Set(existingTitles.map(value => value.toLowerCase()));
  if (!existing.has(title.toLowerCase())) return title;
  let suffix = 2;
  while (existing.has(`${title.slice(0, 95)} (${suffix})`.toLowerCase())) suffix += 1;
  return `${title.slice(0, 95)} (${suffix})`;
};

const buildValues = (data: MasterListData): Array<Array<string | number>> => [
  ['set:', data.setName],
  ['set from:', data.setFrom],
  ['status:', 'secured'],
  ['store:', data.storeName],
  ['deadline:', data.deadline],
  [],
  ['set:', data.totalPrice],
  [],
  ['price per pc:', data.pricePerCard],
  [], [], [], [], [], [],
  ['joiners', 'member claims', 'total', 'payment status'],
  ...data.joinerData.map(joiner => [
    `${joiner.emoji} ${joiner.username}`,
    joiner.memberClaims.join(', '),
    joiner.total,
    'unpaid',
  ]),
];

const buildFormatRequests = (sheetId: number, joinerCount: number) => [
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 2 },
      cell: { userEnteredFormat: {
        backgroundColor: { red: 0.82, green: 0.82, blue: 0.82 },
        borders: { bottom: { style: 'SOLID', color: { red: 0.2, green: 0.2, blue: 0.2 } } },
      } },
      fields: 'userEnteredFormat(backgroundColor,borders)',
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 9, startColumnIndex: 0, endColumnIndex: 1 },
      cell: { userEnteredFormat: { textFormat: { bold: true }, horizontalAlignment: 'RIGHT' } },
      fields: 'userEnteredFormat(textFormat,horizontalAlignment)',
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 6, endRowIndex: 9, startColumnIndex: 1, endColumnIndex: 2 },
      cell: { userEnteredFormat: {
        textFormat: { bold: true }, horizontalAlignment: 'RIGHT',
        numberFormat: { type: 'CURRENCY', pattern: '$0.00' },
      } },
      fields: 'userEnteredFormat(textFormat,horizontalAlignment,numberFormat)',
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 15, endRowIndex: 16, startColumnIndex: 0, endColumnIndex: 4 },
      cell: { userEnteredFormat: {
        textFormat: { bold: true }, backgroundColor: { red: 0.62, green: 0.62, blue: 0.62 },
        horizontalAlignment: 'CENTER',
        borders: {
          top: { style: 'SOLID' }, bottom: { style: 'SOLID' },
          left: { style: 'SOLID' }, right: { style: 'SOLID' },
        },
      } },
      fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment,borders)',
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 16, endRowIndex: 16 + joinerCount, startColumnIndex: 2, endColumnIndex: 3 },
      cell: { userEnteredFormat: {
        horizontalAlignment: 'RIGHT', numberFormat: { type: 'CURRENCY', pattern: '$0.00' },
      } },
      fields: 'userEnteredFormat(horizontalAlignment,numberFormat)',
    },
  },
  {
    setDataValidation: {
      range: { sheetId, startRowIndex: 16, endRowIndex: 16 + joinerCount, startColumnIndex: 3, endColumnIndex: 4 },
      rule: {
        condition: { type: 'ONE_OF_LIST', values: [
          { userEnteredValue: 'unpaid' }, { userEnteredValue: 'paid' },
        ] },
        strict: true,
        showCustomUi: true,
      },
    },
  },
  {
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 16 } },
      fields: 'gridProperties.frozenRowCount',
    },
  },
  ...[255, 425, 135, 195].map((pixelSize, index) => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'COLUMNS', startIndex: index, endIndex: index + 1 },
      properties: { pixelSize },
      fields: 'pixelSize',
    },
  })),
  ...[
    { value: 'paid', color: { red: 0.08, green: 0.49, blue: 0.3 } },
    { value: 'unpaid', color: { red: 0.8, green: 0.16, blue: 0.16 } },
  ].map(({ value, color }, index) => ({
    addConditionalFormatRule: {
      index,
      rule: {
        ranges: [{ sheetId, startRowIndex: 16, startColumnIndex: 3, endColumnIndex: 4 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: value }] },
          format: {
            backgroundColor: color,
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
          },
        },
      },
    },
  })),
];

export const createGoogleWorksheet = async (
  req: Request,
  spreadsheetUrl: string,
  data: MasterListData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; worksheetTitle: string }> => {
  const auth = await getAuthorizedGoogleClient(req);
  if (!auth) throw new Error('GOOGLE_AUTH_REQUIRED');

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = getSpreadsheetId(spreadsheetUrl);
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });
  const existingTitles = spreadsheet.data.sheets
    ?.map(sheet => sheet.properties?.title)
    .filter((title): title is string => Boolean(title)) ?? [];
  const worksheetTitle = getUniqueTitle(`${data.storeName} - ${data.setName}`, existingTitles);

  const addSheetResponse = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: worksheetTitle } } }] },
  });
  const sheetId = addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;
  if (typeof sheetId !== 'number') throw new Error('Google did not return a sheet ID.');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${worksheetTitle.replace(/'/g, "''")}'!A1:D`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: buildValues(data) },
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: buildFormatRequests(sheetId, data.joinerData.length) },
  });

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetId}`,
    worksheetTitle,
  };
};
