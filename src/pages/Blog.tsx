import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import blogData from '../data/blog.json';
import Card from '../components/ui/Card';
import ToolSEO from '../components/tool/ToolSEO';

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
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPostMeta[]>(blogData);

  useEffect(() => {
    let posts = blogData as BlogPostMeta[];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      posts = posts.filter(p => p.category === selectedCategory);
    }

    setFilteredPosts(posts);
  }, [searchQuery, selectedCategory]);

  const categories = [
    { key: 'all', name: 'All Posts' },
    { key: 'pdf', name: 'PDF Guides' },
    { key: 'image', name: 'Image Editing' },
    { key: 'utility', name: 'Utilities' },
    { key: 'security', name: 'Data Security' }
  ];

  return (
    <>
      <ToolSEO
        title="Knowledge Center & Guides Hub"
        description="Learn how to edit documents, optimize images, generate secure passwords, and format text with ToolTari guides and step-by-step tutorials."
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Blog Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ToolTari Knowledge Hub</h1>
          <p className="text-sm text-slate-500">Expert guides, tutorials, and security deep-dives.</p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap select-none">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                  selectedCategory === cat.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Guides Grid display */}
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
            No guides found matching your selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="block group">
                <Card className="h-full flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 select-none">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-smooth leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform duration-200 mt-auto select-none">
                    Read Guide <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
export { Blog };
