'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/app/_components/session-provider';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSession();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        setStatus('error');
        setErrorMessage(`OAuth error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received');
        return;
      }

      try {
        // Get existing connection data and add the auth code
        const connectionData = localStorage.getItem('pendingConnection');
        if (connectionData) {
          const data = JSON.parse(connectionData);
          data.authCode = code;
          localStorage.setItem('pendingConnection', JSON.stringify(data));
        } else {
          // Fallback: create minimal connection data with just the code
          localStorage.setItem(
            'pendingConnection',
            JSON.stringify({ authCode: code })
          );
        }

        // Set completion flag
        localStorage.setItem('oauthComplete', 'true');

        setStatus('success');

        // Redirect back to connections page after a short delay
        setTimeout(() => {
          router.push('/dashboard/connections');
        }, 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage('Failed to process authorization');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-semibold">
              Processing Authorization...
            </h1>
            <p className="text-gray-600">
              Please wait while we complete your Google Sheets connection.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-semibold">Authorization Successful!</h1>
            <p className="text-gray-600">
              Redirecting you back to connections...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-semibold">Authorization Failed</h1>
            <p className="text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.push('/dashboard/connections')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Connections
            </button>
          </>
        )}
      </div>
    </div>
  );
}
