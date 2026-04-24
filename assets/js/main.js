// ========== MAIN.JS - Core Application Logic ==========
// Handles tools data fetching, rendering, and core functionality

(function() {
  'use strict';
  
  // DOM Elements
  const toolsGrid = document.getElementById('tools-grid');
  
  // Tools data URL (with fallback paths)
  const TOOLS_API_URLS = [
    '/data/tools.json',
    './data/tools.json',
    'data/tools.json',
    '../data/tools.json'
  ];
  
  // Fallback tools data in case fetch fails
  const FALLBACK_TOOLS = [
    {
      "id": "merge-pdf",
      "name": "Merge PDF",
      "description": "Combine multiple PDF files into one document. Drag and drop to reorder pages.",
      "category": "pdf",
      "slug": "/tools/merge-pdf.html",
      "icon": "fa-object-group",
      "popularity": 5
    },
    {
      "id": "split-pdf",
      "name": "Split PDF",
      "description": "Split PDF into multiple files. Extract specific pages or split at intervals.",
      "category": "pdf",
      "slug": "/tools/split-pdf.html",
      "icon": "fa-cut",
      "popularity": 5
    },
    {
      "id": "compress-pdf",
      "name": "Compress PDF",
      "description": "Reduce PDF file size while maintaining quality. Perfect for email attachments.",
      "category": "pdf",
      "slug": "/tools/compress-pdf.html",
      "icon": "fa-compress",
      "popularity": 5
    },
    {
      "id": "pdf-to-word",
      "name": "PDF to Word",
      "description": "Extract text from PDF and convert to editable Word document (RTF).",
      "category": "pdf",
      "slug": "/tools/pdf-to-word.html",
      "icon": "fa-file-word",
      "popularity": 4
    },
    {
      "id": "pdf-to-ppt",
      "name": "PDF to PowerPoint",
      "description": "Transform PDF slides into editable PowerPoint presentations",
      "category": "pdf",
      "slug": "/tools/pdf-to-ppt.html",
      "icon": "fa-chalkboard",
      "popularity": 3
    },
    {
      "id": "protect-pdf",
      "name": "Protect PDF",
      "description": "Add password protection to your PDF files",
      "category": "pdf",
      "slug": "/tools/protect-pdf.html",
      "icon": "fa-lock",
      "popularity": 4
    },
    {
      "id": "unlock-pdf",
      "name": "Unlock PDF",
      "description": "Remove password protection from PDF files",
      "category": "pdf",
      "slug": "/tools/unlock-pdf.html",
      "icon": "fa-unlock-alt",
      "popularity": 4
    },
    {
      "id": "compress-image",
      "name": "Compress Image",
      "description": "Reduce image file size without losing quality",
      "category": "image",
      "slug": "/tools/compress-image.html",
      "icon": "fa-image",
      "popularity": 5
    },
    {
      "id": "image-converter",
      "name": "Image Converter",
      "description": "Convert between JPG, PNG, WebP and other formats",
      "category": "image",
      "slug": "/tools/image-converter.html",
      "icon": "fa-exchange-alt",
      "popularity": 5
    },
    {
      "id": "crop-image",
      "name": "Crop Image",
      "description": "Crop and resize images to fit your needs",
      "category": "image",
      "slug": "/tools/crop-image.html",
      "icon": "fa-crop",
      "popularity": 4
    },
    {
      "id": "qr-generator",
      "name": "QR Code Generator",
      "description": "Create QR codes for URLs, text, and contact info",
      "category": "utility",
      "slug": "/tools/qr-generator.html",
      "icon": "fa-qrcode",
      "popularity": 4
    },
    {
      "id": "watermark",
      "name": "Watermark Tool",
      "description": "Add text or image watermarks to PDFs and images",
      "category": "pdf",
      "slug": "/tools/watermark.html",
      "icon": "fa-paintbrush",
      "popularity": 3
    }
  ];
  
  // ========== Helper Functions ==========
  
  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
      return c;
    });
  }
  
  // Format file size (for tool cards if needed)
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  // ========== Tool Card Rendering ==========
  
  // Render tool cards in the grid
  function renderToolCards(tools) {
    if (!toolsGrid) {
      console.warn('Tools grid element not found');
      return;
    }
    
    if (!tools || tools.length === 0) {
      toolsGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
          <h3>Unable to load tools</h3>
          <p>Please refresh the page or try again later.</p>
        </div>
      `;
      return;
    }
    
    // Take first 6 tools for homepage preview
    const previewTools = tools.slice(0, 6);
    
    const cardsHTML = previewTools.map(tool => `
      <div class="tool-card scroll-reveal" data-tool-id="${escapeHtml(tool.id)}" data-tool-slug="${escapeHtml(tool.slug || '/tools/' + tool.id + '.html')}">
        <div class="tool-icon">
          <i class="fas ${escapeHtml(tool.icon || 'fa-tool')}"></i>
        </div>
        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
        <p class="tool-description">${escapeHtml(tool.description)}</p>
        <button class="tool-btn" data-tool="${escapeHtml(tool.id)}" data-tool-name="${escapeHtml(tool.name)}" data-tool-slug="${escapeHtml(tool.slug || '/tools/' + tool.id + '.html')}">
          Use Tool <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `).join('');
    
    toolsGrid.innerHTML = cardsHTML;
    
    // Attach event listeners to tool buttons
    attachToolButtonEvents();
    
    // Re-initialize scroll reveal for new cards
    setTimeout(() => {
      const revealElements = document.querySelectorAll('.scroll-reveal:not(.revealed)');
      if (revealElements.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
      } else {
        revealElements.forEach(el => el.classList.add('revealed'));
      }
    }, 100);
  }
  
  // Attach click events to tool buttons
  function attachToolButtonEvents() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toolId = btn.getAttribute('data-tool');
        const toolName = btn.getAttribute('data-tool-name');
        const toolSlug = btn.getAttribute('data-tool-slug');
        
        // Navigate to tool page if slug exists
        if (toolSlug && toolSlug !== '#') {
          window.location.href = toolSlug;
        } else {
          // Show notification for tools without pages yet
          showToolNotification(toolName);
        }
      });
    });
  }
  
  // Show temporary toast notification
  function showToolNotification(toolName) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.tool-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'tool-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-rocket"></i>
        <span>✨ ${escapeHtml(toolName)} - This tool is coming soon! We're working on it.</span>
      </div>
    `;
    
    // Add toast styles if not present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .tool-toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: white;
          border-radius: 50px;
          padding: 1rem 2rem;
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);
          z-index: 10000;
          transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          border-left: 4px solid var(--primary);
          pointer-events: none;
          max-width: 90%;
        }
        .tool-toast.show {
          transform: translateX(-50%) translateY(0);
        }
        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text);
        }
        .toast-content i {
          color: var(--primary);
          font-size: 1.2rem;
        }
        @media (max-width: 640px) {
          .tool-toast {
            width: 90%;
            border-radius: 1rem;
            text-align: center;
          }
          .toast-content {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // ========== Tools Data Fetching ==========
  
  // Fetch tools from JSON file with multiple fallback paths
  async function fetchTools() {
    // Try multiple paths
    for (const url of TOOLS_API_URLS) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          // Handle different JSON structures
          if (Array.isArray(data)) {
            console.log(`Tools loaded from ${url} (array format)`);
            return data;
          }
          if (data && Array.isArray(data.tools)) {
            console.log(`Tools loaded from ${url} (tools array format)`);
            return data.tools;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch from ${url}:`, error.message);
      }
    }
    
    // If all fetches fail, use fallback data
    console.warn('Using fallback tools data');
    return FALLBACK_TOOLS;
  }
  
  // ========== Animation & Scroll Effects ==========
  
  // Initialize scroll reveal for existing elements
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for older browsers
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }
  
  // Initialize fade-up animations
  function initFadeUpAnimations() {
    const fadeElements = document.querySelectorAll('.animate-fade-up');
    fadeElements.forEach((el, idx) => {
      if (!el.style.animation) {
        el.style.animation = `fadeUp 0.7s ease forwards`;
        el.style.animationDelay = `${idx * 0.1}s`;
      }
    });
  }
  
  // ========== Stats Counter Animation ==========
  function animateStats() {
    const statsNumbers = document.querySelectorAll('.stat-number');
    if (!statsNumbers.length) return;
    
    const observerOptions = { threshold: 0.5 };
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          const el = entry.target;
          const targetText = el.innerText;
          const targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
          
          if (!isNaN(targetNumber)) {
            el.dataset.animated = 'true';
            let current = 0;
            const increment = targetNumber / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= targetNumber) {
                el.innerText = targetText.replace(/\d+/, targetNumber);
                clearInterval(timer);
              } else {
                el.innerText = targetText.replace(/\d+/, Math.floor(current));
              }
            }, 20);
          }
          statsObserver.unobserve(el);
        }
      });
    }, observerOptions);
    
    statsNumbers.forEach(stat => statsObserver.observe(stat));
  }
  
  // ========== Performance Tracking ==========
  function trackPageLoad() {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('tooltari-loaded');
    }
    console.log('ToolTari Main initialized — Fast, secure, free tools.');
  }
  
  // ========== Initialize All Modules ==========
  async function init() {
    // Show loading state
    if (toolsGrid) {
      toolsGrid.innerHTML = `
        <div class="loading-skeleton" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <i class="fas fa-spinner fa-pulse" style="font-size: 2rem; color: var(--primary);"></i>
          <p style="margin-top: 1rem;">Loading tools...</p>
        </div>
      `;
    }
    
    // Fetch and render tools
    const tools = await fetchTools();
    renderToolCards(tools);
    
    // Initialize animations
    initScrollReveal();
    initFadeUpAnimations();
    animateStats();
    trackPageLoad();
  }
  
  // ========== Export for debugging (optional) ==========
  window.ToolTari = {
    version: '1.0.0',
    toolsCount: FALLBACK_TOOLS.length,
    isInitialized: true,
    refreshTools: init
  };
  
  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
