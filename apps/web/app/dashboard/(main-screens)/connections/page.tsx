'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Plus,
  MoreHorizontal,
  ExternalLink,
  Settings,
  Trash2,
  Power,
  PowerOff,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/app/_components/session-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConnectionSettingsDialog } from './_components/connection-settings-dialog';

interface GoogleSheetsConnection {
  id: string;
  name: string;
  spreadsheet_id: string;
  worksheet_name: string;
  status: 'active' | 'inactive' | 'expired' | 'error';
  last_sync_at: string | null;
  error_message: string | null;
  date_column: string | null;
  amount_column: string | null;
  description_column: string | null;
  category_column: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchConnections(
  token: string
): Promise<GoogleSheetsConnection[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/connections`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }

  const data = await response.json();
  return data.data.connections;
}

async function toggleConnectionStatus(token: string, connectionId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/connections/${connectionId}/toggle`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to toggle connection status');
  }

  return response.json();
}

async function deleteConnection(token: string, connectionId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/connections/${connectionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete connection');
  }

  return response.json();
}

export default function ConnectionsPage() {
  const { session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedConnection, setSelectedConnection] =
    useState<GoogleSheetsConnection | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const {
    data: connections,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['google-sheets-connections'],
    queryFn: () => fetchConnections(session!.token),
    enabled: !!session?.token,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (connectionId: string) =>
      toggleConnectionStatus(session!.token, connectionId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['google-sheets-connections'],
      });
    },
    onError: (error: Error) => {
      console.error('Failed to toggle connection status:', error);
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: (connectionId: string) =>
      deleteConnection(session!.token, connectionId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['google-sheets-connections'],
      });
    },
    onError: (error: Error) => {
      console.error('Failed to delete connection:', error);
    },
  });

  const handleToggleStatus = (connection: GoogleSheetsConnection) => {
    toggleStatusMutation.mutate(connection.id);
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    deleteConnectionMutation.mutate(connectionId);
  };

  const handleNewConnection = () => {
    router.push('/dashboard/connections/new');
  };

  const handleOpenSettings = (connection: GoogleSheetsConnection) => {
    setSelectedConnection(connection);
    setShowSettingsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        );
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Loading connections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load connections</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-gray-400">
            Manage your external service integrations
          </p>
        </div>
        <Button onClick={handleNewConnection}>
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </Button>
      </div>

      {!connections || connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Connect your Google Sheets to automatically sync your expenses as
              you create them.
            </p>
            <Button onClick={handleNewConnection}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections?.map((connection) => (
            <Card key={connection.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{connection.name}</CardTitle>
                  {getStatusBadge(connection.status)}
                </div>
                <CardDescription>
                  {connection.worksheet_name} sheet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Last sync:</span>
                  <span>
                    {connection.last_sync_at
                      ? formatDate(connection.last_sync_at)
                      : 'Never'}
                  </span>
                </div>

                {connection.error_message && (
                  <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">
                      {connection.error_message}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(connection)}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {connection.status === 'active' ? (
                        <PowerOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Power className="w-4 h-4 text-green-500" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSettings(connection)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://docs.google.com/spreadsheets/d/${connection.spreadsheet_id}/edit`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                    disabled={deleteConnectionMutation.isPending}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedConnection && (
        <ConnectionSettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          connection={selectedConnection}
          onConnectionUpdated={() => {
            refetch();
            setShowSettingsDialog(false);
          }}
        />
      )}
    </div>
  );
}
