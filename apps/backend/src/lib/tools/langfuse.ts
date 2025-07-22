import { Langfuse } from 'langfuse';
import { env } from '../../env';

const langfuse = new Langfuse({
  secretKey: env.LANGFUSE_SECRET_KEY,
  publicKey: env.LANGFUSE_PUBLIC_KEY,
  baseUrl: 'https://us.cloud.langfuse.com'
});

export default langfuse;
