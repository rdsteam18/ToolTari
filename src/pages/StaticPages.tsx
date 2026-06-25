import { Link } from 'react-router-dom';
import ToolSEO from '../components/tool/ToolSEO';
import { ShieldAlert, Terminal, EyeOff, AlertOctagon, HelpCircle, Activity } from 'lucide-react';

interface StaticPagesProps {
  slug: 'privacy-policy' | 'terms' | 'cookie-policy' | 'disclaimer' | 'security' | 'status' | '404';
}

export default function StaticPages({ slug }: StaticPagesProps) {
  const contents = {
    'privacy-policy': {
      title: "Privacy Policy",
      seoTitle: "Privacy Policy & GDPR Compliance Data Safety",
      desc: "Learn about ToolTari's browser-local data privacy standards. We process all documents in RAM and never store user payloads.",
      icon: <EyeOff className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>At ToolTari, privacy is not a feature; it is our foundation. We believe that you should never have to compromise the confidentiality of your documents, images, or development code to use modern productivity tools.</p>
        
        <h3>1. Complete Local Sandboxing</h3>
        <p>ToolTari operates as a 100% browser-native platform. When you merge PDFs, compress pictures, or format scripts, all data manipulations are performed on your local computer CPU using JavaScript and WebAssembly compiled engines. <strong>No file bytes, text records, or media headers are ever uploaded to ToolTari servers or third-party cloud engines.</strong></p>
        
        <h3>2. Volatile RAM Processing</h3>
        <p>All binary data loaded into our utility sandboxes is held temporarily in your browser's active RAM. As soon as you complete processing and download the output, or simply close the browser tab, the temporary memory buffers are completely wiped by the browser's garbage collection systems.</p>
        
        <h3>3. Minimal Analytical Metadata</h3>
        <p>We use standard analytical suites (such as Google Analytics) to capture generic, non-identifying user behavior metrics, such as monthly active visits, page bounce rates, device categories, and general geographical distributions. These logs never track file names, passwords, document data, or user credentials. You can opt-out of cookie tracking at any time by configuring your browser's security settings.</p>
        
        <h3>4. Absolute GDPR, HIPAA & CCPA Alignment</h3>
        <p>Since we do not collect, process, or store document payloads on remote servers, ToolTari is inherently compliant with strict international data protection laws:
          <ul>
            <li><strong>GDPR (EU)</strong>: We do not act as a data processor; no personal data transfers to third countries occur.</li>
            <li><strong>HIPAA (US)</strong>: Safe for processing patient medical charts, as zero Protected Health Information (PHI) leaves the host client.</li>
            <li><strong>CCPA (California)</strong>: We do not sell or share consumer data streams.</li>
          </ul>
        </p>
      `
    },
    'terms': {
      title: "Terms of Service",
      seoTitle: "Terms of Service & Usage Licensing Agreement",
      desc: "Terms of Service guidelines for ToolTari. Review our 100% free usage parameters and local client resource limits.",
      icon: <Terminal className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>Welcome to ToolTari. Please review our basic service parameters outlining usage rights and resource policies:</p>
        
        <h3>1. Open Access & Free Licensing</h3>
        <p>All utility engines, blog articles, category guides, and calculators hosted on ToolTari are 100% free for individual, educational, commercial, and enterprise workflows. There are no hidden subscription tiers, payment walls, registration requirements, or usage caps.</p>
        
        <h3>2. Client-Side Resource Limits</h3>
        <p>Because ToolTari executes compilation and conversion algorithms on the user's host threads, the performance, speed, and success of heavy processes (such as compiling 100MB PDF files or resizing batches of images) are directly constrained by the client computer's hardware specifications and browser heap memory limits. ToolTari is not liable for browser tab crashes or memory errors resulting from host hardware limits.</p>
        
        <h3>3. Acceptable Use Policy</h3>
        <p>Users may not attempt to reverse engineer, abuse, or script denial-of-service commands against our core UI interfaces. ToolTari reserves the right to employ rate-limiting on site requests to preserve server status for other users.</p>
      `
    },
    'cookie-policy': {
      title: "Cookie Policy",
      seoTitle: "Cookie Policy & Local Storage Options",
      desc: "Detailed breakdown of cookies and local storage tokens configured on ToolTari.",
      icon: <HelpCircle className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>ToolTari limits cookie configurations to essential session parameters to optimize layout and styling settings:</p>
        
        <h3>1. Essential Local Storage Tokens</h3>
        <p>To provide a smooth user experience, we use browser LocalStorage to persist preferences, such as selected layout options, light/dark styling settings, and code editor themes. These parameters remain strictly local to your browser and are never transmitted to our servers.</p>
        
        <h3>2. Analytical & Advertising Cookies</h3>
        <p>To sustain platform operations, we serve minimal advertising scripts (Google AdSense) and anonymous traffic metrics (Google Analytics). These services may set cookies to deliver tailored advertisements or evaluate general platform performance. You can block or remove these cookies using your browser's privacy configurations without any loss of tool functionality.</p>
      `
    },
    'disclaimer': {
      title: "Disclaimer Statement",
      seoTitle: "General Disclaimer & Liability Exclusions",
      desc: "Read our general disclaimer guidelines. ToolTari processing is provided as-is with no warranty.",
      icon: <AlertOctagon className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>Please read this general disclaimer outlining operations, warranties, and liability boundaries:</p>
        
        <h3>1. As-Is Operational Policy</h3>
        <p>The PDF, image, developer, and text utilities hosted on ToolTari are provided "as-is" and "as-available" without any express or implied warranty of perfect conversion, formatting preservation, or system uptime. While we build our engines using robust libraries, document parsing is highly complex, and layout anomalies may occasionally occur.</p>
        
        <h3>2. Liability Exclusions</h3>
        <p>ToolTari assumes no liability or responsibility for any direct or indirect data loss, file corruption, visual format shifts, or project delays arising from your use of this website. Users are highly encouraged to maintain backups of all original documents before executing local browser conversions.</p>
      `
    },
    'security': {
      title: "Security Framework & Verification Guide",
      seoTitle: "Technical Security Architecture & Client-Side Sandboxing",
      desc: "Read our detailed browser-native security framework. Complete data containment and local auditing guidelines.",
      icon: <ShieldAlert className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>ToolTari enforces a zero-trust architecture to deliver complete file isolation. Here is a breakdown of our technical security safeguards and how you can audit them yourself:</p>
        
        <h3>1. Isolated Browser Sandboxing</h3>
        <p>All file parsing, decompression, and manipulation algorithms operate within isolated browser Web Worker threads. This containerized execution prevents document code from interacting with external scripts, blocking unauthorized cross-origin data extraction and corporate leakage.</p>
        
        <h3>2. Zero Server Transmission</h3>
        <p>We do not route binary payloads across the internet. Unlike traditional web services that upload your PDFs or photos to a remote cloud server for processing, ToolTari reads file structures locally as an in-memory <code>ArrayBuffer</code>. Your confidential business agreements, financial statements, and personal photos never leave your machine.</p>
        
        <div class="p-5 my-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <h4 class="font-extrabold text-slate-800 text-sm mb-2 flex items-center gap-1.5 select-none">
            <i class="fas fa-user-shield text-indigo-500"></i> How to Audit ToolTari's Data Safety (F12 Audit)
          </h4>
          <p class="text-xs text-slate-500 leading-relaxed mb-3">
            We encourage developers, corporate compliance auditors, and privacy-conscious users to verify our local processing using standard browser developer tools:
          </p>
          <ol class="list-decimal pl-5 text-xs text-slate-600 space-y-2">
            <li>Right-click anywhere on the tool page and choose <strong>Inspect</strong> (or press <strong>F12</strong> / <strong>Ctrl+Shift+I</strong>).</li>
            <li>Select the <strong>Network</strong> tab at the top of the developer console.</li>
            <li>Launch any tool (e.g., select the <em>PDF Compressor</em>, drag and drop a test PDF document, and adjust parameters).</li>
            <li>Click <strong>Run Processing Engine</strong> / <strong>Download</strong> to execute the conversion.</li>
            <li>Observe the list of network streams in the log. You will verify that <strong>zero outbound payloads or file upload streams are transmitted</strong>. All processing is 100% contained within your local sandbox.</li>
          </ol>
        </div>
      `
    },
    'status': {
      title: "System Status Directory",
      seoTitle: "System Status & Tool Availability Indicators",
      desc: "Real-time system availability and status reports for ToolTari utility engines.",
      icon: <Activity className="h-10 w-10 text-indigo-500" />,
      html: `
        <p>Check the availability of our browser-native processing suites. Since conversions run locally in your browser, platform uptime only requires static server delivery of our assets via global CDN edge caches:</p>
        
        <div class="p-4 my-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-800 text-sm select-none">
          <strong>🟢 All Client Systems Operational:</strong> HTML5 engines, layout styles, routing, and search indexes are running at 100% availability.
        </div>
        
        <h3>Local Processing Engines Health</h3>
        <ul class="text-slate-600 space-y-2.5 text-xs mt-3 select-none">
          <li class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <strong>PDF Tools Engine (pdf-lib, pdfjs):</strong> Available (100% online)
          </li>
          <li class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <strong>Image Compression Engine (HTML5 Canvas):</strong> Available (100% online)
          </li>
          <li class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <strong>Developer Tools (Base64, Passwords):</strong> Available (100% online)
          </li>
          <li class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <strong>Text Converter Suite:</strong> Available (100% online)
          </li>
        </ul>
      `
    },
    '404': {
      title: "Page Not Found",
      seoTitle: "404 Page Not Found",
      desc: "The URL path you entered does not exist on ToolTari. Search our tools directory to find your page.",
      icon: <ShieldAlert className="h-10 w-10 text-red-500 animate-bounce" />,
      html: `
        <p>We apologize, but the URL path you entered does not exist or has been restructured in our react refactor.</p>
        <p>Please browse our category directory or search for tools on our homepage catalog.</p>
      `
    }
  };

  const page = contents[slug];

  return (
    <>
      <ToolSEO title={page.seoTitle} description={page.desc} />

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="p-3 bg-indigo-50/50 rounded-2xl">{page.icon}</div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{page.title}</h1>
          </div>

          <div
            className="prose prose-indigo max-w-none text-sm text-slate-600 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />

          {slug === '404' && (
            <div className="flex items-center gap-4 mt-6">
              <Link to="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-smooth shadow-md">
                Return to Home
              </Link>
              <Link to="/tools" className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-sm transition-smooth border border-slate-200 shadow-sm">
                Browse Tools Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export { StaticPages };
