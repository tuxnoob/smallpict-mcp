import { z } from 'zod';
import { getSmallPictClient } from '../client.js';

export const purgeSchema = {
  urls: z.array(z.string()).describe('List of asset URLs to invalidate on Cloudflare Edge CDN'),
  purgeType: z.enum(['url', 'all']).default('url').optional().describe('Purge scope: url or all (default: url)'),
};

export async function handlePurge(args: { urls: string[]; purgeType?: 'url' | 'all' }) {
  const client = getSmallPictClient();

  console.error(`[smallpict-mcp] Purging ${args.urls.length} asset(s) from CDN edge cache...`);
  const response = await client.purgeCdn({
    urls: args.urls,
    purgeType: args.purgeType || 'url',
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: `### 🚀 SmallPict CDN Cache Purged
- **Status**: \`success\`
- **Purged URLs**:
${args.urls.map((u) => `  - \`${u}\``).join('\n')}
- **Message**: ${response.message || 'Assets successfully purged from Cloudflare edge locations'}
`,
      },
    ],
  };
}
