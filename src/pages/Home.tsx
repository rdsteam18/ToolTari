import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Bolt, Landmark, ArrowRight, Search } from 'lucide-react';
import { getAllTools } from '../toolRegistry';
import CategoryCard from '../components/ui/CategoryCard';
import ToolCard from '../components/ui/ToolCard';
import ToolSEO from '../components/tool/ToolSEO';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Filter popular tools (popularity >= 4)
  const popularTools = getAllTools().filter(t => t.popularity >= 4 && t.status === 'active');

  const categories = [
    { slug: "pdf-tools", name: "PDF Tools", icon: "fa-file-pdf", description: "Merge, compress, split, protect, and convert PDF documents locally." },
    { slug: "image-tools", name: "Image Tools", icon: "fa-image", description: "Compress, resize, crop, convert, and apply filters to images in-browser." },
    { slug: "developer-tools", name: "Developer Tools", icon: "fa-code", description: "JSON formatters, base64 converters, password generators, and code compilers." },
    { slug: "text-tools", name: "Text Tools", icon: "fa-underline", description: "Count words, change casing, replace text, and cleanup raw copy." },
    { slug: "qr-tools", name: "QR Tools", icon: "fa-qrcode", description: "Generate custom QR codes and scan codes securely with webcams." },
    { slug: "archive-tools", name: "Archive Tools", icon: "fa-file-archive", description: "Pack files into ZIP folders or extract ZIP archives locally." },
    { slug: "video-tools", name: "Video Tools", icon: "fa-video", description: "Compress, trim, mute, convert formats, or extract audio tracks from video streams." },
    { slug: "audio-tools", name: "Audio Tools", icon: "fa-music", description: "Visual cutting, volume boosting, metadata editing, and format converter utilities." },
    { slug: "ai-tools", name: "AI Tools", icon: "fa-robot", description: "Chat with PDF, AI copywriter, and browser-native OCR text extractions." }
  ];

  // Perform search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = getAllTools().filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ToolTari",
      "url": "https://tooltari.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tooltari.in/tools?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ToolTari",
      "url": "https://tooltari.in",
      "logo": "https://blogger.googleusercontent.com/img/a/AVvXsEjY2rjUWolqqXCrlJIvA8jXQqcUBMVsqEQq9CziuNUqzhW3Asha4BTbHljQobuky8iF9DmcKIdydU5HaxXso3sUI5HrxtlHUPTvp_VBFAoxwzOp8ka_H0Uqfdj2Ns_OSSqmww7c8mV_EuvIRxCy0udJTufLUj0phIkLXnrys4NCSPA7YBrZJa_LGH8A",
      "description": "ToolTari is a modern online productivity platform offering free PDF tools, AI tools, image tools, developer utilities, text tools, and document management solutions.",
      "sameAs": [
        "https://www.instagram.com/tooltari.in/",
        "https://www.youtube.com/@rdsteam1824/"
      ]
    }
  ];

  return (
    <>
      <ToolSEO
        title="Free PDF, AI, Image & Developer Tools | ToolTari"
        description="Access free online tools. Merge PDFs, compress files, convert images, scan QR codes, and run code editors 100% locally in your browser memory."
        schema={schema}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-slate-900 z-0" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Bolt className="h-3.5 w-3.5" /> 100% Free · No Registration
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Free Online PDF, Image & Developer Tools
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-lg leading-relaxed">
              Secure browser-native processing. Your files never leave your device. Fast, secure, and completely free.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <button 
                onClick={() => document.getElementById('categories-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-smooth shadow-lg flex items-center gap-2 text-sm"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/about" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-smooth text-sm border border-slate-700">
                Learn Privacy Guarantee
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1"><Shield className="h-4 w-4 text-indigo-400" /> Private Processing</div>
              <div className="flex items-center gap-1"><Bolt className="h-4 w-4 text-indigo-400" /> WebAssembly Accelerated</div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center relative">
            <div className="w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl absolute -z-10" />
            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-large backdrop-blur-sm max-w-sm flex flex-col gap-4 animate-slide-up">
              <div className="h-10 w-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center text-lg">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Browser-Native Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traditional platforms upload your files to remote servers. ToolTari processes everything locally in volatile browser memory. 100% compliant with GDPR and HIPAA security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Interactive Search */}
      <section className="py-8 bg-bg-base border-b border-border-base">
        <div className="max-w-3xl mx-auto px-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="What task do you want to accomplish today? (e.g. merge pdf, resize png)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-surface border border-border-base focus:border-primary rounded-2xl shadow-sm text-base text-text-primary transition-smooth focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-text-muted"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
          </div>

          {/* Search Result Dropdown Overlay */}
          {searchResults.length > 0 && (
            <div className="absolute top-16 left-4 right-4 bg-bg-surface border border-border-base rounded-2xl shadow-large max-h-80 overflow-y-auto p-3 flex flex-col gap-1.5 z-40 animate-slide-up">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2">Search results ({searchResults.length})</span>
              {searchResults.slice(0, 8).map(t => (
                <Link
                  key={t.id}
                  to={t.slug}
                  className="flex items-center gap-3 p-2.5 hover:bg-bg-base rounded-xl transition-smooth"
                >
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm shrink-0">
                    <i className={`fas ${t.icon}`}></i>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate">{t.name}</span>
                    <span className="text-xs text-text-muted truncate">{t.description}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4" id="categories-grid">
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Browse Tools by Category</h2>
          <p className="text-sm text-text-secondary max-w-md">Find specialized browser-native utilities organized for productivity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              description={cat.description}
              icon={cat.icon}
            />
          ))}
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 md:py-20 bg-bg-base border-t border-b border-border-base/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Popular Productivity Tools</h2>
              <p className="text-sm text-text-secondary">Most clicked in-browser file utilities.</p>
            </div>
            <Link to="/tools" className="font-semibold text-primary hover:text-primary-hover flex items-center gap-1 select-none text-sm group">
              View all tools <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.slice(0, 8).map((tool) => (
              <ToolCard
                key={tool.id}
                slug={tool.slug}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-2 mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Why Choose ToolTari?</h2>
          <p className="text-sm text-text-secondary max-w-md">Engineered to secure files and optimize performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-start gap-4 p-6 bg-bg-surface border border-border-base/80 rounded-2xl shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><Bolt className="h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-text-primary">Sub-1s Speeds</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              No queuing, no loading, and no server lags. Because operations run locally inside your device CPU threads, processing executes instantly.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 p-6 bg-bg-surface border border-border-base/80 rounded-2xl shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><Shield className="h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-text-primary">Absolute Confidentiality</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We have no database servers capturing document uploads. Your files are processed inside your browser sandbox and cleared on tab exit.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 p-6 bg-bg-surface border border-border-base/80 rounded-2xl shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><Landmark className="h-6 w-6" /></div>
            <h3 className="font-bold text-lg text-text-primary">Corporate Compliance</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              ToolTari meets stringent enterprise data control standards. Excellent for banks, law firms, and healthcare workers handling private data.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
