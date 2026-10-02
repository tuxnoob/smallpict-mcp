import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { optimizeSchema, handleOptimize } from './tools/optimize.js';
import { quotaSchema, handleGetQuota } from './tools/quota.js';
import { purgeSchema, handlePurge } from './tools/purge.js';

const server = new McpServer({
  name: 'smallpict-mcp',
  version: '0.0.2',
});

// 1. Tool: Optimize Image
server.tool(
  'smallpict_optimize_image',
  'Compress and convert local or remote images (JPEG, PNG, GIF) into modern WebP/AVIF using SmallPict API with up to 85% bandwidth reduction',
  optimizeSchema,
  handleOptimize
);

// 2. Tool: Get Quota
server.tool(
  'smallpict_get_quota',
  'Inspect active SmallPict subscription plan, monthly bytes consumed, and remaining bandwidth quota',
  quotaSchema,
  handleGetQuota
);

// 3. Tool: Purge CDN Cache
server.tool(
  'smallpict_purge_cdn_cache',
  'Invalidate cached image URLs across Cloudflare Edge CDN PoPs',
  purgeSchema,
  handlePurge
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ [smallpict-mcp] Server running on stdio transport');
}

main().catch((error) => {
  console.error('❌ [smallpict-mcp] Fatal error:', error);
  process.exit(1);
});
