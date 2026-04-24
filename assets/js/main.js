// ========== MAIN APPLICATION LOGIC ==========
// Handles tools data fetching, rendering, and core functionality

(function() {
  'use strict';
  
  // DOM Elements
  const toolsGrid = document.getElementById('tools-grid');
  
  // Tools data URL
  const TOOLS_API_URL = '/data/tools.json';
  
  // Fallback tools data in case fetch fails
  const FALLBACK_TOOLS = [
    {
      "id": "merge-pdf",
      "name": "Merge PDF",
      "description": "Combine multiple PDF files into one document instantly",
      "category": "pdf",
      "slug": "/tools/merge-pdf",
      "icon": "fa-object-group"
    },
    {
      "id": "compress-pdf",
      "name": "Compress PDF",
      "description": "Reduce PDF file size while preserving quality",
      "category": "pdf",
      "slug": "/tools/compress-pdf",
      "icon": "fa-compress"
    },
    {
      "id": "pdf-to-word",
      "name": "PDF to Word",
      "description": "Convert PDF documents to editable Word files",
      "category": "pdf",
      "slug": "/tools/pdf-to-word",
      "icon": "fa-file-word"
    },
    {
      "id": "image-converter",
      "name": "Image Converter",
      "description": "Convert between JPG, PNG, WebP formats",
      "category": "image",
      "slug": "/tools/image-converter",
      "icon": "fa-image"
    }
  ];
  
  // Render tool cards in the grid
  function renderToolCards(tools) {
    if (!toolsGrid) return;
    
    if (!tools || tools.length === 0) {
      toolsGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to load tools. Please refresh the page.</p>
        </div>
      `;
      return;
    }
    
    // Take first 6 tools for homepage preview
    const previewTools = tools.slice(0, 6);
    
    const cardsHTML = previewTools.map(tool => `
      <div class="tool-card scroll-reveal" data-tool-id="${tool.id}">
        <div class="tool-icon">
          <i class="fas ${tool.icon || 'fa-tool'}"></i>
        </div>
        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
        <p class="tool-description">${escapeHtml(tool.description)}</p>
        <button class="tool-btn" data-tool="${tool.id}" data-tool-name="${escapeHtml(tool.name)}">
          Use Tool <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `).join('');
    
    toolsGrid.innerHTML = cardsHTML;
    
    // Attach event listeners to tool buttons
    attachToolButtonEvents();
    
    // Re-initialize scroll reveal for new cards
    if (window.initScrollReveal) {
      setTimeout(() => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('revealed');
          }
        });
      }, 100);
    }
  }
  
  // Attach click events to tool buttons
  function attachToolButtonEvents() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toolId = btn.getAttribute('data-tool');
        const toolName = btn.getAttribute('data-tool-name');
        
        // Show notification and redirect to tool page (in future)
        showToolNotification(toolName);
        
        // For now, show demo message
        console.log(`Tool selected: ${toolName} (${toolId})`);
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
        <i class="fas fa-check-circle"></i>
        <span>✨ ${toolName} - Coming soon! We're building this tool with care.</span>
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
          color: var(--success);
          font-size: 1.2rem;
        }
        @media (max-width: 640px) {
          .tool-toast {
            width: 90%;
            border-radius: 1rem;
            text-align: center;
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
  
  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  // Fetch tools from JSON file
  async function fetchTools() {
    try {
      const response = await fetch(TOOLS_API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      // Handle both array and { tools: [] } formats
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.tools)) return data.tools;
      return FALLBACK_TOOLS;
    } catch (error) {
      console.warn('Failed to fetch tools.json, using fallback data:', error);
      return FALLBACK_TOOLS;
    }
  }
  
  // Initialize the tools section
  async function initTools() {
    if (!toolsGrid) return;
    
    const tools = await fetchTools();
    renderToolCards(tools);
  }
  
  // Initialize scroll reveal for existing elements
  function initExistingScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
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
  }
  
  // Initialize all modules when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTools();
      initExistingScrollReveal();
    });
  } else {
    initTools();
    initExistingScrollReveal();
  }
})();
