import { env } from '../env';
import { sendMessage } from '../lib/tools/whatsapp';

interface handleErrorParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  userId?: string;
  endpoint: string;
  message: string;
}

export const handleError = async (params: handleErrorParams) => {
  const { error, userId, endpoint, message } = params;

  console.log(error);
  console.log(`Error at ${endpoint}: ${error} for user ${userId}`);

  await sendMessage(
    env.WHATSAPP_ADMIN_NUMBER,
    `Error at ${endpoint}: ${error} for user ${userId}\n` +
      `Message: ${message}`
  );

  /* if (error instanceof TRPCError) {
    return error;
  } else {
    await sendMessage(
      env.WHATSAPP_ADMIN_NUMBER,
      `Error at ${endpoint}: ${error} for user ${userId}`
    );

    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: message,
    });
  } */
};
