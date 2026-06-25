import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Clock, ArrowLeft, ArrowRight, Shield, 
  CheckCircle, Scale, AlertTriangle, BookOpen, 
  Wrench, Check, Award
} from 'lucide-react';
import blogData from '../data/blog.json';
import blogContent from '../data/blog_content.json';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { FAQ } from '../components/ui/FAQ';
import ToolSEO from '../components/tool/ToolSEO';
import { CLUSTERS_DATA } from '../data/clusters';

interface BlogPostMeta {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  keywords: string[];
  date: string;
  readTime: string;
  featured: boolean;
  image: string;
  type?: string;
  cluster?: string;
  author?: string;
  version?: string;
  publishedDate?: string;
  updatedDate?: string;
}

// Global Internal Keyword-to-Link Dictionary
const KEYWORDS_MAP: Record<string, string> = {
  "merge pdf": "/tools/merge-pdf.html",
  "split pdf": "/tools/split-pdf.html",
  "compress pdf": "/tools/compress-pdf.html",
  "protect pdf": "/tools/protect-pdf.html",
  "unlock pdf": "/tools/unlock-pdf.html",
  "compress image": "/tools/compress-image.html",
  "resize image": "/tools/resize-image.html",
  "crop image": "/tools/crop-image.html",
  "image converter": "/tools/image-converter.html",
  "base64 converter": "/tools/base64-converter.html",
  "password generator": "/tools/password-generator.html",
  "password strength checker": "/tools/password-strength.html",
  "zip compressor": "/tools/zip-compressor.html",
  "pdf tools": "/pdf-tools",
  "image tools": "/image-tools",
  "developer tools": "/developer-tools",
  "text tools": "/text-tools",
  "pdf": "/pdf-tools",
  "ocr": "/blog/what-is-ocr"
};

// -------------------------------------------------------------
// 1. DYNAMIC INTERNAL LINKING ENGINE
// -------------------------------------------------------------
const applyInternalLinking = (html: string): string => {
  if (!html) return '';
  // Split HTML string by tags to safely replace text nodes only
  const tokens = html.split(/(<[^>]+>)/g);
  const sortedKeywords = Object.keys(KEYWORDS_MAP).sort((a, b) => b.length - a.length);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token && !token.startsWith('<')) {
      let text = token;
      
      // Look back to verify we are not inside an existing <a> tag
      let insideAnchor = false;
      for (let j = i - 1; j >= 0; j--) {
        if (tokens[j].startsWith('<a ') || tokens[j].startsWith('<Link ')) {
          insideAnchor = true;
          break;
        }
        if (tokens[j].startsWith('</a') || tokens[j].startsWith('</Link')) {
          insideAnchor = false;
          break;
        }
      }

      if (!insideAnchor) {
        for (const keyword of sortedKeywords) {
          const url = KEYWORDS_MAP[keyword];
          const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
          text = text.replace(regex, `<a href="${url}" class="text-indigo-600 font-bold hover:underline">$1</a>`);
        }
        tokens[i] = text;
      }
    }
  }

  return tokens.join('');
};

// -------------------------------------------------------------
// 2. TEMPLATE RENDER COMPONENTS
// -------------------------------------------------------------

