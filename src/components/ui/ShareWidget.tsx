import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ShareWidget() {
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Don't show the widget on the homepage
    if (location.pathname === '/') return;

    // Wait a brief moment for the router page component to update document.title
    const timer = setTimeout(() => {
      setUrl(window.location.href);
      setTitle(document.title || 'ToolTari - Free PDF & Image Tools');
    }, 150);
    return () => clearTimeout(timer);
  }, [location]);

  // Don't show the widget on the homepage
  if (location.pathname === '/') {
    return null;
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this useful tool: ${title} - ${url}`)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this useful tool: ${title}`)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this useful tool: ${title}`)}`;

  return (
    <div 
      className="fixed z-dropdown flex items-center bg-bg-surface/85 backdrop-blur-md border border-border-base/55 shadow-large transition-smooth bottom-6 left-1/2 -translate-x-1/2 flex-row p-2 rounded-full gap-2 xl:left-8 xl:top-1/2 xl:-translate-y-1/2 xl:bottom-auto xl:translate-x-0 xl:flex-col xl:p-3 xl:rounded-md xl:gap-3"
      aria-label="Social sharing widget"
    >
      {/* Share Label/Icon */}
      <div className="text-text-muted flex items-center justify-center p-1.5" title="Share this page">
        <i className="fas fa-share-nodes text-sm"></i>
      </div>

      {/* Dividers */}
      <div className="h-5 w-px bg-border-base mx-0.5 xl:hidden"></div>
      <div className="w-6 h-px bg-border-base my-0.5 xl:block hidden"></div>

      {/* WhatsApp Button */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-600 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-smooth hover:scale-110 active:scale-95 shadow-small hover:shadow-medium dark:text-emerald-400"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <i className="fab fa-whatsapp text-lg"></i>
      </a>

      {/* Telegram Button */}
      <a
        href={telegramShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full flex items-center justify-center text-sky-600 bg-sky-500/10 hover:bg-sky-600 hover:text-white transition-smooth hover:scale-110 active:scale-95 shadow-small hover:shadow-medium dark:text-sky-400"
        aria-label="Share on Telegram"
        title="Share on Telegram"
      >
        <i className="fab fa-telegram text-lg"></i>
      </a>

      {/* Twitter/X Button */}
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary bg-bg-base hover:bg-text-primary hover:text-bg-surface transition-smooth hover:scale-110 active:scale-95 shadow-small hover:shadow-medium"
        aria-label="Share on X"
        title="Share on X"
      >
        <i className="fab fa-x-twitter text-base"></i>
      </a>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth hover:scale-110 active:scale-95 shadow-small hover:shadow-medium ${
          copied 
            ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' 
            : 'text-primary bg-primary/10 hover:bg-primary hover:text-white dark:text-accent'
        }`}
        aria-label="Copy page link"
        title={copied ? 'Link copied!' : 'Copy page link'}
      >
        {copied ? (
          <i className="fas fa-check text-base animate-pulse"></i>
        ) : (
          <i className="fas fa-link text-base"></i>
        )}
      </button>

      {/* Tooltip feedback for copy */}
      {copied && (
        <div className="absolute xl:left-16 xl:top-auto xl:bottom-3 xl:-translate-x-0 -top-10 left-1/2 -translate-x-1/2 bg-secondary text-bg-surface border border-border-base text-xs px-2.5 py-1 rounded shadow-large whitespace-nowrap animate-fade-in pointer-events-none">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
