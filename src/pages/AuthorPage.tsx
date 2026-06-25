import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle, GraduationCap, Briefcase, Calendar, Heart, Globe } from 'lucide-react';
import blogData from '../data/blog.json';
import ToolSEO from '../components/tool/ToolSEO';
import { Breadcrumb } from '../components/ui/Breadcrumb';

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

export default function AuthorPage() {
  const { authorId } = useParams<{ authorId: string }>();

  // Resolve author path
  const isRajput = authorId === 'rajput-devdhar-singh' || authorId === 'devdhar-rajput';

  if (!isRajput) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center select-none">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Profile Not Found</h1>
        <p className="text-slate-500 mb-6">The author profile you are looking for does not exist.</p>
        <Link to="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-smooth">
          Return to Home
        </Link>
      </div>
    );
  }

  // Filter articles authored or reviewed by Rajput
  const articles = (blogData as BlogPostMeta[]).filter(
    p => p.author === 'Rajput Devdhar Singh' || p.author === 'Devdhar Rajput'
  );

  const breadcrumbs = [
    { name: "Authors", url: "/blog" },
    { name: "Rajput Devdhar Singh" }
  ];

  // Schema.org Person metadata
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Rajput Devdhar Singh",
    "jobTitle": "Founder & Lead Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "ToolTari",
      "url": "https://tooltari.in"
    },
    "url": "https://tooltari.in/authors/rajput-devdhar-singh",
    "image": "https://tooltari.in/assets/img/authors/rajput-devdhar-singh.png",
    "description": "Rajput Devdhar Singh is the Founder and Lead Developer of ToolTari, a BTech Computer Engineering student focused on web development and building secure online solutions.",
    "birthDate": "2008-02-09",
    "sameAs": [
      "https://www.instagram.com/devdhar_1824/",
      "https://github.com/rdsteam18/"
    ],
    "knowsAbout": [
      "Client-side Web Development",
      "PDF parsing & formatting",
      "Browser memory sandboxing",
      "React SPA Architectures",
      "JavaScript utilities"
    ]
  };

  return (
    <>
      <ToolSEO
        title="Rajput Devdhar Singh - Founder & Developer | ToolTari"
        description="Read the profile of Rajput Devdhar Singh, Founder of ToolTari. Learn about his journey, skills, education at Indus University, and divisions of the RDS TEAM."
        schema={personSchema}
      />

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Navigation Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-smooth mb-6 select-none">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Knowledge Hub
        </Link>

        {/* Profile Card & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Headshot Profile Card */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-5">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-50 shadow-inner">
              <img 
                src="/assets/img/authors/rajput-devdhar-singh.png" 
                alt="Rajput Devdhar Singh" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if not loaded
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256";
                }}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Rajput Devdhar Singh</h1>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Founder & Developer
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Passionate about building free, fast, and secure online tools that help people work smarter.
            </p>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Quick Profile Parameters */}
            <div className="flex flex-col gap-2.5 w-full text-left text-xs text-slate-600 font-semibold select-none">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Birthday: February 9, 2008</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>BTech Computer Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>RDS TEAM Hub Leader</span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Verification Badges */}
            <div className="flex flex-col gap-2 w-full text-left select-none">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verified ToolTari Creator</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <Shield className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Privacy Standards Architect</span>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Social Profile Links */}
            <div className="flex items-center gap-3 w-full justify-center">
              <a 
                href="https://www.instagram.com/devdhar_1824/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 text-slate-500 rounded-xl transition-smooth"
                aria-label="Instagram Profile"
                title="Instagram Profile"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a 
                href="https://github.com/rdsteam18/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-800 text-slate-500 rounded-xl transition-smooth"
                aria-label="GitHub Profile"
                title="GitHub Profile"
              >
                <i className="fab fa-github text-lg"></i>
              </a>
            </div>
          </div>

          {/* Right Column: Bio details, Education, and Extracted RDS TEAM divisions */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Story & Biography Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 select-none">
                <Heart className="h-5 w-5 text-indigo-500" /> My Story
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                <p>
                  I'm <strong>Rajput Devdhar Singh</strong>, a BTech Computer Engineering student at <strong>Indus University</strong> with a deep passion for web development. I started my coding journey with a simple mission: to build tools that solve real problems for people.
                </p>
                <p>
                  The idea for ToolTari came when I realized that most online tools either require login, cost money, or compromise user privacy. I wanted to create a platform where anyone can edit PDFs and images instantly without uploading files to any remote server.
                </p>
                <p>
                  Today, ToolTari serves thousands of users with 40+ free tools that work completely in your browser. I'm committed to expanding this platform and helping users worldwide with fast, secure, accessible, and high-performance client-side utilities.
                </p>
              </div>
            </div>

            {/* Education Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 select-none">
                <GraduationCap className="h-5 w-5 text-indigo-500" /> Education
              </h2>
              
              <div className="flex flex-col gap-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {/* College */}
                <div className="flex gap-4 relative pl-8">
                  <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 bg-indigo-600 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100"></div>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-extrabold text-slate-800">Indus University</span>
                    <span className="text-xs text-indigo-600 font-bold">BTech in Computer Engineering</span>
                    <p className="text-xs text-slate-500 leading-relaxed">Focusing on web development, software pipelines, algorithms, and compiling client-side processing platforms.</p>
                  </div>
                </div>

                {/* School */}
                <div className="flex gap-4 relative pl-8">
                  <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 bg-slate-300 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100"></div>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-extrabold text-slate-800">Vivekanand Hindi High School</span>
                    <span className="text-xs text-slate-500 font-bold">Secondary Education</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RDS TEAM Ecosystem Division Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col gap-0.5 select-none">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Ecosystem Breakdown</span>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" /> RDS TEAM
                </h2>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                RDS Team is focused on building useful digital tools and web projects that make a difference. We believe in creating solutions that are accessible, fast, and secure for everyone.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* RDS Group */}
                <div className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm select-none">
                    <i className="fas fa-store"></i>
                    <span>RDS Group (Retail & Mobility)</span>
                  </div>
                  <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                    <li><strong>OKmart</strong>: Smart retail & grocery delivery platform (<a href="https://okmart.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">okmart.netlify.app</a>)</li>
                    <li><strong>RentySide</strong>: Booking & real-estate rental portal (<a href="https://rentyside.in/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">rentyside.in</a>)</li>
                    <li><strong>Walk-Wise</strong>: AI-powered pedestrian & mobility analytics (Coming 2026)</li>
                  </ul>
                </div>

                {/* RDS Technology */}
                <div className="p-4 bg-blue-50/10 border border-blue-100 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm select-none">
                    <i className="fas fa-microchip"></i>
                    <span>RDS Technology (SaaS & Products)</span>
                  </div>
                  <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                    <li><strong>ToolTari</strong>: Browser-native document utilities (<a href="https://tooltari.in/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">tooltari.in</a>)</li>
                    <li><strong>Services</strong>: Web & app development, maintenance, and custom client projects.</li>
                    <li><strong>Products</strong>: SaaS suites, utility libraries, and AI application platforms.</li>
                  </ul>
                </div>

                {/* RDS Media */}
                <div className="p-4 bg-orange-50/10 border border-orange-100 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-sm select-none">
                    <i className="fas fa-photo-video"></i>
                    <span>RDS Media (Entertainment)</span>
                  </div>
                  <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                    <li><strong>OMDEV Platform</strong>: Movies, web-series, and digital streaming options.</li>
                    <li><strong>Creative Channels</strong>: Gaming channel and anime news databases.</li>
                    <li><strong>Content Operations</strong>: Interactive media and review publications.</li>
                  </ul>
                </div>

                {/* HRF Group */}
                <div className="p-4 bg-purple-50/10 border border-purple-100 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm select-none">
                    <i className="fas fa-hand-fist"></i>
                    <span>HRF Group (Training & Discipline)</span>
                  </div>
                  <ul className="text-xs text-slate-600 flex flex-col gap-1.5 list-disc pl-4 leading-relaxed">
                    <li><strong>Leadership</strong>: Professional discipline and leadership programs.</li>
                    <li><strong>Physical Training</strong>: Athletics, conditioning, and emergency preparedness.</li>
                    <li><strong>Social Services</strong>: Leadership in local community initiatives and rescue prep.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 select-none">
                <FileText className="h-5 w-5 text-indigo-500" /> Articles Authored or Reviewed
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map(post => (
                  <Link 
                    key={post.id}
                    to={post.slug}
                    className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm rounded-xl p-4 flex flex-col gap-3 transition-smooth group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{post.date}</span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-smooth line-clamp-2">
                      {post.title}
                    </h4>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    
                    <div className="mt-auto pt-2 flex items-center justify-between text-xs text-indigo-500 font-bold group-hover:translate-x-1 transition-smooth">
                      <span>Read Guide →</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{post.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