// A. How-To Template
interface HowToProps {
  steps: { step: number; title: string; desc: string }[];
  example?: string;
  relatedToolId?: string;
  bestPractices?: string[];
  commonMistakes?: string[];
  summary?: string;
}
function HowToTemplate({ steps, example, relatedToolId, bestPractices, commonMistakes, summary }: HowToProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const getToolUrl = (id: string) => {
    return `/tools/${id}.html`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Steps List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 select-none">
          <Clock className="h-5 w-5 text-indigo-500" /> Step-by-Step Instructions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {steps.map(s => (
            <div 
              key={s.step} 
              onClick={() => toggleStep(s.step)}
              className={`p-4 border rounded-xl flex gap-4 cursor-pointer select-none transition-smooth ${
                completedSteps[s.step] 
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/30'
              }`}
            >
              <button 
                className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border transition-smooth ${
                  completedSteps[s.step] 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-bold transition-smooth ${completedSteps[s.step] ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                  Step {s.step}: {s.title}
                </span>
                <p className={`text-xs leading-relaxed transition-smooth ${completedSteps[s.step] ? 'text-slate-400' : 'text-slate-500'}`}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Example Box */}
      {example && (
        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col gap-2">
          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider select-none">Practical Scenario Example</h4>
          <p className="text-sm text-slate-600 leading-relaxed italic">"{example}"</p>
        </div>
      )}

      {/* Action CTA Block */}
      {relatedToolId && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none">
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Interactive Client Utility</span>
            <h4 className="font-bold text-base">Execute this process inside your browser</h4>
          </div>
          <Link 
            to={getToolUrl(relatedToolId)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-smooth shadow-md"
          >
            Open Integrated Tool <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Best Practices & Mistakes Grid */}
      {(bestPractices || commonMistakes) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          {bestPractices && (
            <div className="p-5 border border-emerald-100 bg-emerald-50/10 rounded-2xl flex flex-col gap-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Best Practices
              </span>
              <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                {bestPractices.map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
            </div>
          )}
          {commonMistakes && (
            <div className="p-5 border border-red-100 bg-red-50/10 rounded-2xl flex flex-col gap-3">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Common Mistakes
              </span>
              <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                {commonMistakes.map((cm, i) => <li key={i}>{cm}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            <strong>Conclusion:</strong> {summary}
          </p>
        </div>
      )}
    </div>
  );
}

// B. Comparison Template
interface ComparisonProps {
  table: { headers: string[]; rows: string[][] };
  pros: { item: string; pros: string[] }[];
  cons: { item: string; cons: string[] }[];
  recommendation?: string;
  summary?: string;
}
function ComparisonTemplate({ table, pros, cons, recommendation, summary }: ComparisonProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Dynamic Comparison Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 select-none">
          <Scale className="h-5 w-5 text-indigo-500" /> Comparison Analysis
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold select-none">
                {table.headers.map((h, i) => (
                  <th key={i} className="p-3 md:p-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {table.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition-smooth">
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 md:p-4 leading-relaxed">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pros & Cons Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 select-none">
        {/* Pros */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-base">Key Benefits</h3>
          {pros.map((p, idx) => (
            <div key={idx} className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-emerald-600">{p.item} Pros</span>
              <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                {p.pros.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Cons */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-base">Drawbacks & Limits</h3>
          {cons.map((c, idx) => (
            <div key={idx} className="p-4 bg-red-50/10 border border-red-100 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-red-600">{c.item} Cons</span>
              <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                {c.cons.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Panel */}
      {recommendation && (
        <div className="p-6 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-col gap-2 shadow-sm select-none">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Our Technical Verdict</h4>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            <strong>Summary:</strong> {summary}
          </p>
        </div>
      )}
    </div>
  );
}

// C. Troubleshooting Template
interface TroubleshootingProps {
  issues: { problem: string; cause: string; solution: string }[];
  diagnostics?: string[];
  summary?: string;
}
function TroubleshootingTemplate({ issues, diagnostics, summary }: TroubleshootingProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Common Faults Mapping */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 select-none">
          <Wrench className="h-5 w-5 text-indigo-500" /> Diagnosis & Fail-Safes
        </h2>
        <div className="flex flex-col gap-4">
          {issues.map((iss, i) => (
            <div key={i} className="p-5 border border-slate-200 rounded-2xl bg-white flex flex-col gap-3 shadow-sm select-none">
              <div className="flex items-start gap-2.5">
                <div className="p-1 bg-red-50 text-red-500 rounded shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">{iss.problem}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Root Cause</span>
                  <p className="text-slate-500 leading-relaxed">{iss.cause}</p>
                </div>
                <div className="flex flex-col gap-0.5 p-2 bg-emerald-50/20 border border-emerald-100 rounded-lg">
                  <span className="font-bold text-emerald-600 uppercase tracking-wider text-[9px]">Local Fix</span>
                  <p className="text-slate-600 leading-relaxed font-medium">{iss.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics Guidelines */}
      {diagnostics && (
        <div className="p-5 border border-indigo-100 bg-indigo-50/10 rounded-2xl flex flex-col gap-3 select-none">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-4 w-4" /> Diagnostic Checklist
          </span>
          <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
            {diagnostics.map((diag, i) => <li key={i}>{diag}</li>)}
          </ul>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            <strong>Conclusion:</strong> {summary}
          </p>
        </div>
      )}
    </div>
  );
}

// D. Glossary Template
interface GlossaryProps {
  term: string;
  phonetic?: string;
  synonyms?: string[];
  keyRelationships?: { term: string; relationship: string }[];
  summary?: string;
}
function GlossaryTemplate({ term, phonetic, synonyms, keyRelationships, summary }: GlossaryProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Vocabulary Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col gap-4 shadow-md select-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black">{term}</h2>
            {phonetic && <span className="font-mono text-slate-400 text-xs tracking-wider">{phonetic}</span>}
          </div>
        </div>

        {synonyms && synonyms.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center text-xs mt-1">
            <span className="text-slate-400 font-bold">Synonyms:</span>
            {synonyms.map((s, i) => (
              <span key={i} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-semibold">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Entity Map Relationship visual */}
      {keyRelationships && keyRelationships.length > 0 && (
        <div className="flex flex-col gap-3 select-none">
          <h3 className="font-bold text-slate-800 text-base">Key Connections</h3>
          <div className="flex flex-col gap-3">
            {keyRelationships.map((r, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-indigo-200 transition-smooth">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                    {r.term.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{r.term}</span>
                    <span className="text-[10px] text-slate-400 truncate">{r.relationship}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            <strong>Definition Summary:</strong> {summary}
          </p>
        </div>
      )}
    </div>
  );
}

// E. Cluster Navigation Map visualizer
interface ClusterMapProps {
  clusterId: string;
  currentPostId: string;
}
function ClusterMap({ clusterId, currentPostId }: ClusterMapProps) {
  const cluster = CLUSTERS_DATA[clusterId];
  if (!cluster) return null;

  return (
    <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-4 select-none">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Topical Authority Network</span>
        <h4 className="font-extrabold text-slate-800 text-base">Content Cluster Mapping</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-xs">
        {/* Mapped active tools */}
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-200 pb-1">Cluster Utilities</span>
          <div className="flex flex-col gap-1.5">
            {cluster.tools.map((t, i) => (
              <Link 
                key={i} 
                to={t.url} 
                className="flex items-center justify-between p-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg hover:shadow-sm transition-smooth font-semibold text-slate-700"
              >
                <span>{t.title}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Guides & Comparisons in cluster */}
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-200 pb-1">Related Knowledge Nodes</span>
          <div className="flex flex-col gap-1.5">
            {[...cluster.guides, ...cluster.comparisons].slice(0, 4).map((c, i) => {
              const isActive = c.url.includes(currentPostId);
              return (
                <Link 
                  key={i} 
                  to={c.url} 
                  className={`flex items-center justify-between p-2 border rounded-lg transition-smooth font-semibold ${
                    isActive 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-50/80' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:shadow-sm'
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  {isActive ? (
                    <span className="text-[8px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0">Active</span>
                  ) : (
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function BlogPost() {
  const { postId } = useParams<{ postId: string }>();

  // Find post metadata
  const postMeta = (blogData as BlogPostMeta[]).find(p => p.id === postId);

  if (!postMeta) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center select-none">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Article Not Found</h1>
        <p className="text-slate-500 mb-6">The guide you are looking for does not exist or has been restructured.</p>
        <Link to="/blog" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-smooth">
          Return to Blog
        </Link>
      </div>
    );
  }

  // Load content
  const content = (blogContent as Record<string, any>)[postMeta.id];

  const breadcrumbs = [
    { name: "Blog", url: "/blog" },
    { name: postMeta.title }
  ];

  // Dynamic Keyword Linking applied to the main HTML content block
  const linkedHTML = content?.mainContent 
    ? applyInternalLinking(content.mainContent) 
    : content?.body 
      ? applyInternalLinking(content.body) 
      : '';

  // Schema.org metadata
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postMeta.title,
    "description": postMeta.description,
    "datePublished": postMeta.publishedDate || postMeta.date,
    "dateModified": postMeta.updatedDate || postMeta.date,
    "author": {
      "@type": "Person",
      "name": postMeta.author || "Rajput Devdhar Singh",
      "url": "https://tooltari.in/authors/rajput-devdhar-singh"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolTari",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blogger.googleusercontent.com/img/a/AVvXsEjY2rjUWolqqXCrlJIvA8jXQqcUBMVsqEQq9CziuNUqzhW3Asha4BTbHljQobuky8iF9DmcKIdydU5HaxXso3sUI5HrxtlHUPTvp_VBFAoxwzOp8ka_H0Uqfdj2Ns_OSSqmww7c8mV_EuvIRxCy0udJTufLUj0phIkLXnrys4NCSPA7YBrZJa_LGH8A"
      }
    }
  };

  return (
    <>
      <ToolSEO
        title={postMeta.title}
        description={postMeta.description}
        ogType="article"
        schema={schema}
      />

      <div className="max-w-4xl mx-auto px-4 pb-16">
        
        {/* Navigation Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-smooth mb-6 select-none">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Knowledge Hub
        </Link>

        {/* Article Container */}
        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col gap-8">
          
          {/* Header block */}
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6">
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {postMeta.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400 select-none">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published: {postMeta.publishedDate || postMeta.date}</span>
              {postMeta.updatedDate && (
                <span className="text-indigo-500">Updated: {postMeta.updatedDate}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {postMeta.readTime}</span>
              <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                {postMeta.category}
              </span>
              <span className="text-[10px] text-slate-300">Version: {postMeta.version || '1.0'}</span>
            </div>

            {/* Author trust E-E-A-T Badge */}
            <div className="mt-2 p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center gap-2.5 select-none">
              <Award className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="text-[10px] text-slate-500 leading-relaxed">
                Written by{' '}
                {postMeta.author === 'Rajput Devdhar Singh' ? (
                  <Link to="/authors/rajput-devdhar-singh" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                    Rajput Devdhar Singh
                  </Link>
                ) : (
                  <span className="font-bold text-slate-700">{postMeta.author || 'ToolTari Technical Team'}</span>
                )}{' '}
                · Fact-checked & approved by the ToolTari Editorial Board.
              </div>
            </div>
          </header>

          {/* AdSense Top Ad Slot */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center text-xs text-slate-400 select-none">
            <i className="fas fa-ad mr-1"></i> Google AdSense Placeholder (Top Content)
          </div>

          {/* Definition (AEO / GEO featured snippet text block) */}
          {content?.definition && (
            <div className="p-4 bg-indigo-50/20 border-l-4 border-indigo-500 rounded-r-xl text-xs md:text-sm text-slate-700 leading-relaxed font-semibold italic">
              {content.definition}
            </div>
          )}

          {/* Render linkedHTML body content */}
          {linkedHTML && (
            <div
              className="prose prose-indigo max-w-none text-xs md:text-sm text-slate-600 leading-relaxed space-y-4 blog-post-body"
              dangerouslySetInnerHTML={{ __html: linkedHTML }}
            />
          )}

          {/* 3. DYNAMIC TEMPLATE RENDER BLOCK */}
          {content?.type === 'how-to' && content.steps && (
            <HowToTemplate 
              steps={content.steps} 
              example={content.example} 
              relatedToolId={content.relatedToolId}
              bestPractices={content.bestPractices}
              commonMistakes={content.commonMistakes}
              summary={content.summary}
            />
          )}

          {content?.type === 'comparison' && content.comparisonTable && (
            <ComparisonTemplate 
              table={content.comparisonTable} 
              pros={content.pros} 
              cons={content.cons} 
              recommendation={content.recommendation}
              summary={content.summary}
            />
          )}

          {content?.type === 'troubleshooting' && content.issues && (
            <TroubleshootingTemplate 
              issues={content.issues} 
              diagnostics={content.diagnostics} 
              summary={content.summary}
            />
          )}

          {content?.type === 'glossary' && (
            <GlossaryTemplate 
              term={content.term} 
              phonetic={content.phonetic} 
              synonyms={content.synonyms} 
              keyRelationships={content.keyRelationships}
              summary={content.summary}
            />
          )}

          {/* Topical Authority Content Cluster Nav */}
          {postMeta.cluster && (
            <ClusterMap clusterId={postMeta.cluster} currentPostId={postMeta.id} />
          )}

          {/* AdSense Bottom Ad Slot */}
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center text-xs text-slate-400 select-none">
            <i className="fas fa-ad mr-1"></i> Google AdSense Placeholder (Bottom Content)
          </div>

          {/* FAQ Accordions for this post */}
          {content?.faqs && content.faqs.length > 0 && (
            <div className="border-t border-slate-100 pt-8">
              <FAQ faqs={content.faqs} title="Frequently Asked Questions" />
            </div>
          )}

          {/* CTA Guarantee Block */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col items-center text-center gap-4">
            <Shield className="h-10 w-10 text-indigo-400 animate-pulse" />
            <h3 className="text-lg font-bold">100% Free Browser-Native Processing</h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Experience private file manipulations without exposing document strings to the cloud. Try our secure tools today!
            </p>
            <Link to="/tools" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-smooth shadow-md flex items-center gap-1.5 select-none">
              Explore Tools <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </article>

      </div>
    </>
  );
}
export { BlogPost };
