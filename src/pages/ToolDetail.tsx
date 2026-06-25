import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { FAQ } from '../components/ui/FAQ';
import type { FAQItem } from '../components/ui/FAQ';
import ToolSEO from '../components/tool/ToolSEO';
import ToolEngine from '../components/tool/ToolEngine';
import { findToolBySlug } from '../toolRegistry';
import categoryHubs from '../data/category_hubs.json';
import { Sparkles } from 'lucide-react';

export default function ToolDetail() {
  const { categorySlug, toolSlug } = useParams<{ categorySlug: string; toolSlug: string }>();

  // Find tool by slug
  const slug = `/${categorySlug}/${toolSlug}`;
  const tool = findToolBySlug(slug);

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Tool Not Found</h1>
        <p className="text-slate-500 mb-6">The tool you are looking for does not exist or has been relocated.</p>
        <Link to="/tools" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-smooth">
          Browse Directory
        </Link>
      </div>
    );
  }

  // Get category titles using categorySlug
  const catHub = (categoryHubs as Record<string, any>)[tool.categorySlug];
  const categoryName = catHub ? catHub.title : tool.categorySlug.replace('-tools', ' Tools');

  const breadcrumbs = [
    { name: categoryName, url: `/${tool.categorySlug}` },
    { name: tool.name }
  ];

  // Tool specific FAQs fallback
  const toolFaqs: FAQItem[] = [
    {
      q: `Is the ${tool.name} tool completely free?`,
      a: `Yes, the ${tool.name} tool is 100% free with no monthly subscription models, watermarks, or page constraints.`
    },
    {
      q: `Are my files uploaded when using ${tool.name}?`,
      a: `No. ToolTari runs completely in-browser on client-side CPU threads. Your documents and input variables are processed locally and never touch cloud servers.`
    },
    {
      q: `Do I need to install any Chrome extensions or software?`,
      a: `No. ToolTari is a browser-native web application. Simply visit this page, drop your file, and save the result instantly.`
    }
  ];

  const seoTitle = `${tool.name} Online Free - ToolTari`;
  const seoDesc = `${tool.description} Fast, secure, and private. Runs locally in your web browser memory.`;

  // Schema.org definition
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.description,
    "url": `https://tooltari.in${tool.slug}`,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Windows, macOS, Linux, iOS, Android",
    "browserRequirements": "Requires HTML5, WebAssembly, and JavaScript enabled modern browser",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolTari",
      "url": "https://tooltari.in",
      "logo": "https://blogger.googleusercontent.com/img/a/AVvXsEjY2rjUWolqqXCrlJIvA8jXQqcUBMVsqEQq9CziuNUqzhW3Asha4BTbHljQobuky8iF9DmcKIdydU5HaxXso3sUI5HrxtlHUPTvp_VBFAoxwzOp8ka_H0Uqfdj2Ns_OSSqmww7c8mV_EuvIRxCy0udJTufLUj0phIkLXnrys4NCSPA7YBrZJa_LGH8A"
    }
  };

  return (
    <>
      <ToolSEO
        title={seoTitle}
        description={seoDesc}
        schema={schema}
      />

      <div className="max-w-5xl mx-auto px-4 pb-16">
        
        {/* Navigation Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Hero Banner header */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 md:p-8 flex flex-col items-start gap-3 shadow-md mb-8">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
            <Sparkles className="h-3 w-3" /> Secure Client Tool
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <i className={`fas ${tool.icon} text-indigo-400 text-2xl md:text-3xl shrink-0`}></i>
            {tool.name}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl">
            {tool.description}
          </p>
        </div>

        {/* Dynamic Tool Processing Panel */}
        <section className="mb-12">
          <ToolEngine toolId={tool.id} />
        </section>

        {/* Tool FAQs Accordion Section */}
        <section className="border-t border-slate-200 pt-12">
          <FAQ faqs={toolFaqs} title={`Frequently Asked Questions: ${tool.name}`} />
        </section>

      </div>
    </>
  );
}
export { ToolDetail };
