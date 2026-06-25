import { findToolById } from '../../toolRegistry';

export interface HistoryRecord {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  outputSize?: number;
  status: 'success' | 'failed';
  benefits: string[];
}

export const historyEngine = {
  /**
   * Retrieves all logged history records from localStorage
   */
  getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem('tooltari_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse history:', e);
      return [];
    }
  },

  /**
   * Logs a new run record into localStorage with calculated privacy benefits
   */
  addRecord(record: {
    toolId: string;
    fileName: string;
    fileSize: number;
    outputSize?: number;
    status: 'success' | 'failed';
  }): void {
    try {
      const history = this.getHistory();
      const tool = findToolById(record.toolId);
      const toolName = tool ? tool.name : record.toolId;

      // Construct descriptive, privacy-centric benefit items based on run
      const benefits: string[] = [];
      benefits.push('100% Secure local processing in browser RAM');
      benefits.push('Zero files uploaded to remote servers');

      if (record.status === 'success') {
        if (record.fileSize > 0 && record.outputSize && record.outputSize > 0) {
          const savingsBytes = record.fileSize - record.outputSize;
          if (savingsBytes > 0) {
            const pct = Math.round((savingsBytes / record.fileSize) * 100);
            benefits.push(`Saved ${pct}% storage size (Reduced by ${this.formatBytes(savingsBytes)})`);
          } else {
            benefits.push('Layout and formatting optimized client-side');
          }
        } else {
          // Fallback category descriptions
          if (record.toolId.includes('pdf')) {
            benefits.push('Pages compiled and catalog objects updated locally');
          } else if (record.toolId.includes('image')) {
            benefits.push('Pixel frames rendered securely on HTML5 canvas');
          } else if (record.toolId.includes('video')) {
            benefits.push('Frames compiled client-side via hardware threads');
          } else if (record.toolId.includes('audio')) {
            benefits.push('Sample nodes normalized using Web Audio API');
          } else if (record.toolId === 'password-generator') {
            benefits.push('Cryptographically secure keys generated locally');
          } else {
            benefits.push('Inputs processed locally without network trace');
          }
        }
      } else {
        benefits.push('Execution stopped due to format limits or cancellation');
      }

      const newRecord: HistoryRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now(),
        toolName,
        benefits,
        ...record
      };

      // Cap logs size at 50 to keep localStorage payload tiny
      const updated = [newRecord, ...history].slice(0, 50);
      localStorage.setItem('tooltari_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write history record:', e);
    }
  },

  /**
   * Wipes all history logs
   */
  clearHistory(): void {
    localStorage.removeItem('tooltari_history');
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
