'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/app/_components/session-provider';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: {
    id: string;
    name: string;
    spreadsheet_id: string;
    worksheet_name: string;
    status: string;
    date_column: string | null;
    amount_column: string | null;
    description_column: string | null;
    category_column: string | null;
  };
  onConnectionUpdated: () => void;
}

interface ColumnHeaders {
  headers: string[];
}

export function ConnectionSettingsDialog({
  open,
  onOpenChange,
  connection,
  onConnectionUpdated,
}: ConnectionSettingsDialogProps) {
  const { session } = useSession();
  const [columnMappings, setColumnMappings] = useState({
    date: connection.date_column || 'Date',
    amount: connection.amount_column || 'Amount',
    description: connection.description_column || 'Description',
    category: connection.category_column || 'Category',
  });

  // Get available column headers from the worksheet
  const {
    data: columnHeaders,
    isLoading: loadingHeaders,
    error: headersError,
  } = useQuery({
    queryKey: [
      'column-headers',
      connection.spreadsheet_id,
      connection.worksheet_name,
    ],
    queryFn: async (): Promise<ColumnHeaders> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/spreadsheet/${connection.spreadsheet_id}/worksheet/${connection.worksheet_name}/headers`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch column headers');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: open,
  });

  // Update column mapping
  const updateMappingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/google-sheets/connections/${connection.id}/mapping`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session!.token}`,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date_column: columnMappings.date,
            amount_column: columnMappings.amount,
            description_column: columnMappings.description,
            category_column: columnMappings.category,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update column mapping');
      }

      return response.json();
    },
    onSuccess: () => {
      onConnectionUpdated();
    },
  });

  const handleSave = () => {
    updateMappingMutation.mutate();
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset to original values if not saved
    if (!updateMappingMutation.isSuccess) {
      setColumnMappings({
        date: connection.date_column || 'Date',
        amount: connection.amount_column || 'Amount',
        description: connection.description_column || 'Description',
        category: connection.category_column || 'Category',
      });
    }
  };

  const availableHeaders = columnHeaders?.headers || [];
  const hasChanges =
    columnMappings.date !== connection.date_column ||
    columnMappings.amount !== connection.amount_column ||
    columnMappings.description !== connection.description_column ||
    columnMappings.category !== connection.category_column;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#05060A]">
        <DialogHeader>
          <DialogTitle>Connection Settings</DialogTitle>
          <DialogDescription>
            Configure column mapping for "{connection.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Spreadsheet:</strong> {connection.name}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Worksheet:</strong> {connection.worksheet_name}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Status:</strong>{' '}
              <span
                className={`capitalize ${
                  connection.status === 'active'
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {connection.status}
              </span>
            </div>
          </div>

          {loadingHeaders && (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading column headers...</div>
            </div>
          )}

          {headersError && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                Failed to load column headers. Please check if the connection is
                still valid.
              </div>
            </div>
          )}

          {availableHeaders.length > 0 && (
            <>
              <div>
                <Label className="text-base font-medium">Column Mapping</Label>
                <div className="text-sm text-gray-600 mt-1">
                  Map your expense data to spreadsheet columns
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(columnMappings).map(
                  ([field, selectedColumn]) => (
                    <div key={field}>
                      <Label className="capitalize text-sm font-medium">
                        {field}
                      </Label>
                      <Select
                        value={selectedColumn}
                        onValueChange={(value) =>
                          setColumnMappings((prev) => ({
                            ...prev,
                            [field]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHeaders.map((header) => (
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

              {updateMappingMutation.isSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Column mapping updated successfully!
                  </span>
                </div>
              )}

              {updateMappingMutation.error && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">
                    Failed to update column mapping. Please try again.
                  </span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !hasChanges || loadingHeaders || updateMappingMutation.isPending
              }
            >
              {updateMappingMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
