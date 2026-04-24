// ========== PDF ADVANCED ENGINE - Reusable Core System ==========
// This file provides a complete PDF editing engine that can be used across all PDF tools
// Features: Load PDF, extract pages, delete, reorder, rotate, extract, rebuild

(function() {
  'use strict';
  
  // ========== PDF Engine Class ==========
  class PDFEngine {
    constructor() {
      this.originalFile = null;
      this.pdfDoc = null;
      this.pages = []; // Array of page references
      this.pageCount = 0;
      this.isLoaded = false;
      this.pdfLib = null;
    }
    
    // Initialize pdf-lib
    async init() {
      if (typeof pdfLib !== 'undefined') {
        this.pdfLib = pdfLib;
        return true;
      }
      if (typeof window.pdfLib !== 'undefined') {
        this.pdfLib = window.pdfLib;
        return true;
      }
      
      // Wait for pdf-lib to load
      return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (typeof pdfLib !== 'undefined') {
            this.pdfLib = pdfLib;
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 50) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
      });
    }
    
    // Load PDF from File object
    async loadPDF(file) {
      if (!await this.init()) {
        throw new Error('PDF library not loaded');
      }
      
      this.originalFile = file;
      const arrayBuffer = await file.arrayBuffer();
      this.pdfDoc = await this.pdfLib.PDFDocument.load(arrayBuffer);
      this.pageCount = this.pdfDoc.getPageCount();
      this.pages = [];
      
      // Store page references
      for (let i = 0; i < this.pageCount; i++) {
        this.pages.push({
          index: i,
          pageNumber: i + 1,
          originalIndex: i
        });
      }
      
      this.isLoaded = true;
      return {
        pageCount: this.pageCount,
        fileName: file.name,
        fileSize: file.size
      };
    }
    
    // Get current pages (after operations)
    getCurrentPages() {
      return this.pages.map((p, idx) => ({
        ...p,
        currentOrder: idx + 1
      }));
    }
    
    // Delete selected pages
    deletePages(selectedIndices) {
      const indicesToDelete = new Set(selectedIndices);
      this.pages = this.pages.filter((_, idx) => !indicesToDelete.has(idx));
      return {
        deleted: selectedIndices.length,
        remaining: this.pages.length
      };
    }
    
    // Reorder pages (drag and drop)
    reorderPages(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;
      const [movedPage] = this.pages.splice(fromIndex, 1);
      this.pages.splice(toIndex, 0, movedPage);
    }
    
    // Extract selected pages to a new PDF (returns blob)
    async extractPages(selectedIndices) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      const newPdf = await this.pdfLib.PDFDocument.create();
      const pagesToExtract = selectedIndices.map(idx => this.pages[idx].originalIndex);
      
      for (const pageIndex of pagesToExtract) {
        const [copiedPage] = await newPdf.copyPages(this.pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
      }
      
      const bytes = await newPdf.save();
      return new Blob([bytes], { type: 'application/pdf' });
    }
    
    // Rotate selected pages
    async rotatePages(selectedIndices, degrees) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      for (const idx of selectedIndices) {
        const pageIndex = this.pages[idx].originalIndex;
        const page = this.pdfDoc.getPage(pageIndex);
        page.setRotation(this.pdfLib.degrees(degrees));
      }
      return { rotated: selectedIndices.length };
    }
    
    // Rebuild final PDF from current page order
    async rebuildPDF() {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      if (this.pages.length === 0) throw new Error('No pages to rebuild');
      
      const newPdf = await this.pdfLib.PDFDocument.create();
      
      for (const page of this.pages) {
        const [copiedPage] = await newPdf.copyPages(this.pdfDoc, [page.originalIndex]);
        newPdf.addPage(copiedPage);
      }
      
      const bytes = await newPdf.save();
      return new Blob([bytes], { type: 'application/pdf' });
    }
    
    // Reset to original
    reset() {
      if (!this.originalFile) return false;
      return this.loadPDF(this.originalFile);
    }
    
    // Get page as image data URL (for thumbnail)
    async getPageThumbnail(pageIndex, scale = 0.2) {
      if (!this.pdfDoc) return null;
      
      // This requires pdf.js for thumbnails
      if (typeof pdfjsLib === 'undefined') return null;
      
      try {
        const arrayBuffer = await this.originalFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        return canvas.toDataURL();
      } catch (error) {
        console.error('Thumbnail generation error:', error);
        return null;
      }
    }
  }
  
  // ========== UI Page Manager ==========
  class PDFPageUIManager {
    constructor(containerId, engine) {
      this.container = document.getElementById(containerId);
      this.engine = engine;
      this.selectedPages = new Set();
      this.onSelectionChange = null;
      this.onReorder = null;
      this.sortableInstance = null;
    }
    
    // Render pages grid
    async renderPages() {
      if (!this.container) return;
      
      const pages = this.engine.getCurrentPages();
      
      if (pages.length === 0) {
        this.container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-file-pdf"></i>
            <p>No pages to display</p>
          </div>
        `;
        return;
      }
      
      this.container.innerHTML = `
        <div class="pdf-pages-grid" id="pdfPagesGrid">
          ${pages.map(page => `
            <div class="pdf-page-card ${this.selectedPages.has(page.currentOrder - 1) ? 'selected' : ''}" 
                 data-index="${page.currentOrder - 1}" 
                 data-page-number="${page.pageNumber}">
              <div class="page-selector">
                <input type="checkbox" class="page-checkbox" data-index="${page.currentOrder - 1}" 
                       ${this.selectedPages.has(page.currentOrder - 1) ? 'checked' : ''}>
              </div>
              <div class="page-thumbnail-container">
                <div class="page-thumbnail-placeholder">
                  <i class="fas fa-file-pdf"></i>
                  <span>Page ${page.pageNumber}</span>
                </div>
              </div>
              <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Attach checkbox events
      document.querySelectorAll('.page-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const idx = parseInt(checkbox.getAttribute('data-index'));
          if (checkbox.checked) {
            this.selectedPages.add(idx);
          } else {
            this.selectedPages.delete(idx);
          }
          
          // Update card selection style
          const card = checkbox.closest('.pdf-page-card');
          if (card) {
            if (checkbox.checked) {
              card.classList.add('selected');
            } else {
              card.classList.remove('selected');
            }
          }
          
          if (this.onSelectionChange) {
            this.onSelectionChange(Array.from(this.selectedPages));
          }
        });
      });
      
      // Generate thumbnails async
      this.generateThumbnails();
    }
    
    async generateThumbnails() {
      const placeholders = document.querySelectorAll('.page-thumbnail-placeholder');
      
      for (let i = 0; i < placeholders.length && i < this.engine.pageCount; i++) {
        try {
          const thumbnail = await this.engine.getPageThumbnail(i, 0.15);
          if (thumbnail && placeholders[i]) {
            placeholders[i].innerHTML = `<img src="${thumbnail}" alt="Page ${i + 1}" class="page-thumbnail-img">`;
          }
        } catch (error) {
          // Keep placeholder
        }
      }
    }
    
    getSelectedIndices() {
      return Array.from(this.selectedPages);
    }
    
    clearSelection() {
      this.selectedPages.clear();
      this.renderPages();
      if (this.onSelectionChange) {
        this.onSelectionChange([]);
      }
    }
    
    selectAll() {
      const pageCount = this.engine.getCurrentPages().length;
      this.selectedPages.clear();
      for (let i = 0; i < pageCount; i++) {
        this.selectedPages.add(i);
      }
      this.renderPages();
      if (this.onSelectionChange) {
        this.onSelectionChange(Array.from(this.selectedPages));
      }
    }
    
    setReorderCallback(callback) {
      this.onReorder = callback;
    }
    
    initSortable() {
      const grid = document.getElementById('pdfPagesGrid');
      if (!grid || typeof Sortable === 'undefined') return;
      
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
      }
      
      this.sortableInstance = new Sortable(grid, {
        handle: '.drag-handle',
        animation: 300,
        onEnd: async () => {
          const items = grid.querySelectorAll('.pdf-page-card');
          const oldIndices = this.engine.getCurrentPages().map(p => p.currentOrder - 1);
          
          // Reorder engine pages based on new DOM order
          for (let newIdx = 0; newIdx < items.length; newIdx++) {
            const item = items[newIdx];
            const oldIdx = parseInt(item.getAttribute('data-index'));
            if (oldIdx !== newIdx) {
              this.engine.reorderPages(oldIdx, newIdx);
            }
          }
          
          // Re-render to update indices
          this.selectedPages.clear();
          await this.renderPages();
          
          if (this.onReorder) {
            this.onReorder();
          }
        }
      });
    }
  }
  
  // ========== Export ==========
  window.ToolTariPDFEngine = {
    PDFEngine,
    PDFPageUIManager
  };
  
  console.log('PDF Advanced Engine loaded');
})();
