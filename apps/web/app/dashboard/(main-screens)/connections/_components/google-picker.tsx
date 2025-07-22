'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { env } from '@/env';

interface GooglePickerProps {
  accessToken: string | null;
  onFileSelected: (fileId: string, fileName: string) => void;
  onPickerStateChange?: (isPickerActive: boolean) => void;
  disabled?: boolean;
}

interface PickerFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

export function GooglePicker({
  accessToken,
  onFileSelected,
  onPickerStateChange,
  disabled,
}: GooglePickerProps) {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerActive, setIsPickerActive] = useState(false);

  // Load Google APIs
  useEffect(() => {
    const loadGoogleAPIs = async () => {
      try {
        // Load gapi script if not already loaded
        if (!window.gapi) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => resolve();
            script.onerror = () => {
              console.error('Failed to load Google API script');
              resolve();
            };
            document.head.appendChild(script);
          });
        }

        // Load Google Picker script if not already loaded
        if (!window.google?.picker) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
              // Load picker after GSI
              const pickerScript = document.createElement('script');
              pickerScript.src =
                'https://apis.google.com/js/api.js?onload=initPicker';

              (window as any).initPicker = () => {
                window.gapi.load('picker', () => {
                  setPickerLoaded(true);
                });
              };

              pickerScript.onload = () => resolve();
              pickerScript.onerror = () => {
                console.error('Failed to load Google Picker script');
                resolve();
              };
              document.head.appendChild(pickerScript);
            };
            script.onerror = () => {
              console.error('Failed to load Google GSI script');
              resolve();
            };
            document.head.appendChild(script);
          });
        } else {
          setPickerLoaded(true);
        }

        // Initialize gapi
        if (window.gapi && !gapiLoaded) {
          window.gapi.load('client:picker', () => {
            window.gapi.client.setApiKey(
              process.env.NEXT_PUBLIC_GOOGLE_API_KEY!
            );
            setGapiLoaded(true);
          });
        }
      } catch (error) {
        console.error('Error loading Google APIs:', error);
      }
    };

    loadGoogleAPIs();
  }, [gapiLoaded]);

  const createPicker = useCallback(() => {
    if (
      !gapiLoaded ||
      !pickerLoaded ||
      !accessToken ||
      !window.google?.picker
    ) {
      console.error('Picker not ready or no access token');
      return;
    }

    setIsLoading(true);
    setIsPickerActive(true);
    onPickerStateChange?.(true);

    try {
      const picker = new google.picker.PickerBuilder()
        .addView(
          new google.picker.DocsView(
            google.picker.ViewId.SPREADSHEETS
          ).setIncludeFolders(true)
        )
        .setOAuthToken(accessToken)
        .setDeveloperKey(env.NEXT_PUBLIC_GOOGLE_API_KEY!)
        .setAppId(env.NEXT_PUBLIC_GOOGLE_APP_ID)
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .setCallback((data: any) => {
          setIsLoading(false);

          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0] as PickerFile;

            // Verify it's a Google Sheets file
            if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
              onFileSelected(file.id, file.name);
            } else {
              console.error('Selected file is not a Google Sheets file');
              // You might want to show an error message to the user here
            }
            onPickerStateChange?.(false);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            // User cancelled the picker
            onPickerStateChange?.(false);
          }
        })
        .setSize(1051, 650)
        .setTitle('Select a Google Sheets spreadsheet')
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error('Error creating picker:', error);
      setIsLoading(false);
      setIsPickerActive(false);
      console.log('Picker state changed to false when creating picker');
      onPickerStateChange?.(false);
    }
  }, [
    gapiLoaded,
    pickerLoaded,
    accessToken,
    onFileSelected,
    onPickerStateChange,
  ]);

  const handleOpenPicker = () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
    createPicker();
  };

  const isReady = gapiLoaded && pickerLoaded && !!accessToken;

  return (
    <Button
      onClick={handleOpenPicker}
      disabled={disabled || !isReady || isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Opening Picker...
        </>
      ) : !isReady ? (
        'Loading Google Drive...'
      ) : (
        'Browse Your Google Drive'
      )}
    </Button>
  );
}

// Type declarations for window.google.picker
declare global {
  interface Window {
    google: {
      picker: {
        PickerBuilder: new () => any;
        DocsView: new (viewId: string) => any;
        ViewId: {
          SPREADSHEETS: string;
          DOCS: string;
          PRESENTATIONS: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        setApiKey: (key: string) => void;
      };
    };
  }
}
