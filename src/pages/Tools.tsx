import { useState, useEffect } from 'react';
import { Search, Info } from 'lucide-react';
import { getAllTools } from '../toolRegistry';
import ToolCard from '../components/ui/ToolCard';
import ToolSEO from '../components/tool/ToolSEO';

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(getAllTools());

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = getAllTools().filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
    setFilteredTools(filtered);
  }, [searchQuery]);

  const categories = [
    { key: "pdf-tools", name: "PDF Tools", icon: "fa-file-pdf" },
    { key: "image-tools", name: "Image Tools", icon: "fa-image" },
    { key: "developer-tools", name: "Developer Tools", icon: "fa-code" },
    { key: "text-tools", name: "Text Tools", icon: "fa-underline" },
    { key: "qr-tools", name: "QR Tools", icon: "fa-qrcode" },
    { key: "archive-tools", name: "Archive Tools", icon: "fa-file-archive" },
    { key: "video-tools", name: "Video Tools", icon: "fa-video" }
  ];

  return (
    <>
      <ToolSEO
        title="All Online Productivity Tools Directory"
        description="Browse our complete directory of free online tools. Search and access local-native tools for PDF, images, coding, data conversion, and text formatting."
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Directory Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complete Tools Directory</h1>
          <p className="text-sm text-slate-500">Search and access all browser-native productivity tools.</p>
        </div>

        {/* Directory Search */}
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search tools by name, utility or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl shadow-sm text-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {/* Privacy Alert */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-slate-700 text-sm flex gap-3 items-start max-w-3xl">
          <Info className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800">Privacy-First Architecture</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every tool in this directory runs locally on your machine using JavaScript/WASM compile-stacks. Absolutely no files, payloads, or inputs are uploaded to external databases.
            </p>
          </div>
        </div>

        {/* Grid display: categorized sections */}
        <div className="flex flex-col gap-12 mt-4">
          {categories.map((cat) => {
            const catActiveTools = filteredTools.filter(t => t.categorySlug === cat.key && t.status === 'active');
            if (catActiveTools.length === 0) return null;

            return (
              <div key={cat.key} className="flex flex-col gap-4 border-b border-slate-200 pb-8 last:border-0 last:pb-0">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <i className={`fas ${cat.icon} text-indigo-500`}></i>
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catActiveTools.map(t => (
                    <ToolCard
                      key={t.id}
                      slug={t.slug}
                      name={t.name}
                      description={t.description}
                      icon={t.icon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
export { Tools };
