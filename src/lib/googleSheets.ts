import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let cachedDoc: GoogleSpreadsheet | null = null;

export async function getGoogleSheetDocument() {
  if (cachedDoc) {
    return cachedDoc;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!email || !privateKey || !spreadsheetId) {
    throw new Error('Google Sheets credentials are not set in environment variables.');
  }

  // Initialize auth
  const serviceAccountAuth = new JWT({
    email,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  
  // Load document properties and worksheets
  await doc.loadInfo();
  
  cachedDoc = doc;
  return doc;
}
