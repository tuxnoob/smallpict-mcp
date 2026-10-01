import { SmallPictClient } from '@smallpict/sdk';

let clientInstance: SmallPictClient | null = null;

export function getSmallPictClient(): SmallPictClient {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.SMALLPICT_API_KEY;
  const secretKey = process.env.SMALLPICT_SECRET_KEY;
  const baseUrl = process.env.SMALLPICT_BASE_URL || 'https://api.smallpict.app';

  if (!apiKey) {
    throw new Error(
      'Missing required environment variable SMALLPICT_API_KEY. Please provide SMALLPICT_API_KEY in MCP server configuration.'
    );
  }

  clientInstance = new SmallPictClient({
    apiKey,
    secretKey,
    baseUrl,
  });

  return clientInstance;
}
