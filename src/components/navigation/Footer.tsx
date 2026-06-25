import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Footer Brand Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img src={SITE_CONFIG.logoUrl} alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">{SITE_CONFIG.name}</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs text-slate-500">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        {/* Categories Link Grid */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Categories</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/pdf-tools" className="hover:text-white transition-smooth">PDF Tools</Link></li>
            <li><Link to="/image-tools" className="hover:text-white transition-smooth">Image Tools</Link></li>
            <li><Link to="/developer-tools" className="hover:text-white transition-smooth">Developer Tools</Link></li>
            <li><Link to="/text-tools" className="hover:text-white transition-smooth">Text Tools</Link></li>
          </ul>
        </div>

        {/* Resources & Support */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Resources</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/blog" className="hover:text-white transition-smooth">Blog & Guides</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-smooth">Support Contact</Link></li>
            <li><Link to="/status" className="hover:text-white transition-smooth">System Status</Link></li>
            <li><Link to="/security" className="hover:text-white transition-smooth">Trust & Security</Link></li>
          </ul>
        </div>

        {/* Legals & Social links */}
        <div className="flex flex-col gap-3 col-span-1">
          <h4 className="text-white font-bold text-sm tracking-wider uppercase">Legal Info</h4>
          <ul className="flex flex-col gap-2 text-sm mb-4">
            <li><Link to="/privacy-policy" className="hover:text-white transition-smooth">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-smooth">Terms of Service</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-white transition-smooth">Cookie Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white transition-smooth">Disclaimer</Link></li>
          </ul>
          
          <div className="flex items-center gap-3">
            <a href={SITE_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-smooth" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href={SITE_CONFIG.socials.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-smooth" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <span>© {currentYear} {SITE_CONFIG.name}. All rights reserved. Locally processed in the browser.</span>
        <span>Secure HTTPS encryption.</span>
      </div>
    </footer>
  );
}
