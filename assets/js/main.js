// /assets/js/main.js
// Core application logic, tool data fetching, rendering, analytics and global utilities

(function() {
  'use strict';
  
  // ========== TOOL DATASETS (fallback & enrichment) ==========
  const POPULAR_TOOLS = [
    { id: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDF files into a single document in seconds.", icon: "fa-object-group", color: "#4F46E5", category: "popular" },
    { id: "split-pdf", name: "Split PDF", description: "Split a PDF file into separate documents or extract specific pages.", icon: "fa-cut", color: "#06B6D4", category: "popular" },
    { id: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size while preserving quality for easy sharing.", icon: "fa-compress", color: "#10b981", category: "popular" },
    { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF documents to editable Word files with high accuracy.", icon: "fa-file-word", color: "#ef4444", category: "popular" }
  ];
  
  const ALL_TOOLS = [
    { id: "pdf-to-ppt", name: "PDF to PowerPoint", description: "Transform PDF slides into editable PowerPoint presentations.", icon: "fa-chalkboard", color: "#f59e0b" },
    { id: "protect-pdf", name: "Protect PDF", description: "Add password protection to your PDF files.", icon: "fa-lock", color: "#8b5cf6" },
    { id: "unlock-pdf", name: "Unlock PDF", description: "Remove password protection from PDF files.", icon: "fa-unlock-alt", color: "#ec489a" },
    { id: "compress-image", name: "Compress Image", description: "Reduce image file size without losing quality.", icon: "fa-image", color: "#14b8a6" },
    { id: "crop-image", name: "Crop Image", description: "Crop and resize images to fit your needs.", icon: "fa-crop", color: "#3b82f6" },
    { id: "image-converter", name: "Image Converter", description: "Convert between JPG, PNG, WebP, and other formats.", icon: "fa-exchange-alt", color: "#a855f7" },
    { id: "word-converter", name: "Word Converter", description: "Convert Word documents to PDF and other formats.", icon: "fa-file-alt", color: "#2dd4bf" },
    { id: "excel-converter", name: "Excel Converter", description: "Convert Excel spreadsheets to PDF and other formats.", icon: "fa-file-excel", color: "#22c55e" },
    { id: "qr-generator", name: "QR Code Generator", description: "Create QR codes for URLs, text, and contact information.", icon: "fa-qrcode", color: "#6366f1" },
    { id: "watermark", name: "Watermark Tool", description: "Add text or image watermarks to PDFs and images.", icon: "fa-paintbrush", color: "#f97316" },
    { id: "zip-compressor", name: "File Compressor", description: "Compress multiple files into ZIP archives.", icon: "fa-file-archive", color: "#d946ef" },
    { id: "esignature", name: "E-Signature", description: "Add electronic signatures to documents securely.", icon: "fa-signature", color: "#0ea5e9" }
  ];
  
  const EXTENDED_ALL_TOOLS = [...POPULAR_TOOLS, ...ALL_TOOLS];
  
  // ========== RENDER TOOL CARDS ==========
  function renderToolCards(containerId, toolsArray, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }
    
    if (!toolsArray || toolsArray.length === 0) {
      container.innerHTML = '<div class="error-placeholder">⚠️ Unable to load tools. Please refresh.</div>';
      return;
    }
    
    const cardsHtml = toolsArray.map(tool => `
      <div class="tool-card scroll-reveal" data-tool-id="${tool.id}">
        <div class="tool-icon" style="background-color: ${tool.color || '#4F46E5'}20; color: ${tool.color || '#4F46E6'}">
          <i class="fas ${tool.icon}"></i>
        </div>
        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
        <p class="tool-description">${escapeHtml(tool.description)}</p>
        <button class="btn-tool-use" data-toolname="${escapeHtml(tool.name)}">
          Use Tool <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `).join('');
    
    container.innerHTML = cardsHtml;
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  // ========== FETCH TOOLS FROM JSON ENDPOINT ==========
  async function fetchToolsFromAPI() {
    try {
      const response = await fetch('/data/tools.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // support both { tools: [...] } or direct array
      if (data && Array.isArray(data.tools)) return data.tools;
      if (Array.isArray(data)) return data;
      return null;
    } catch (error) {
      console.warn('Fetch from /data/tools.json failed:', error);
      return null;
    }
  }
  
  async function initializeToolGrids() {
    // Try to fetch from API first
    let apiTools = await fetchToolsFromAPI();
    
    if (apiTools && apiTools.length) {
      // separate popular and all based on category or first 4 as popular
      const popular = apiTools.filter(t => t.category === 'popular').slice(0, 4);
      if (popular.length) {
        renderToolCards('popularToolsGrid', popular);
      } else {
        renderToolCards('popularToolsGrid', apiTools.slice(0, 4));
      }
      renderToolCards('allToolsGrid', apiTools);
    } else {
      // use fallback datasets
      renderToolCards('popularToolsGrid', POPULAR_TOOLS);
      renderToolCards('allToolsGrid', EXTENDED_ALL_TOOLS);
    }
  }
  
  // ========== STATS COUNTER ANIMATION ==========
  function animateStats() {
    const statsNumbers = document.querySelectorAll('.stat-number');
    if (!statsNumbers.length) return;
    
    const observerOptions = { threshold: 0.5 };
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetText = el.innerText;
          const targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(targetNumber) && !el.dataset.animated) {
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
  
  // ========== PERFORMANCE & LOAD HANDLING ==========
  function trackPageLoad() {
    if ('performance' in window && 'mark' in performance) {
      performance.mark('tooltari-loaded');
    }
    console.log('ToolTari Main initialized — Fast, secure, free.');
  }
  
  // ========== INITIALIZE ALL MODULES ==========
  document.addEventListener('DOMContentLoaded', async () => {
    await initializeToolGrids();
    animateStats();
    trackPageLoad();
    
    // Additional dynamic lazy images if any (none needed)
    // Prefetch tool interactions (delegated to ui.js)
  });
  
  // Export utilities for potential debugging (global)
  window.ToolTari = {
    version: '1.0.0',
    tools: EXTENDED_ALL_TOOLS,
    rerenderTools: initializeToolGrids
  };
  
})();
