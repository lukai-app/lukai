import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../env';
import { encrypt, decrypt } from '../../utils/encryption';
import prisma from '../prisma';
import { handleError } from '../../utils/handleError';

export interface GoogleSheetsCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface ExpenseData {
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface SheetColumnMapping {
  date_column: string;
  amount_column: string;
  description_column: string;
  category_column: string;
}

export class GoogleSheetsService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/drive.file'];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Forces refresh token to be returned
    });
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async getTokens(code: string): Promise<GoogleSheetsCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to get tokens from Google');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date || Date.now() + 3600000 // 1 hour default
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<GoogleSheetsCredentials> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      return {
        access_token: credentials.access_token,
        refresh_token: refreshToken, // Keep existing refresh token
        expires_at: credentials.expiry_date || Date.now() + 3600000
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Set credentials for the OAuth2 client
   */
  private setCredentials(credentials: GoogleSheetsCredentials) {
    this.oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token
    });
  }

  /**
   * Get spreadsheet metadata and worksheets
   */
  async getSpreadsheetInfo(
    spreadsheetId: string,
    credentials: GoogleSheetsCredentials
  ) {
    try {
      this.setCredentials(credentials);
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false
      });

      const spreadsheet = response.data;
      const worksheets =
        spreadsheet.sheets?.map((sheet) => ({
          id: sheet.properties?.sheetId,
          name: sheet.properties?.title || 'Untitled',
          gridProperties: sheet.properties?.gridProperties
        })) || [];

      return {
        title: spreadsheet.properties?.title || 'Untitled Spreadsheet',
        worksheets
      };
    } catch (error) {
      console.error('Error getting spreadsheet info:', error);
      throw new Error(
        'Failed to access spreadsheet. Please check permissions.'
      );
    }
  }

  /**
   * Read column headers from a worksheet
   */
  async getColumnHeaders(
    spreadsheetId: string,
    worksheetName: string,
    credentials: GoogleSheetsCredentials
  ): Promise<string[]> {
    try {
      this.setCredentials(credentials);
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${worksheetName}!1:1` // First row
      });

      return response.data.values?.[0] || [];
    } catch (error) {
      console.error('Error getting column headers:', error);
      throw new Error('Failed to read column headers from worksheet');
    }
  }

  /**
   * Create a new spreadsheet with default expense tracking structure
   */
  async createExpenseSpreadsheet(
    title: string,
    credentials: GoogleSheetsCredentials
  ) {
    try {
      this.setCredentials(credentials);
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

      // Create new spreadsheet
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title
          },
          sheets: [
            {
              properties: {
                title: 'Expenses'
              }
            }
          ]
        }
      });

      console.log('createResponse', createResponse.data);

      const spreadsheetId = createResponse.data.spreadsheetId;
      if (!spreadsheetId) {
        throw new Error('Failed to create spreadsheet');
      }

      // Get the actual sheet ID from the created spreadsheet
      const sheetId = createResponse.data.sheets?.[0]?.properties?.sheetId;
      if (sheetId === undefined) {
        throw new Error('Failed to get sheet ID from created spreadsheet');
      }

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Expenses!A1:D1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Date', 'Amount', 'Description', 'Category']]
        }
      });

      // Format headers (bold)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 4
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat.textFormat.bold'
              }
            }
          ]
        }
      });

      return {
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        worksheetName: 'Expenses'
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw new Error('Failed to create new spreadsheet');
    }
  }

  /**
   * Add expense data to a worksheet
   */
  async addExpenseToSheet(
    spreadsheetId: string,
    worksheetName: string,
    expenseData: ExpenseData,
    columnMapping: SheetColumnMapping,
    credentials: GoogleSheetsCredentials
  ) {
    try {
      this.setCredentials(credentials);
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

      // Get current data to find next empty row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${worksheetName}!A:A`
      });

      const nextRow = (response.data.values?.length || 0) + 1;

      // Get column headers to map data correctly
      const headers = await this.getColumnHeaders(
        spreadsheetId,
        worksheetName,
        credentials
      );

      // Create row data based on column mapping
      const rowData: string[] = new Array(headers.length).fill('');

      headers.forEach((header, index) => {
        if (header === columnMapping.date_column) {
          rowData[index] = expenseData.date;
        } else if (header === columnMapping.amount_column) {
          rowData[index] = expenseData.amount.toString();
        } else if (header === columnMapping.description_column) {
          rowData[index] = expenseData.description;
        } else if (header === columnMapping.category_column) {
          rowData[index] = expenseData.category;
        }
      });

      // Add the row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${worksheetName}!A${nextRow}:${String.fromCharCode(
          65 + headers.length - 1
        )}${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData]
        }
      });
    } catch (error) {
      console.error('Error adding expense to sheet:', error);
      throw new Error('Failed to add expense to Google Sheet');
    }
  }

  /**
   * Add multiple expenses to a worksheet in a single API call
   */
  async addMultipleExpensesToSheet(
    spreadsheetId: string,
    worksheetName: string,
    expensesData: ExpenseData[],
    columnMapping: SheetColumnMapping,
    credentials: GoogleSheetsCredentials
  ) {
    try {
      this.setCredentials(credentials);
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

      // Get column headers once for all expenses
      const headers = await this.getColumnHeaders(
        spreadsheetId,
        worksheetName,
        credentials
      );

      // Prepare all rows data
      const rowsData: string[][] = expensesData.map((expenseData) => {
        const rowData: string[] = new Array(headers.length).fill('');

        headers.forEach((header, index) => {
          if (header === columnMapping.date_column) {
            rowData[index] = expenseData.date;
          } else if (header === columnMapping.amount_column) {
            rowData[index] = expenseData.amount.toString();
          } else if (header === columnMapping.description_column) {
            rowData[index] = expenseData.description;
          } else if (header === columnMapping.category_column) {
            rowData[index] = expenseData.category;
          }
        });

        return rowData;
      });

      // Add all rows in one API call using append
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${worksheetName}!A:A`, // Start from column A, Google Sheets will find the next empty row
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rowsData
        }
      });
    } catch (error) {
      console.error('Error adding multiple expenses to sheet:', error);
      throw new Error('Failed to add multiple expenses to Google Sheet');
    }
  }

  /**
   * Sync expense to Google Sheets connection
   */
  async syncExpenseToConnection(
    connectionId: string,
    expenseData: ExpenseData,
    encryptionKey: Uint8Array
  ) {
    try {
      const connection = await prisma.google_sheets_connection.findUnique({
        where: { id: connectionId },
        include: { contact: true }
      });

      if (!connection || connection.status !== 'active') {
        throw new Error('Connection not found or inactive');
      }

      // Decrypt credentials
      const accessToken = decrypt(connection.access_token, encryptionKey);
      const refreshToken = decrypt(connection.refresh_token, encryptionKey);

      let credentials: GoogleSheetsCredentials = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: connection.token_expires_at.getTime()
      };

      // Check if token needs refresh
      if (credentials.expires_at <= Date.now()) {
        try {
          credentials = await this.refreshAccessToken(
            credentials.refresh_token
          );

          // Update stored credentials
          await prisma.google_sheets_connection.update({
            where: { id: connectionId },
            data: {
              access_token: encrypt(credentials.access_token, encryptionKey),
              token_expires_at: new Date(credentials.expires_at),
              status: 'active',
              error_message: null
            }
          });
        } catch (refreshError) {
          // Mark connection as expired
          await prisma.google_sheets_connection.update({
            where: { id: connectionId },
            data: {
              status: 'expired',
              error_message: 'Access token expired and refresh failed'
            }
          });

          await handleError({
            error: refreshError,
            userId: connection.contact.phone_number,
            endpoint: 'google-sheets-sync',
            message: `Google Sheets connection expired for user ${connection.contact.phone_number}`
          });

          throw new Error('Google Sheets connection expired');
        }
      }

      // Prepare column mapping
      const columnMapping: SheetColumnMapping = {
        date_column: connection.date_column || 'Date',
        amount_column: connection.amount_column || 'Amount',
        description_column: connection.description_column || 'Description',
        category_column: connection.category_column || 'Category'
      };

      // Add expense to sheet
      await this.addExpenseToSheet(
        connection.spreadsheet_id,
        connection.worksheet_name,
        expenseData,
        columnMapping,
        credentials
      );

      // Update last sync time
      await prisma.google_sheets_connection.update({
        where: { id: connectionId },
        data: {
          last_sync_at: new Date(),
          status: 'active',
          error_message: null
        }
      });
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);

      // Update connection with error
      await prisma.google_sheets_connection.update({
        where: { id: connectionId },
        data: {
          status: 'error',
          error_message:
            error instanceof Error ? error.message : 'Unknown error'
        }
      });

      // Get connection details for error reporting
      const connection = await prisma.google_sheets_connection.findUnique({
        where: { id: connectionId },
        include: { contact: true }
      });

      if (connection) {
        await handleError({
          error,
          userId: connection.contact.phone_number,
          endpoint: 'google-sheets-sync',
          message: `Failed to sync expense to Google Sheets for user ${connection.contact.phone_number}`
        });
      }

      throw error;
    }
  }

  /**
   * Sync multiple expenses to Google Sheets connection in batch
   */
  async syncMultipleExpensesToConnection(
    connectionId: string,
    expensesData: ExpenseData[],
    encryptionKey: Uint8Array
  ) {
    try {
      const connection = await prisma.google_sheets_connection.findUnique({
        where: { id: connectionId },
        include: { contact: true }
      });

      if (!connection || connection.status !== 'active') {
        throw new Error('Connection not found or inactive');
      }

      // Decrypt credentials
      const accessToken = decrypt(connection.access_token, encryptionKey);
      const refreshToken = decrypt(connection.refresh_token, encryptionKey);

      let credentials: GoogleSheetsCredentials = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: connection.token_expires_at.getTime()
      };

      // Check if token needs refresh
      if (credentials.expires_at <= Date.now()) {
        try {
          credentials = await this.refreshAccessToken(
            credentials.refresh_token
          );

          // Update stored credentials
          await prisma.google_sheets_connection.update({
            where: { id: connectionId },
            data: {
              access_token: encrypt(credentials.access_token, encryptionKey),
              token_expires_at: new Date(credentials.expires_at),
              status: 'active',
              error_message: null
            }
          });
        } catch (refreshError) {
          // Mark connection as expired
          await prisma.google_sheets_connection.update({
            where: { id: connectionId },
            data: {
              status: 'expired',
              error_message: 'Access token expired and refresh failed'
            }
          });

          await handleError({
            error: refreshError,
            userId: connection.contact.phone_number,
            endpoint: 'google-sheets-sync',
            message: `Google Sheets connection expired for user ${connection.contact.phone_number}`
          });

          throw new Error('Google Sheets connection expired');
        }
      }

      // Prepare column mapping
      const columnMapping: SheetColumnMapping = {
        date_column: connection.date_column || 'Date',
        amount_column: connection.amount_column || 'Amount',
        description_column: connection.description_column || 'Description',
        category_column: connection.category_column || 'Category'
      };

      // Add all expenses to sheet in one batch
      await this.addMultipleExpensesToSheet(
        connection.spreadsheet_id,
        connection.worksheet_name,
        expensesData,
        columnMapping,
        credentials
      );

      // Update last sync time
      await prisma.google_sheets_connection.update({
        where: { id: connectionId },
        data: {
          last_sync_at: new Date(),
          status: 'active',
          error_message: null
        }
      });

      return {
        success: true,
        syncedCount: expensesData.length
      };
    } catch (error) {
      console.error('Error syncing multiple expenses to Google Sheets:', error);

      // Update connection with error
      await prisma.google_sheets_connection.update({
        where: { id: connectionId },
        data: {
          status: 'error',
          error_message:
            error instanceof Error ? error.message : 'Unknown error'
        }
      });

      // Get connection details for error reporting
      const connection = await prisma.google_sheets_connection.findUnique({
        where: { id: connectionId },
        include: { contact: true }
      });

      if (connection) {
        await handleError({
          error,
          userId: connection.contact.phone_number,
          endpoint: 'google-sheets-sync-batch',
          message: `Failed to sync ${expensesData.length} expenses to Google Sheets for user ${connection.contact.phone_number}`
        });
      }

      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
