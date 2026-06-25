export type ProcessingPath = 'browser' | 'worker' | 'ocr-hybrid' | 'libreoffice-future';

export interface RouterDecision {
  path: ProcessingPath;
  description: string;
}

/**
 * Smart Processing Router - determines whether a tool should run client-side in the browser
 * or call the Cloudflare Workers API backend.
 */
export const processingRouter = {
  decide(toolId: string): RouterDecision {
    // 1. Browser-native local tools
    const localTools = [
      // PDF
      'merge-pdf', 'split-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf',
      'rotate-pdf', 'watermark-pdf', 'add-page-numbers', 'delete-pages', 'extract-pages',
      // Image
      'compress-image', 'resize-image', 'crop-image', 'image-converter',
      'rotate-image', 'image-filter', 'blur-image', 'watermark-image', 'image-metadata',
      // Developer & Utilities
      'base64-converter', 'image-to-base64', 'password-generator', 'password-strength',
      'random-number', 'color-converter', 'file-renamer', 'text-converter', 'word-counter',
      'zip-compressor', 'qr-generator', 'qr-scanner'
    ];

    if (localTools.includes(toolId)) {
      return {
        path: 'browser',
        description: 'Runs locally in browser RAM using sandboxed client scripts. 100% private.'
      };
    }

    // 2. Hybrid OCR tools (try local OCR first, fallback to Gemini OCR if it fails)
    if (toolId === 'ocr-pdf' || toolId === 'ocr-image' || toolId === 'image-to-text') {
      return {
        path: 'ocr-hybrid',
        description: 'Attempts local client OCR. If unsuccessful, fallbacks securely to cloud-assisted Gemini OCR.'
      };
    }

    // 3. AI-assisted Cloud Worker tools
    const aiTools = ['chat-pdf', 'ai-writer', 'ai-summarizer'];
    if (aiTools.includes(toolId)) {
      return {
        path: 'worker',
        description: 'Calls secure Cloudflare Workers API backend. Developer API keys remain hidden.'
      };
    }

    // 4. LibreOffice Heavy conversions (Future)
    const officeTools = ['word-to-pdf', 'excel-to-pdf', 'ppt-to-pdf'];
    if (officeTools.includes(toolId)) {
      return {
        path: 'libreoffice-future',
        description: 'Hooks into future queue routing for server-side LibreOffice compiler.'
      };
    }

    // Default to worker for safety
    return {
      path: 'worker',
      description: 'Routed to Cloudflare Worker backend api gateway.'
    };
  }
};
