import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/navigation/Header';
import Footer from '../components/navigation/Footer';
import ShareWidget from '../components/ui/ShareWidget';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Intercept relative internal link clicks to make them run as SPA navigation
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        // Catch local path references (e.g. /blog/...) and ignore externals or anchor jumps
        if (href && href.startsWith('/') && !href.startsWith('//') && !anchor.target) {
          e.preventDefault();
          navigate(href);
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [navigate]);

  // Set initial theme class on HTML element root to prevent layouts hydration flashing
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const active = saved || systemTheme;
    if (active === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary font-sans transition-smooth">
      <Header />
      <main className="flex-grow pt-16 animate-fade-in">
        {children}
      </main>
      <ShareWidget />
      <Footer />
    </div>
  );
}
