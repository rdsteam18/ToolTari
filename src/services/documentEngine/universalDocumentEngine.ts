import type { ToolProcessor, ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { validatorEngine } from './validator';
import { analyzerEngine } from './analyzer';
import type { DocumentProfile } from './analyzer';
import { qualityEngine } from './quality';
import { downloadEngine } from './download';
import { registry } from '../operations/registry';
import { processingRouter } from '../../lib/processingRouter';

export class UniversalDocumentEngine implements ToolProcessor {
  /**
   * Phase 1: Shared and operation-specific validations
   */
  async validate(ctx: ProcessContext): Promise<void> {
    const { toolId } = ctx;
    
    // Resolve expected extensions based on toolId
    let expectedExtensions: string[] = [];
    if (toolId.includes('pdf')) {
      expectedExtensions = ['.pdf'];
    } else if (toolId.includes('image')) {
      expectedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'];
    }

    // 1. Shared validations (extensions, MIME, size, traversal limits, corruption checks)
    await validatorEngine.validate(ctx, expectedExtensions);

    // 2. Fetch mapping operation from Registry
    const operation = registry.getOperation(toolId);
    if (!operation) {
      throw new Error(`Universal Router Error: No operation registered for tool "${toolId}".`);
    }

    // 3. Delegate specific parameter validation to the operation module
    await operation.validate(ctx);
  }

  /**
   * Phase 2: Preprocess & Document Analysis
   */
  async preprocess(ctx: ProcessContext): Promise<ProcessContext> {
    const { files, onProgress } = ctx;
    
    if (files.length > 0) {
      onProgress?.(10, 'Running Document Analyzer...');
      
      const profiles: DocumentProfile[] = [];
      for (const file of files) {
        const profile = await analyzerEngine.analyze(file);
        profiles.push(profile);
        
        console.log(`Document Profile Generated for "${file.name}":`, {
          type: profile.type,
          size: profile.sizeReadable,
          pages: profile.pageCount,
          encrypted: profile.isEncrypted,
          orientation: profile.orientation
        });
      }

      // Attach profile metadata to options for operation usage
      ctx.options.documentProfiles = profiles;
    }

    // Future Queue Hooks: Initialize batch processing/queuing structures here if needed
    // e.g. initializeBackgroundQueue(ctx);

    return ctx;
  }

  /**
   * Phase 3: Operation Routing & Execution
   */
  async process(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, onProgress } = ctx;
    
    // Decide routing (Browser vs Workers vs Cloud OCR vs LibreOffice Future)
    const decision = processingRouter.decide(toolId);
    console.log(`Universal Processing Router decision for "${toolId}": ${decision.path} (${decision.description})`);

    // Handle future hooks / backend delegation
    if (decision.path === 'libreoffice-future') {
      onProgress?.(30, 'Connecting to LibreOffice worker...');
      // Simulated cloud worker hook. In future, this will dispatch a POST to Cloudflare Workers API
      throw new Error('LibreOffice Worker: Converting Office files to PDF is a Phase 2 cloud feature and is coming soon.');
    }

    // Resolve operation module from Registry
    const operation = registry.getOperation(toolId);
    if (!operation) {
      throw new Error(`Registry Error: No operation executor matches tool "${toolId}".`);
    }

    onProgress?.(30, `Executing operation: ${operation.name}...`);
    const result = await operation.execute(ctx);

    return result;
  }

  /**
   * Phase 4: Output Post-processing & Quality check
   */
  async postprocess(result: ProcessResult, ctx: ProcessContext): Promise<ProcessResult> {
    const { onProgress } = ctx;
    
    if (result.error) {
      return result;
    }

    onProgress?.(85, 'Running Output Quality Check...');
    
    // Validate output file integrity, magic bytes, and dimensions before packaging
    try {
      await qualityEngine.check(result);
    } catch (e: any) {
      console.error('Quality Engine rejected processing output:', e);
      return {
        error: e.message || 'Output quality checks failed.'
      };
    }

    // Memory cleanups (future Cloud Storage upload triggers go here)
    // e.g. uploadToCloudflareR2(result.blob);

    return result;
  }

  /**
   * Phase 5: Pack & Download Engine
   */
  async download(result: ProcessResult, ctx: ProcessContext): Promise<void> {
    const { onProgress } = ctx;
    if (result.error) return;

    onProgress?.(95, 'Preparing client-side packaging download...');
    await downloadEngine.triggerDownload(result);
  }
}

export const universalDocumentEngine = new UniversalDocumentEngine();
