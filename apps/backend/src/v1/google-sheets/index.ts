import { Router } from 'express';
import { verifyUserToken } from '../middlewares';
import {
  getAuthUrl,
  exchangeCodeForTokens,
  exchangeCodeForTokensTemporary,
  getConnections,
  getSpreadsheetInfo,
  getColumnHeaders,
  getColumnHeadersTemporary,
  updateColumnMapping,
  deleteConnection,
  toggleConnectionStatus
} from './controllers';

const googleSheetsRouter = Router();

// All routes require authentication
googleSheetsRouter.use(verifyUserToken);

// Get Google OAuth authorization URL
googleSheetsRouter.get('/auth-url', getAuthUrl);

// Exchange authorization code for tokens (temporary, no connection)
googleSheetsRouter.post(
  '/exchange-code-temporary',
  exchangeCodeForTokensTemporary
);

// Exchange authorization code for tokens and create connection
googleSheetsRouter.post('/exchange-code', exchangeCodeForTokens);

// Get user's connections
googleSheetsRouter.get('/connections', getConnections);

// Get spreadsheet information (worksheets)
googleSheetsRouter.post('/spreadsheet/:spreadsheetId/info', getSpreadsheetInfo);

// Get column headers from a worksheet (during setup with temporary tokens)
googleSheetsRouter.post(
  '/spreadsheet/:spreadsheetId/worksheet/:worksheetName/headers-temporary',
  getColumnHeadersTemporary
);

// Get column headers from a worksheet (for existing connections)
googleSheetsRouter.get(
  '/spreadsheet/:spreadsheetId/worksheet/:worksheetName/headers',
  getColumnHeaders
);

// Update connection column mapping
googleSheetsRouter.put(
  '/connections/:connectionId/mapping',
  updateColumnMapping
);

// Toggle connection status
googleSheetsRouter.put(
  '/connections/:connectionId/toggle',
  toggleConnectionStatus
);

// Delete connection
googleSheetsRouter.delete('/connections/:connectionId', deleteConnection);

export { googleSheetsRouter };
