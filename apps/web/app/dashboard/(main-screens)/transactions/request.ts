import { env } from '@/env';

export interface QueueTransactionDeletionResponse {
  success: boolean;
  message: string;
  undo_token: string;
}

export const queueTransactionDeletionFunction = async (params: {
  transactionId: string;
  token: string;
}) => {
  const { transactionId, token } = params;

  return fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/transactions/${transactionId}/queue-deletion`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.json() as Promise<QueueTransactionDeletionResponse>)
    .catch((error) => {
      console.error(error);
      throw new Error('Ocurrió un error al eliminar la transacción');
    });
};

export const cancelTransactionDeletionFunction = async (params: {
  undoToken: string;
  token: string;
}) => {
  const { undoToken, token } = params;

  return fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/transactions/cancel-deletion/${undoToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.json())
    .catch((error) => {
      console.error(error);
      throw new Error(
        'Ocurrió un error al cancelar la eliminación de la transacción'
      );
    });
};
