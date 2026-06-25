import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';

export interface DocumentOperation {
  id: string; // matches toolId (e.g. 'merge-pdf', 'compress-image')
  name: string;
  validate(ctx: ProcessContext): Promise<void> | void;
  execute(ctx: ProcessContext): Promise<ProcessResult> | ProcessResult;
}
