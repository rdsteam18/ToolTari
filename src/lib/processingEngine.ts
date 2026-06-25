export interface ProcessContext {
  toolId: string;
  files: File[];
  options: Record<string, any>;
  onProgress?: (percent: number, message: string) => void;
}

export interface ProcessResult {
  blob?: Blob;
  outputName?: string;
  blobs?: Array<{ blob: Blob; name: string }>;
  data?: any; // For tools returning string data (like password gen or converters)
  error?: string;
}

export interface ToolProcessor {
  validate(ctx: ProcessContext): Promise<void> | void;
  preprocess(ctx: ProcessContext): Promise<ProcessContext> | ProcessContext;
  process(ctx: ProcessContext): Promise<ProcessResult> | ProcessResult;
  postprocess(result: ProcessResult, ctx: ProcessContext): Promise<ProcessResult> | ProcessResult;
  download(result: ProcessResult, ctx: ProcessContext): Promise<void> | void;
}

// A base implementation that tools can extend or implement
export class BaseToolProcessor implements ToolProcessor {
  validate(ctx: ProcessContext): void {
    // Default validation: Ensure files are selected if required
    const noFileTools = ['password-generator', 'base64-converter', 'text-converter', 'word-counter'];
    if (ctx.files.length === 0 && !noFileTools.includes(ctx.toolId)) {
      throw new Error('Please select at least one file to process.');
    }
  }

  preprocess(ctx: ProcessContext): ProcessContext | Promise<ProcessContext> {
    return ctx;
  }

  async process(_ctx: ProcessContext): Promise<ProcessResult> {
    throw new Error('Method not implemented.');
  }

  postprocess(result: ProcessResult, _ctx: ProcessContext): ProcessResult | Promise<ProcessResult> {
    return result;
  }

  async download(result: ProcessResult, _ctx: ProcessContext): Promise<void> {
    if (result.blob && result.outputName) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Runner function that executes the Validate -> Preprocess -> Process -> Postprocess -> Download flow
 */
export async function runToolProcessor(
  processor: ToolProcessor,
  context: ProcessContext
): Promise<ProcessResult> {
  try {
    // 1. Validate
    context.onProgress?.(5, 'Validating inputs...');
    await processor.validate(context);

    // 2. Preprocess
    context.onProgress?.(15, 'Preparing data...');
    const preprocessedCtx = await processor.preprocess(context);

    // 3. Process
    context.onProgress?.(35, 'Processing files in memory...');
    let result = await processor.process(preprocessedCtx);

    if (result.error) {
      throw new Error(result.error);
    }

    // 4. Postprocess
    context.onProgress?.(90, 'Applying final touches...');
    result = await processor.postprocess(result, preprocessedCtx);

    context.onProgress?.(100, 'Process complete!');
    return result;
  } catch (err: any) {
    console.error(`Processing error in tool ${context.toolId}:`, err);
    return {
      error: err.message || 'An error occurred during processing.'
    };
  }
}
