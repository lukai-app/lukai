import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import {
  googleSheetsService,
  GoogleSheetsCredentials
} from '../../lib/tools/googleSheets';
import { handleError } from '../../utils/handleError';
import { encrypt, decryptPermanentKey, decrypt } from '../../utils/encryption';
import prisma from '../../lib/prisma';
import { env } from '../../env';

/**
 * Get Google OAuth authorization URL
 */
export async function getAuthUrl(req: AuthRequest, res: Response) {
  try {
    const authUrl = googleSheetsService.getAuthUrl();

    return res.json({
      success: true,
      data: { authUrl },
      message: 'Authorization URL generated successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-auth-url',
      message: 'Failed to generate Google OAuth URL'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
}

/**
 * Exchange authorization code for tokens (temporary, no connection created)
 */
export async function exchangeCodeForTokensTemporary(
  req: AuthRequest,
  res: Response
) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Exchange code for tokens
    const credentials = await googleSheetsService.getTokens(code);

    return res.json({
      success: true,
      data: { credentials },
      message: 'Authorization code exchanged successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-exchange-code-temporary',
      message: 'Failed to exchange authorization code for tokens temporarily'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to exchange authorization code'
    });
  }
}

/**
 * Exchange authorization code for tokens and create/update connection
 */
export async function exchangeCodeForTokens(req: AuthRequest, res: Response) {
  try {
    const {
      code,
      name,
      spreadsheetOption,
      tokens,
      date_column,
      amount_column,
      description_column,
      category_column
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Connection name is required'
      });
    }

    if (!tokens && !code) {
      return res.status(400).json({
        success: false,
        message: 'Either tokens or authorization code is required'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let credentials: GoogleSheetsCredentials;

    if (tokens) {
      // Use provided tokens
      credentials = tokens;
      console.log('Using provided tokens:', credentials);
    } else {
      // Exchange code for tokens
      credentials = await googleSheetsService.getTokens(code);
      console.log('Exchanged code for credentials:', credentials);
    }

    console.log('req.user', req.user.encryption_key);
    // Get encryption key
    const encryptionKey = decryptPermanentKey(
      req.user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    let spreadsheetId: string;
    let worksheetName: string;

    if (spreadsheetOption === 'create') {
      // Create new spreadsheet
      const spreadsheet = await googleSheetsService.createExpenseSpreadsheet(
        `${name} - Expense Tracker`,
        credentials
      );
      spreadsheetId = spreadsheet.spreadsheetId;
      worksheetName = spreadsheet.worksheetName;
    } else {
      // User will provide existing spreadsheet details
      const { existingSpreadsheetId, existingWorksheetName } = req.body;

      if (!existingSpreadsheetId || !existingWorksheetName) {
        return res.status(400).json({
          success: false,
          message:
            'Spreadsheet ID and worksheet name are required for existing spreadsheet'
        });
      }

      // Verify access to existing spreadsheet
      try {
        await googleSheetsService.getSpreadsheetInfo(
          existingSpreadsheetId,
          credentials
        );
        spreadsheetId = existingSpreadsheetId;
        worksheetName = existingWorksheetName;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            'Cannot access the specified spreadsheet. Please check permissions.'
        });
      }
    }

    // Encrypt tokens
    const encryptedAccessToken = encrypt(
      credentials.access_token,
      encryptionKey
    );
    const encryptedRefreshToken = encrypt(
      credentials.refresh_token,
      encryptionKey
    );

    // Create connection in database
    const connection = await prisma.google_sheets_connection.create({
      data: {
        contact_id: req.user.id,
        name,
        spreadsheet_id: spreadsheetId,
        worksheet_name: worksheetName,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: new Date(credentials.expires_at),
        status: 'active',
        // Use provided column mappings or fall back to defaults
        date_column: date_column || 'Date',
        amount_column: amount_column || 'Amount',
        description_column: description_column || 'Description',
        category_column: category_column || 'Category'
      }
    });

    return res.json({
      success: true,
      data: {
        connection: {
          id: connection.id,
          name: connection.name,
          spreadsheet_id: connection.spreadsheet_id,
          worksheet_name: connection.worksheet_name,
          status: connection.status,
          created_at: connection.created_at
        }
      },
      message: 'Google Sheets connection created successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-exchange-code',
      message: 'Failed to exchange authorization code for tokens'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to create Google Sheets connection'
    });
  }
}

/**
 * Get user's Google Sheets connections
 */
export async function getConnections(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const connections = await prisma.google_sheets_connection.findMany({
      where: {
        contact_id: req.user.id
      },
      select: {
        id: true,
        name: true,
        spreadsheet_id: true,
        worksheet_name: true,
        status: true,
        last_sync_at: true,
        error_message: true,
        date_column: true,
        amount_column: true,
        description_column: true,
        category_column: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.json({
      success: true,
      data: { connections },
      message: 'Connections retrieved successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-get-connections',
      message: 'Failed to retrieve Google Sheets connections'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve connections'
    });
  }
}

/**
 * Get spreadsheet info (worksheets and column headers)
 */
export async function getSpreadsheetInfo(req: AuthRequest, res: Response) {
  try {
    const { spreadsheetId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // This endpoint is for exploring existing spreadsheets during setup
    // We'll need temporary credentials from the auth flow
    const { temporaryAccessToken, temporaryRefreshToken } = req.body;

    if (!temporaryAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    const credentials = {
      access_token: temporaryAccessToken,
      refresh_token: temporaryRefreshToken || '',
      expires_at: Date.now() + 3600000
    };

    const spreadsheetInfo = await googleSheetsService.getSpreadsheetInfo(
      spreadsheetId,
      credentials
    );

    return res.json({
      success: true,
      data: spreadsheetInfo,
      message: 'Spreadsheet info retrieved successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-get-spreadsheet-info',
      message: 'Failed to retrieve spreadsheet info'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to access spreadsheet. Please check permissions.'
    });
  }
}

/**
 * Get column headers from a specific worksheet (during setup with temporary tokens)
 */
export async function getColumnHeadersTemporary(
  req: AuthRequest,
  res: Response
) {
  try {
    const { spreadsheetId, worksheetName } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // This endpoint is for getting headers during setup with temporary credentials
    const { temporaryAccessToken, temporaryRefreshToken } = req.body;

    if (!temporaryAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    const credentials = {
      access_token: temporaryAccessToken,
      refresh_token: temporaryRefreshToken || '',
      expires_at: Date.now() + 3600000
    };

    const headers = await googleSheetsService.getColumnHeaders(
      spreadsheetId,
      worksheetName,
      credentials
    );

    return res.json({
      success: true,
      data: { headers },
      message: 'Column headers retrieved successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-get-column-headers-temporary',
      message: 'Failed to retrieve column headers during setup'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve column headers'
    });
  }
}

/**
 * Get column headers from a specific worksheet
 */
export async function getColumnHeaders(req: AuthRequest, res: Response) {
  try {
    const { spreadsheetId, worksheetName } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find the connection owned by this user for this spreadsheet/worksheet
    const connection = await prisma.google_sheets_connection.findFirst({
      where: {
        contact_id: req.user.id,
        spreadsheet_id: spreadsheetId,
        worksheet_name: worksheetName,
        status: 'active'
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Google Sheets connection not found for this spreadsheet'
      });
    }

    // Get encryption key to decrypt tokens
    const encryptionKey = decryptPermanentKey(
      req.user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    // Decrypt stored tokens
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
        credentials = await googleSheetsService.refreshAccessToken(
          credentials.refresh_token
        );

        // Update stored credentials
        await prisma.google_sheets_connection.update({
          where: { id: connection.id },
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
          where: { id: connection.id },
          data: {
            status: 'expired',
            error_message: 'Access token expired and refresh failed'
          }
        });

        return res.status(401).json({
          success: false,
          message: 'Google Sheets connection expired. Please reconnect.'
        });
      }
    }

    const headers = await googleSheetsService.getColumnHeaders(
      spreadsheetId,
      worksheetName,
      credentials
    );

    return res.json({
      success: true,
      data: { headers },
      message: 'Column headers retrieved successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-get-column-headers',
      message: 'Failed to retrieve column headers'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve column headers'
    });
  }
}

/**
 * Update connection column mapping
 */
export async function updateColumnMapping(req: AuthRequest, res: Response) {
  try {
    const { connectionId } = req.params;
    const { date_column, amount_column, description_column, category_column } =
      req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify connection belongs to user
    const connection = await prisma.google_sheets_connection.findFirst({
      where: {
        id: connectionId,
        contact_id: req.user.id
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Update column mapping
    const updatedConnection = await prisma.google_sheets_connection.update({
      where: { id: connectionId },
      data: {
        date_column,
        amount_column,
        description_column,
        category_column
      }
    });

    return res.json({
      success: true,
      data: { connection: updatedConnection },
      message: 'Column mapping updated successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-update-column-mapping',
      message: 'Failed to update column mapping'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to update column mapping'
    });
  }
}

/**
 * Delete a Google Sheets connection
 */
export async function deleteConnection(req: AuthRequest, res: Response) {
  try {
    const { connectionId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify connection belongs to user
    const connection = await prisma.google_sheets_connection.findFirst({
      where: {
        id: connectionId,
        contact_id: req.user.id
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    await prisma.google_sheets_connection.delete({
      where: { id: connectionId }
    });

    return res.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-delete-connection',
      message: 'Failed to delete Google Sheets connection'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to delete connection'
    });
  }
}

/**
 * Toggle connection status (activate/deactivate)
 */
export async function toggleConnectionStatus(req: AuthRequest, res: Response) {
  try {
    const { connectionId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify connection belongs to user
    const connection = await prisma.google_sheets_connection.findFirst({
      where: {
        id: connectionId,
        contact_id: req.user.id
      }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    const newStatus = connection.status === 'active' ? 'inactive' : 'active';

    const updatedConnection = await prisma.google_sheets_connection.update({
      where: { id: connectionId },
      data: {
        status: newStatus,
        error_message: newStatus === 'active' ? null : connection.error_message
      }
    });

    return res.json({
      success: true,
      data: { connection: updatedConnection },
      message: `Connection ${
        newStatus === 'active' ? 'activated' : 'deactivated'
      } successfully`
    });
  } catch (error) {
    await handleError({
      error,
      userId: req.user?.phone_number,
      endpoint: 'google-sheets-toggle-status',
      message: 'Failed to toggle connection status'
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to update connection status'
    });
  }
}
