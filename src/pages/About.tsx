import ToolSEO from '../components/tool/ToolSEO';
import { Shield, Cpu, Zap, Landmark } from 'lucide-react';

export default function About() {
  return (
    <>
      <ToolSEO
        title="About Our Private Browser-Native Platform"
        description="Learn about ToolTari's local client-side processing design. We provide fast, secure, and completely free online PDF, image, developer, and text utilities."
      />

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-10">
        
        {/* About Header */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">About ToolTari</h1>
          <p className="text-sm text-slate-500">Revisiting file utilities with modern browser security standards.</p>
        </div>

        {/* Brand Mission Statement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800">Our Mission: Privacy Over Platforms</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most popular online PDF and image utilities operate on a remote upload architecture: you upload your file, a cloud server edits it, and you download the result. This exposes sensitive details, confidential financial logs, and legal text arrays to security breaches and database archiving.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            ToolTari was built to eliminate this security risk. By moving processing from remote cloud servers directly to the client browser sandbox, your files remain completely private. We never see, copy, or index your documents.
          </p>
        </div>

        {/* Technology Pillars */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-800">The Technology Pillars Behind ToolTari</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit shrink-0"><Cpu className="h-5 w-5" /></div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-slate-800 text-sm">WebAssembly Execution</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use modern WebAssembly runtimes to load high-performance C/C++ or JavaScript compilers inside your browser, executing complex transformations in sub-second speeds.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit shrink-0"><Shield className="h-5 w-5" /></div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-slate-800 text-sm">Security Sandbox</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All scripts execute inside your browser's security wrapper. They cannot access local files or network logs unless explicitly instructed, ensuring absolute file isolation.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit shrink-0"><Zap className="h-5 w-5" /></div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-slate-800 text-sm">No Waiting Queues</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Traditional web utilities queue your uploads during peak traffic times. ToolTari uses your local machine's multi-core CPU threads, guaranteeing immediate, zero-delay exports.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit shrink-0"><Landmark className="h-5 w-5" /></div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-slate-800 text-sm">GDPR & HIPAA Compliance</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Because no records or text payloads ever enter cloud databases, ToolTari is highly compliant with strict data safety protocols (GDPR, HIPAA, corporate security audits).
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
export { About };
