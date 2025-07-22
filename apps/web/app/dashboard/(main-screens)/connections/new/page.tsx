'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/app/_components/session-provider';
import { useStorageState } from '@/lib/hooks/useStorageState';
import {
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
} from 'lucide-react';
import { GooglePicker } from '../_components/google-picker';

interface SpreadsheetInfo {
  title: string;
  worksheets: Array<{
    id: number;
    name: string;
    gridProperties?: any;
  }>;
}

interface WorksheetHeaders {
  headers: string[];
}

interface TemporaryCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

type SetupStep =
  | 'choose-type'
  | 'authorize'
  | 'configure'
  | 'mapping'
  | 'complete';

export default function NewConnectionPage() {
  const { session } = useSession();
  const router = useRouter();

  // Storage state for OAuth flow (only for setting values)
  const [[, oauthComplete], setOauthComplete] =
    useStorageState('oauthComplete');
  const [[, pendingConnection], setPendingConnection] =
    useStorageState('pendingConnection');

  const [step, setStep] = useState<SetupStep>('choose-type');
  const [connectionType, setConnectionType] = useState<'create' | 'existing'>(
    'create'
  );
  const [connectionName, setConnectionName] = useState('');
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState('');
  const [selectedSpreadsheetName, setSelectedSpreadsheetName] = useState('');
  const [selectedWorksheet, setSelectedWorksheet] = useState('');
  const [columnMappings, setColumnMappings] = useState({
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
  });
  const [authUrl, setAuthUrl] = useState('');
  const [temporaryTokens, setTemporaryTokens] =
    useState<TemporaryCredentials | null>(null);

  // Exchange auth code for temporary tokens
  const exchangeCodeTemporaryMutation = useMutation({
    mutationFn: async (authCode: string): Promise<TemporaryCredentials> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/exchange-code-temporary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: authCode }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const data = await response.json();
      return data.data.credentials;
    },
    onSuccess: (credentials) => {
      console.log('Successfully exchanged code for temporary tokens');
      setTemporaryTokens(credentials);
      setStep('configure');
    },
  });

  // Polling for OAuth completion during authorize step
  useEffect(() => {
    if (step !== 'authorize') return;

    const checkOAuthCompletion = () => {
      try {
        const oauthCompleteValue = localStorage.getItem('oauthComplete');
        const pendingConnectionValue =
          localStorage.getItem('pendingConnection');

        if (oauthCompleteValue === 'true' && pendingConnectionValue) {
          const connectionData = JSON.parse(pendingConnectionValue);

          if (connectionData.authCode) {
            // Clear the completion flag
            localStorage.removeItem('oauthComplete');
            // Exchange auth code for temporary tokens
            exchangeCodeTemporaryMutation.mutate(connectionData.authCode);
          }
        }
      } catch (error) {
        console.error('Failed to check OAuth completion:', error);
      }
    };

    // Check immediately
    checkOAuthCompletion();

    // Then check every 2 seconds
    const interval = setInterval(checkOAuthCompletion, 2000);

    return () => clearInterval(interval);
  }, [step, exchangeCodeTemporaryMutation]);

  // Get auth URL
  const getAuthUrlMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/auth-url`,
        {
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const data = await response.json();
      return data.data.authUrl;
    },
    onSuccess: (url) => {
      setAuthUrl(url);
      setStep('authorize');
    },
  });

  // Get spreadsheet info for existing spreadsheets
  const {
    data: spreadsheetInfo,
    refetch: fetchSpreadsheetInfo,
    isFetching: isFetchingSpreadsheet,
  } = useQuery({
    queryKey: ['spreadsheet-info', existingSpreadsheetId],
    queryFn: async (): Promise<SpreadsheetInfo> => {
      if (!temporaryTokens || !existingSpreadsheetId) {
        throw new Error('Missing tokens or spreadsheet ID');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/spreadsheet/${existingSpreadsheetId}/info`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            temporaryAccessToken: temporaryTokens.access_token,
            temporaryRefreshToken: temporaryTokens.refresh_token,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet info');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: false, // We'll manually trigger this
  });

  // Get worksheet headers when a worksheet is selected
  const {
    data: worksheetHeaders,
    isFetching: isFetchingHeaders,
    error: headersError,
  } = useQuery({
    queryKey: ['worksheet-headers', existingSpreadsheetId, selectedWorksheet],
    queryFn: async (): Promise<WorksheetHeaders> => {
      if (!temporaryTokens || !existingSpreadsheetId || !selectedWorksheet) {
        throw new Error('Missing tokens, spreadsheet ID, or worksheet name');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/spreadsheet/${existingSpreadsheetId}/worksheet/${selectedWorksheet}/headers-temporary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            temporaryAccessToken: temporaryTokens.access_token,
            temporaryRefreshToken: temporaryTokens.refresh_token,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch worksheet headers');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!(temporaryTokens && existingSpreadsheetId && selectedWorksheet),
  });

  // Create connection
  const createConnectionMutation = useMutation({
    mutationFn: async () => {
      const pendingConnectionValue = localStorage.getItem('pendingConnection');
      if (!pendingConnectionValue) {
        throw new Error('Missing connection data');
      }

      const connectionData = JSON.parse(pendingConnectionValue);

      const payload: any = {
        name: connectionData.name,
        spreadsheetOption: connectionData.type,
      };

      // Use tokens if available, otherwise fall back to authCode
      if (temporaryTokens) {
        payload.tokens = temporaryTokens;
      } else if (connectionData.authCode) {
        payload.code = connectionData.authCode;
      } else {
        throw new Error('Missing authorization tokens or code');
      }

      if (connectionData.type === 'existing') {
        payload.existingSpreadsheetId = existingSpreadsheetId;
        payload.existingWorksheetName = selectedWorksheet;
        // Include column mappings for existing spreadsheets
        payload.date_column = columnMappings.date;
        payload.amount_column = columnMappings.amount;
        payload.description_column = columnMappings.description;
        payload.category_column = columnMappings.category;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/exchange-code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear stored data and temporary tokens
      localStorage.removeItem('pendingConnection');
      setTemporaryTokens(null);
      setStep('complete');
    },
  });

  const handleStartAuth = () => {
    // Store connection configuration before starting OAuth
    const connectionData = {
      name: connectionName,
      type: connectionType,
    };
    setPendingConnection(JSON.stringify(connectionData));

    getAuthUrlMutation.mutate();
  };

  const handleConfigureComplete = () => {
    if (connectionType === 'existing' && existingSpreadsheetId) {
      fetchSpreadsheetInfo();
      setStep('mapping');
    } else {
      createConnectionMutation.mutate();
    }
  };

  const handleMappingComplete = () => {
    createConnectionMutation.mutate();
  };

  const handleCancel = () => {
    // Clear stored data
    localStorage.removeItem('pendingConnection');
    localStorage.removeItem('oauthComplete');
    router.push('/dashboard/connections');
  };

  const handleComplete = () => {
    // Clear stored data
    localStorage.removeItem('pendingConnection');
    localStorage.removeItem('oauthComplete');
    router.push('/dashboard/connections');
  };

  const handleFileSelected = (fileId: string, fileName: string) => {
    setExistingSpreadsheetId(fileId);
    setSelectedSpreadsheetName(fileName);
  };

  return (
    <div className="min-h-screen bg-[#05060A]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Connect Google Sheets</h1>
            <p className="text-gray-400 mt-1">
              Automatically sync your expenses to Google Sheets
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#0A0B0F] border border-gray-800 rounded-lg p-6">
          {step === 'choose-type' && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Connection Type</Label>
                <RadioGroup
                  value={connectionType}
                  onValueChange={(value: 'create' | 'existing') =>
                    setConnectionType(value)
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="create" />
                    <Label htmlFor="create">Create new spreadsheet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing">Use existing spreadsheet</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="My Expense Tracker"
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleStartAuth}
                  disabled={!connectionName.trim()}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'authorize' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-medium mb-2">
                  Authorize Google Sheets Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to authorize access to your Google
                  Sheets account.
                </p>
                <Button
                  onClick={() => window.open(authUrl, '_blank')}
                  className="mb-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Authorize with Google
                </Button>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Waiting for authorization...
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Complete the authorization in the opened tab, then return
                    here. We'll automatically detect when you're done.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('choose-type')}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === 'configure' && (
            <div className="space-y-6">
              {connectionType === 'existing' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Select Google Sheets Spreadsheet
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose a spreadsheet from your Google Drive to sync
                      expenses to
                    </p>
                  </div>

                  <GooglePicker
                    accessToken={temporaryTokens?.access_token || null}
                    onFileSelected={handleFileSelected}
                  />

                  {existingSpreadsheetId && selectedSpreadsheetName && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900 dark:text-green-100">
                            {selectedSpreadsheetName}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">
                            Spreadsheet ID: {existingSpreadsheetId}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('authorize')}>
                  Back
                </Button>
                <Button
                  onClick={handleConfigureComplete}
                  disabled={
                    (connectionType === 'existing' && !existingSpreadsheetId) ||
                    isFetchingSpreadsheet
                  }
                >
                  {isFetchingSpreadsheet ? 'Loading...' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 'mapping' && spreadsheetInfo && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  Select Worksheet
                </Label>
                <Select
                  value={selectedWorksheet}
                  onValueChange={setSelectedWorksheet}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose worksheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {spreadsheetInfo.worksheets.map((worksheet) => (
                      <SelectItem key={worksheet.name} value={worksheet.name}>
                        {worksheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWorksheet && (
                <>
                  {isFetchingHeaders && (
                    <div className="text-center py-4">
                      <div className="text-gray-500">
                        Loading column headers...
                      </div>
                    </div>
                  )}

                  {headersError && (
                    <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700">
                        Failed to load column headers for this worksheet.
                      </div>
                    </div>
                  )}

                  {worksheetHeaders && !isFetchingHeaders && (
                    <div>
                      <Label className="text-base font-medium">
                        Column Mapping
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {Object.entries(columnMappings).map(
                          ([field, column]) => (
                            <div key={field}>
                              <Label className="capitalize">{field}</Label>
                              <Select
                                value={column}
                                onValueChange={(value) =>
                                  setColumnMappings((prev) => ({
                                    ...prev,
                                    [field]: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {worksheetHeaders.headers.map((header) => (
                                    <SelectItem key={header} value={header}>
                                      {header}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('configure')}>
                  Back
                </Button>
                <Button
                  onClick={handleMappingComplete}
                  disabled={
                    !selectedWorksheet ||
                    !worksheetHeaders ||
                    isFetchingHeaders ||
                    createConnectionMutation.isPending
                  }
                >
                  {createConnectionMutation.isPending
                    ? 'Creating...'
                    : 'Create Connection'}
                </Button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium mb-2">Connection Created!</h3>
              <p className="text-gray-600">
                Your Google Sheets connection has been set up successfully. Your
                expenses will now automatically sync to your spreadsheet.
              </p>
              <Button onClick={handleComplete}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
