# @smallpict/mcp

Official **Model Context Protocol (MCP)** server for [SmallPict](https://smallpict.app), the high-performance image optimization and AVIF/WebP transcoding platform.

This MCP server equips AI coding assistants (such as **Claude Desktop**, **Cursor**, **Windsurf**, and **Antigravity**) with direct capabilities to compress, transcode, and maintain web image assets.

---

## Capabilities / Tools

1. **`smallpict_optimize_image`**:
   - Compresses local image files or remote URLs to **WebP** or **AVIF**.
   - Supports **Lossy** (`quality: 1-100`) and **Lossless** (`lossless: true`) modes.
   - Downscaling constraints: `maxDimension` (longest edge), `maxWidth`, and `maxHeight`.
   - Automatically writes the optimized image back to the workspace if `outputPath` is provided.
   - Outputs full telemetry: original size, compressed size, and percentage saved (up to 85%).
2. **`smallpict_get_quota`**:
   - Inspects the account's active plan, processed bytes, and remaining monthly quota.
3. **`smallpict_purge_cdn_cache`**:
   - Invalidates cached asset URLs on Cloudflare Edge CDN PoPs globally.

---

## Installation & Setup

### 1. Build from Source
```bash
cd /Users/ariefjr/Documents/hermoves-id/wordpres-plugins/smallpict-mcp
npm install
npm run build
```

### 2. Configure in Claude Desktop
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "smallpict": {
      "command": "node",
      "args": ["/Users/ariefjr/Documents/hermoves-id/wordpres-plugins/smallpict-mcp/dist/index.js"],
      "env": {
        "SMALLPICT_API_KEY": "sp_sdk_live_...",
        "SMALLPICT_SECRET_KEY": "sp_sec_..."
      }
    }
  }
}
```

### 3. Configure in Cursor (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "smallpict": {
      "command": "node",
      "args": ["/Users/ariefjr/Documents/hermoves-id/wordpres-plugins/smallpict-mcp/dist/index.js"],
      "env": {
        "SMALLPICT_API_KEY": "sp_sdk_live_...",
        "SMALLPICT_SECRET_KEY": "sp_sec_..."
      }
    }
  }
}
```

---

## Environment Variables
- `SMALLPICT_API_KEY` (Required): Your API key (`sp_sdk_...` or sandbox evaluation key `sp_test_...`).
- `SMALLPICT_SECRET_KEY` (Required for HMAC): Your API secret key.
- `SMALLPICT_BASE_URL` (Optional): API endpoint URL (default: `https://api.smallpict.app`).
