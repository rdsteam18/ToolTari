import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { Menu, X, ChevronDown, Search as SearchIcon, Sun, Moon } from 'lucide-react';
import { getAllTools } from '../../toolRegistry';
import type { ToolRegistryEntry } from '../../types/tool';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ToolRegistryEntry[]>([]);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Theme management logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Group tools by category for the Mega Menu
  const categoriesMap = {
    'pdf-tools': { name: 'PDF Tools', icon: 'fa-file-pdf' },
    'image-tools': { name: 'Image Tools', icon: 'fa-image' },
    'developer-tools': { name: 'Developer Tools', icon: 'fa-code' },
    'text-tools': { name: 'Text Tools', icon: 'fa-underline' },
    'qr-tools': { name: 'QR Tools', icon: 'fa-qrcode' },
    'archive-tools': { name: 'Archive Tools', icon: 'fa-file-archive' },
    'video-tools': { name: 'Video Tools', icon: 'fa-video' }
  };

  const activeTools = getAllTools().filter(t => t.status === 'active');

  // Handle Search Input
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

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setSearchQuery('');
  }, [location]);

  // Click outside listener for dropdowns & search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-bg-surface border-b border-border-base z-header transition-smooth">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group select-none">
          <img src={SITE_CONFIG.logoUrl} alt={SITE_CONFIG.name} className="h-8 w-8 object-contain group-hover:scale-105 transition-smooth" />
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`font-semibold hover:text-primary transition-smooth ${location.pathname === '/' ? 'text-primary' : 'text-text-secondary'}`}>
            Home
          </Link>

          {/* Mega Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className={`flex items-center gap-1 font-semibold hover:text-primary transition-smooth ${location.pathname.includes('-tools') || location.pathname === '/tools' ? 'text-primary' : 'text-text-secondary'}`}
            >
              Tools <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] bg-bg-surface border border-border-base rounded-md shadow-medium p-6 grid grid-cols-3 gap-6 animate-slide-up"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {Object.entries(categoriesMap).map(([key, cat]) => {
                  const catTools = activeTools.filter(t => t.categorySlug === key).slice(0, 5);
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <Link to={`/${key}`} className="font-bold text-text-primary hover:text-primary flex items-center gap-2 border-b border-border-base/40 pb-1">
                        <i className={`fas ${cat.icon} text-primary`}></i>
                        {cat.name}
                      </Link>
                      <ul className="flex flex-col gap-1">
                        {catTools.map(t => (
                          <li key={t.id}>
                            <Link to={t.slug} className="text-sm text-text-secondary hover:text-primary transition-smooth block truncate py-0.5">
                              {t.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link to={`/${key}`} className="text-xs text-primary font-semibold hover:underline block pt-1">
                            View all {cat.name} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/blog" className={`font-semibold hover:text-primary transition-smooth ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-text-secondary'}`}>
            Blog
          </Link>
          <Link to="/contact" className={`font-semibold hover:text-primary transition-smooth ${location.pathname === '/contact' ? 'text-primary' : 'text-text-secondary'}`}>
            Contact
          </Link>
        </nav>

        {/* Search & CTAs */}
        <div className="flex items-center gap-4">
          {/* Global Search Bar */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 pl-9 pr-4 py-1.5 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface rounded-md text-sm text-text-primary transition-smooth placeholder:text-text-muted"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            </div>

            {/* Live Search Suggestions */}
            {searchResults.length > 0 && (
              <div className="absolute top-11 right-0 w-80 bg-bg-surface border border-border-base rounded-md shadow-large max-h-80 overflow-y-auto p-2 flex flex-col gap-1 z-dropdown animate-slide-up">
                {searchResults.slice(0, 10).map(t => (
                  <Link
                    key={t.id}
                    to={t.slug}
                    className="flex items-center gap-2 p-2 hover:bg-bg-base rounded-md transition-smooth"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="h-7 w-7 bg-primary/10 text-primary rounded flex items-center justify-center text-sm">
                      <i className={`fas ${t.icon}`}></i>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text-primary truncate">{t.name}</span>
                      <span className="text-xs text-text-muted truncate">{t.categorySlug.replace('-tools', ' Tools')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-base rounded-md transition-smooth select-none focus-visible:outline-none"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link to="/tools" className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md text-sm transition-smooth shadow-small">
            Use Tools
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-text-secondary hover:bg-bg-base rounded-md md:hidden transition-smooth"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-bg-surface z-drawer md:hidden p-4 flex flex-col gap-4 overflow-y-auto animate-fade-in">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface rounded-md text-sm text-text-primary"
            />
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            
            {/* Live Search Suggestions */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-bg-base border border-border-base rounded-md p-2 flex flex-col gap-1">
                {searchResults.slice(0, 5).map(t => (
                  <Link
                    key={t.id}
                    to={t.slug}
                    className="flex items-center gap-2 p-2 hover:bg-bg-surface rounded-md transition-smooth"
                  >
                    <i className={`fas ${t.icon} text-primary`}></i>
                    <span className="text-sm font-semibold text-text-primary">{t.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ul className="flex flex-col gap-4 text-lg font-bold text-text-primary">
            <li>
              <Link to="/" className="block py-1 hover:text-primary">Home</Link>
            </li>
            <li>
              <span className="block py-1 text-text-muted text-sm uppercase tracking-wider font-extrabold mb-2">Tool Categories</span>
              <div className="grid grid-cols-2 gap-3 pl-2">
                {Object.entries(categoriesMap).map(([key, cat]) => (
                  <Link key={key} to={`/${key}`} className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary py-1">
                    <i className={`fas ${cat.icon} text-primary w-4`}></i>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </li>
            <li className="border-t border-border-base/40 pt-3">
              <Link to="/blog" className="block py-1 hover:text-primary">Blog</Link>
            </li>
            <li>
              <Link to="/contact" className="block py-1 hover:text-primary">Contact</Link>
            </li>
          </ul>

          <div className="mt-auto border-t border-border-base/40 pt-4 flex flex-col gap-2">
            <Link to="/tools" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-md flex items-center justify-center shadow-small">
              Start Using Tools
            </Link>
          </div>
        </div>
      )}
    </header>
  );}
