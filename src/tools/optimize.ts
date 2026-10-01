import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSmallPictClient } from '../client.js';

export const optimizeSchema = {
  filePath: z.string().describe('Local file path or remote image URL (http/https) to optimize'),
  format: z.enum(['webp', 'avif', 'auto']).default('webp').describe('Target image format (webp, avif, or auto)'),
  quality: z.number().min(1).max(100).default(80).optional().describe('Compression quality (1-100, default: 80)'),
  maxWidth: z.number().positive().optional().describe('Optional maximum width in pixels for image resizing'),
  maxHeight: z.number().positive().optional().describe('Optional maximum height in pixels for image resizing'),
  outputPath: z.string().optional().describe('Optional local path where the optimized image should be saved'),
};

function detectMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    case '.gif':
      return 'image/gif';
    case '.jpg':
    case '.jpeg':
    default:
      return 'image/jpeg';
  }
}

export async function handleOptimize(args: {
  filePath: string;
  format?: 'webp' | 'avif' | 'auto';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputPath?: string;
}) {
  const client = getSmallPictClient();
  const format = args.format || 'webp';
  const quality = args.quality ?? 80;

  console.error(`[smallpict-mcp] Optimizing image: ${args.filePath} -> ${format} (q=${quality})`);

  let isRemote = args.filePath.startsWith('http://') || args.filePath.startsWith('https://');
  let source: string | Uint8Array;
  let filename = path.basename(args.filePath);
  let mimeType = detectMimeType(args.filePath);

  if (isRemote) {
    source = args.filePath;
  } else {
    const resolvedPath = path.resolve(process.cwd(), args.filePath);
    const fileBuffer = await fs.readFile(resolvedPath);
    source = new Uint8Array(fileBuffer);
    filename = path.basename(resolvedPath);
    mimeType = detectMimeType(resolvedPath);
  }

  const result = await client.optimize(source, {
    filename,
    mimeType,
    format,
    quality,
    maxWidth: args.maxWidth,
    maxHeight: args.maxHeight,
  });

  let savedMessage = '';
  if (args.outputPath && result.url) {
    const targetPath = path.resolve(process.cwd(), args.outputPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    console.error(`[smallpict-mcp] Downloading optimized image from ${result.url} to ${targetPath}`);
    const res = await fetch(result.url);
    if (!res.ok) {
      throw new Error(`Failed to download optimized asset from ${result.url}: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
    savedMessage = `\n- **Saved to**: \`${targetPath}\``;
  }

  const formattedOriginal = (result.originalSize / 1024).toFixed(1) + ' KB';
  const formattedCompressed = (result.compressedSize / 1024).toFixed(1) + ' KB';

  return {
    content: [
      {
        type: 'text' as const,
        text: `### ✅ SmallPict Image Optimization Succeeded
- **File**: \`${filename}\`
- **Output Format**: \`${result.format}\`
- **Original Size**: ${formattedOriginal}
- **Optimized Size**: ${formattedCompressed}
- **Bandwidth Savings**: **-${result.savingsPercentage}%** (${((result.bytesSaved) / 1024).toFixed(1)} KB saved)
- **Job ID**: \`${result.jobId}\`
- **CDN Delivery URL**: ${result.url || 'N/A'}${savedMessage}
`,
      },
    ],
  };
}
