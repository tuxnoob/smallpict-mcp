import { getSmallPictClient } from '../client.js';

export const quotaSchema = {};

export async function handleGetQuota() {
  const client = getSmallPictClient();

  console.error('[smallpict-mcp] Fetching SmallPict account quota...');
  const quota = await client.getQuota();

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: `### 📊 SmallPict Quota & Plan Status
- **Current Plan**: \`${quota.plan.toUpperCase()}\`
- **Monthly Usage**: ${formatBytes(quota.bytesUsed)} / ${formatBytes(quota.quotaLimit)} (**${quota.quotaPercentage}%**)
- **CDN Egress Used**: ${formatBytes(quota.cdnEgressUsedBytes || 0)}
- **Active API Keys**: ${quota.activeKeysCount ?? 'N/A'}
- **Registered Sites**: ${quota.activeSitesCount ?? 'N/A'}
`,
      },
    ],
  };
}
