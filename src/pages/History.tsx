import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Shield, 
  Trash2, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  ExternalLink 
} from 'lucide-react';
import { historyEngine } from '../services/history/historyEngine';
import type { HistoryRecord } from '../services/history/historyEngine';
import { findToolById } from '../toolRegistry';
import ToolSEO from '../components/tool/ToolSEO';

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(historyEngine.getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to permanently clear your activity history? This action is local and cannot be undone.')) {
      historyEngine.clearHistory();
      setHistory([]);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = history.filter(r => r.id !== id);
    setHistory(updated);
    localStorage.setItem('tooltari_history', JSON.stringify(updated));
  };

  // 1. Calculate cumulative statistics
  const totalRuns = history.length;
  const successRuns = history.filter(r => r.status === 'success').length;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;

  // Calculate bandwidth/storage saved (original size - output size)
  const totalSavedBytes = history.reduce((acc, curr) => {
    if (curr.status === 'success' && curr.fileSize && curr.outputSize) {
      const diff = curr.fileSize - curr.outputSize;
      return diff > 0 ? acc + diff : acc;
    }
    return acc;
  }, 0);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 2. Perform filtering
  const q = searchQuery.toLowerCase().trim();
  const filteredHistory = history.filter(r => {
    const matchesSearch = r.toolName.toLowerCase().includes(q) || r.fileName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <ToolSEO
        title="My Activity History - ToolTari"
        description="View your past secure tool runs, file compression stats, and data savings. 100% private in-browser local history logs."
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base/50 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
              <HistoryIcon className="h-8 w-8 text-primary" />
              Activity History
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              A private log of your browser-native operations. None of this data is sent online; it lives purely in your browser's local cache.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-xs font-bold text-danger hover:bg-danger/10 border border-danger/25 rounded-lg flex items-center gap-1.5 self-start md:self-center transition-smooth"
            >
              <Trash2 className="h-4 w-4" /> Clear All History
            </button>
          )}
        </div>

        {/* E-E-A-T Trust Panel */}
        <div className="p-4 bg-success/5 border border-success/20 rounded-xl text-text-secondary text-sm flex gap-3 items-start max-w-4xl">
          <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-text-primary">100% Private - Stored in localStorage</span>
            <p className="text-xs text-text-secondary leading-relaxed">
              This log is saved exclusively inside your browser's <code>localStorage</code> database. ToolTari servers never see, track, or store any of your files or logs. Clearing your cookies/cache or clicking the clear button will erase it forever.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          /* Empty State */
          <div className="bg-bg-surface border border-border-base rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 max-w-xl mx-auto shadow-small">
            <div className="p-4 bg-primary/10 text-primary rounded-full">
              <HistoryIcon className="h-10 w-10 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No Activity Logged Yet</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              You haven't run any tools on ToolTari in this browser session. Try converting images, compressing PDFs, or editing videos locally in RAM.
            </p>
            <Link
              to="/tools"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-xs shadow-medium flex items-center gap-1 mt-2 transition-smooth"
            >
              Explore Tools Directory <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Active State */
          <div className="flex flex-col gap-8">
            
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-bg-surface border border-border-base p-4 rounded-xl shadow-small flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Runs</span>
                <span className="text-2xl font-extrabold text-text-primary">{totalRuns}</span>
                <span className="text-[10px] text-text-muted">Operations executed in browser</span>
              </div>
              
              <div className="bg-bg-surface border border-border-base p-4 rounded-xl shadow-small flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Success Rate</span>
                <span className="text-2xl font-extrabold text-success">{successRate}%</span>
                <span className="text-[10px] text-text-muted">{successRuns} runs completed cleanly</span>
              </div>

              <div className="bg-bg-surface border border-border-base p-4 rounded-xl shadow-small flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Bandwidth Saved</span>
                <span className="text-2xl font-extrabold text-primary">{formatBytes(totalSavedBytes)}</span>
                <span className="text-[10px] text-text-muted">Disk space saved via compression</span>
              </div>

              <div className="bg-bg-surface border border-border-base p-4 rounded-xl shadow-small flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Privacy Saved Runs</span>
                <span className="text-2xl font-extrabold text-accent">{totalRuns} runs</span>
                <span className="text-[10px] text-text-muted">Zero documents exposed to servers</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search logs by tool or file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border-base focus:border-primary text-text-primary rounded-xl text-xs outline-none shadow-small"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-bg-surface border border-border-base text-text-primary rounded-xl text-xs outline-none shadow-small"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>

            {/* History Records List */}
            <div className="flex flex-col gap-4 max-w-4xl">
              {filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted font-semibold bg-bg-surface/30 rounded border border-dashed border-border-base">
                  No records match your search query or filters.
                </div>
              ) : (
                filteredHistory.map((record) => {
                  const toolEntry = findToolById(record.toolId);
                  const isExpanded = expandedRecordId === record.id;

                  return (
                    <div 
                      key={record.id} 
                      className={`bg-bg-surface border rounded-xl p-4 shadow-small flex flex-col gap-3 transition-smooth ${
                        record.status === 'success' 
                          ? 'border-border-base hover:border-primary/50' 
                          : 'border-danger/25 bg-danger/5'
                      }`}
                    >
                      {/* Top Header line */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={record.status === 'success' ? 'text-success' : 'text-danger'}>
                            {record.status === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </span>

                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-text-primary leading-tight flex items-center gap-1">
                              {record.toolName}
                              {toolEntry && (
                                <Link 
                                  to={toolEntry.slug}
                                  className="text-text-muted hover:text-primary transition-smooth ml-1"
                                  title="Run this tool again"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </span>
                            <span className="text-[10px] text-text-muted">{getRelativeTime(record.timestamp)}</span>
                          </div>
                        </div>

                        {/* Compression percentage savings tag */}
                        {record.status === 'success' && record.fileSize > 0 && record.outputSize && record.outputSize < record.fileSize && (
                          <span className="px-2.5 py-0.5 rounded bg-success/15 text-success text-[10px] font-extrabold uppercase">
                            -{Math.round(((record.fileSize - record.outputSize) / record.fileSize) * 100)}% Size
                          </span>
                        )}

                        {/* Trash Delete button */}
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1 text-text-muted hover:text-danger rounded hover:bg-bg-base/60 transition-smooth ml-auto"
                          title="Delete this record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* File Details section */}
                      <div className="text-[11px] text-text-secondary leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <span className="font-semibold text-text-muted">Input File:</span> {record.fileName}
                        </div>
                        <div>
                          <span className="font-semibold text-text-muted">Size:</span> {formatBytes(record.fileSize)}
                          {record.outputSize && record.outputSize > 0 && (
                            <> → <span className="font-semibold text-text-primary">{formatBytes(record.outputSize)}</span></>
                          )}
                        </div>
                      </div>

                      {/* Expandable Privacy/Security Benefits */}
                      <div className="border-t border-border-base/50 pt-2.5">
                        <button
                          onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 select-none"
                        >
                          {isExpanded ? 'Hide Processing Benefits' : 'Show Processing Benefits & Privacy Report'}
                        </button>

                        {isExpanded && (
                          <div className="flex flex-col gap-2 mt-2.5 p-3 bg-bg-base/40 rounded-xl border border-border-base/50 animate-fade-in text-xs text-text-secondary leading-relaxed">
                            {record.benefits.map((b, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {record.status === 'success' ? (
                                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-danger shrink-0" />
                                )}
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </>
  );
}
export { History };
