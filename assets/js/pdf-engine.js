// ========== PDF ADVANCED ENGINE - Complete Production Version ==========
// Reusable PDF editing engine for all ToolTari PDF tools
// Features: Load PDF, delete pages, reorder pages, rotate pages, extract pages,
//           add watermarks, add page numbers, protect with password, unlock PDF, redact content

(function() {
  'use strict';
  
  // ========== PDFEngine Class - Core PDF Manipulation ==========
  class PDFEngine {
    constructor() {
      this.originalFile = null;
      this.pdfDoc = null;
      this.pages = []; // Array of page references
      this.pageCount = 0;
      this.isLoaded = false;
      this.pdfLib = null;
      this.loadingPromise = null;
    }
    
    // Initialize pdf-lib library
    async init() {
      // Check if pdfLib is already available
      if (typeof pdfLib !== 'undefined' && pdfLib && pdfLib.PDFDocument) {
        this.pdfLib = pdfLib;
        return true;
      }
      if (typeof window.pdfLib !== 'undefined' && window.pdfLib && window.pdfLib.PDFDocument) {
        this.pdfLib = window.pdfLib;
        return true;
      }
      
      // Wait for pdf-lib to load (max 10 seconds)
      if (this.loadingPromise) return this.loadingPromise;
      
      this.loadingPromise = new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (typeof pdfLib !== 'undefined' && pdfLib && pdfLib.PDFDocument) {
            this.pdfLib = pdfLib;
            clearInterval(interval);
            resolve(true);
          } else if (typeof window.pdfLib !== 'undefined' && window.pdfLib && window.pdfLib.PDFDocument) {
            this.pdfLib = window.pdfLib;
            clearInterval(interval);
            resolve(true);
          } else if (attempts > 100) { // 10 seconds timeout
            clearInterval(interval);
            console.error('PDF library failed to load');
            resolve(false);
          }
        }, 100);
      });
      
      return this.loadingPromise;
    }
    
    // Load PDF from File object
    async loadPDF(file) {
      const initialized = await this.init();
      if (!initialized || !this.pdfLib) {
        throw new Error('PDF library not loaded. Please refresh the page.');
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
    
    // Load PDF from ArrayBuffer (for unlocked PDFs)
    async loadPDFFromBuffer(arrayBuffer, fileName = 'document.pdf') {
      const initialized = await this.init();
      if (!initialized || !this.pdfLib) {
        throw new Error('PDF library not loaded. Please refresh the page.');
      }
      
      this.pdfDoc = await this.pdfLib.PDFDocument.load(arrayBuffer);
      this.pageCount = this.pdfDoc.getPageCount();
      this.pages = [];
      
      for (let i = 0; i < this.pageCount; i++) {
        this.pages.push({
          index: i,
          pageNumber: i + 1,
          originalIndex: i
        });
      }
      
      this.isLoaded = true;
      this.originalFile = { name: fileName };
      
      return {
        pageCount: this.pageCount,
        fileName: fileName
      };
    }
    
    // Get current pages (after operations)
    getCurrentPages() {
      return this.pages.map((p, idx) => ({
        ...p,
        currentOrder: idx + 1
      }));
    }
    
    // Get total page count
    getPageCount() {
      return this.pageCount;
    }
    
    // Delete selected pages
    deletePages(selectedIndices) {
      if (!this.isLoaded) throw new Error('No PDF loaded');
      
      const indicesToDelete = new Set(selectedIndices);
      this.pages = this.pages.filter((_, idx) => !indicesToDelete.has(idx));
      
      return {
        deleted: selectedIndices.length,
        remaining: this.pages.length
      };
    }
    
    // Reorder pages (drag and drop)
    reorderPages(fromIndex, toIndex) {
      if (!this.isLoaded) throw new Error('No PDF loaded');
      if (fromIndex === toIndex) return;
      
      const [movedPage] = this.pages.splice(fromIndex, 1);
      this.pages.splice(toIndex, 0, movedPage);
    }
    
    // Extract selected pages to a new PDF (returns blob)
    async extractPages(selectedIndices) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      if (selectedIndices.length === 0) throw new Error('No pages selected');
      
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
        const currentRotation = page.getRotation().angle || 0;
        const newRotation = (currentRotation + degrees) % 360;
        page.setRotation(this.pdfLib.degrees(newRotation));
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
    
    // Reset to original PDF
    async reset() {
      if (!this.originalFile) return false;
      return this.loadPDF(this.originalFile);
    }
    
    // ========== WATERMARK FUNCTIONS ==========
    
    // Add text watermark to all pages
    async addWatermark(watermarkText, position = 'center', opacity = 0.3) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      const pages = this.pdfDoc.getPages();
      const font = await this.pdfDoc.embedFont(this.pdfLib.StandardFonts.HelveticaBold);
      
      // Get first page dimensions for positioning
      const firstPage = pages[0];
      const pageWidth = firstPage.getWidth();
      const pageHeight = firstPage.getHeight();
      
      // Position mapping
      const positions = {
        'top-left': { x: 50, y: pageHeight - 50 },
        'top-right': { x: pageWidth - this.calculateTextWidth(watermarkText, font, 40) - 50, y: pageHeight - 50 },
        'center': { x: (pageWidth - this.calculateTextWidth(watermarkText, font, 40)) / 2, y: pageHeight / 2 },
        'bottom-left': { x: 50, y: 50 },
        'bottom-right': { x: pageWidth - this.calculateTextWidth(watermarkText, font, 40) - 50, y: 50 }
      };
      
      const pos = positions[position] || positions.center;
      
      for (const page of pages) {
        page.drawText(watermarkText, {
          x: pos.x,
          y: pos.y,
          size: 40,
          font: font,
          color: this.pdfLib.rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: this.pdfLib.degrees(45)
        });
      }
      
      return true;
    }
    
    // Helper: calculate text width
    calculateTextWidth(text, font, size) {
      return font.widthOfTextAtSize(text, size);
    }
    
    // ========== PAGE NUMBER FUNCTIONS ==========
    
    // Add page numbers to all pages
    async addPageNumbers(position = 'bottom-center', startFrom = 1, fontSize = 10) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      const pages = this.pdfDoc.getPages();
      const font = await this.pdfDoc.embedFont(this.pdfLib.StandardFonts.Helvetica);
      const pageCount = pages.length;
      
      for (let i = 0; i < pageCount; i++) {
        const page = pages[i];
        const pageNumber = startFrom + i;
        const text = `Page ${pageNumber} of ${pageCount}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x, y;
        if (position === 'bottom-center') {
          x = (page.getWidth() - textWidth) / 2;
          y = 30;
        } else if (position === 'bottom-right') {
          x = page.getWidth() - textWidth - 30;
          y = 30;
        } else if (position === 'bottom-left') {
          x = 30;
          y = 30;
        } else if (position === 'top-center') {
          x = (page.getWidth() - textWidth) / 2;
          y = page.getHeight() - 30;
        } else if (position === 'top-right') {
          x = page.getWidth() - textWidth - 30;
          y = page.getHeight() - 30;
        } else {
          x = 30;
          y = page.getHeight() - 30;
        }
        
        page.drawText(text, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: this.pdfLib.rgb(0, 0, 0)
        });
      }
      
      return true;
    }
    
    // ========== PASSWORD PROTECTION ==========
    
    // Add password protection to PDF
    async protectPDF(password) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      if (!password || password.length < 4) throw new Error('Password must be at least 4 characters');
      
      this.pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false
        }
      });
      
      return true;
    }
    
    // Unlock password-protected PDF
    async unlockPDF(password) {
      if (!this.originalFile) throw new Error('No file loaded');
      
      try {
        const arrayBuffer = await this.originalFile.arrayBuffer();
        this.pdfDoc = await this.pdfLib.PDFDocument.load(arrayBuffer, { password: password });
        this.pageCount = this.pdfDoc.getPageCount();
        this.pages = [];
        
        for (let i = 0; i < this.pageCount; i++) {
          this.pages.push({
            index: i,
            pageNumber: i + 1,
            originalIndex: i
          });
        }
        
        this.isLoaded = true;
        return { success: true, pageCount: this.pageCount };
      } catch (error) {
        throw new Error('Incorrect password or file cannot be unlocked');
      }
    }
    
    // Check if PDF is password protected
    async isPasswordProtected(file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        await this.pdfLib.PDFDocument.load(arrayBuffer);
        return false;
      } catch (error) {
        return error.message && error.message.includes('password');
      }
    }
    
    // ========== REDACTION FUNCTIONS ==========
    
    // Add black rectangles to hide content (redaction)
    async addRedaction(redactions) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      const pages = this.pdfDoc.getPages();
      
      for (const redaction of redactions) {
        if (redaction.pageIndex < pages.length) {
          const page = pages[redaction.pageIndex];
          page.drawRectangle({
            x: redaction.x,
            y: redaction.y,
            width: redaction.width,
            height: redaction.height,
            color: this.pdfLib.rgb(0, 0, 0),
            opacity: 1,
            borderWidth: 0
          });
        }
      }
      
      return true;
    }
    
    // Simple redaction by page range (blackout entire page range)
    async redactPages(pageIndices) {
      if (!this.pdfDoc) throw new Error('No PDF loaded');
      
      const pages = this.pdfDoc.getPages();
      
      for (const idx of pageIndices) {
        if (idx < pages.length) {
          const page = pages[idx];
          page.drawRectangle({
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
            color: this.pdfLib.rgb(0, 0, 0),
            opacity: 1,
            borderWidth: 0
          });
        }
      }
      
      return true;
    }
    
    // ========== UTILITY FUNCTIONS ==========
    
    // Get page as image data URL (for thumbnail using PDF.js)
    async getPageThumbnail(pageIndex, scale = 0.2) {
      if (!this.originalFile) return null;
      
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
    
    // Get document info
    async getDocumentInfo() {
      if (!this.pdfDoc) return null;
      
      return {
        pageCount: this.pageCount,
        fileName: this.originalFile?.name || 'document.pdf',
        fileSize: this.originalFile?.size || 0
      };
    }
  }
  
  // ========== PDFPageUIManager Class - UI Rendering ==========
  class PDFPageUIManager {
    constructor(containerId, engine) {
      this.container = document.getElementById(containerId);
      this.engine = engine;
      this.selectedPages = new Set();
      this.onSelectionChange = null;
      this.onReorder = null;
      this.sortableInstance = null;
      this.showThumbnails = true;
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
                <div class="page-thumbnail-placeholder" data-page="${page.pageNumber}">
                  <i class="fas fa-file-pdf"></i>
                  <span>Page ${page.pageNumber}</span>
                </div>
              </div>
              <div class="page-number-display">${page.pageNumber}</div>
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
          e.stopPropagation();
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
      
      // Generate thumbnails if enabled
      if (this.showThumbnails) {
        this.generateThumbnails();
      }
    }
    
    // Generate page thumbnails asynchronously
    async generateThumbnails() {
      const placeholders = document.querySelectorAll('.page-thumbnail-placeholder');
      
      for (let i = 0; i < placeholders.length && i < this.engine.pageCount; i++) {
        try {
          const thumbnail = await this.engine.getPageThumbnail(i, 0.15);
          if (thumbnail && placeholders[i]) {
            placeholders[i].innerHTML = `<img src="${thumbnail}" alt="Page ${i + 1}" class="page-thumbnail-img">`;
          }
        } catch (error) {
          // Keep placeholder, silent fail
        }
      }
    }
    
    // Get selected page indices
    getSelectedIndices() {
      return Array.from(this.selectedPages);
    }
    
    // Get selected count
    getSelectedCount() {
      return this.selectedPages.size;
    }
    
    // Clear all selections
    clearSelection() {
      this.selectedPages.clear();
      this.renderPages();
      if (this.onSelectionChange) {
        this.onSelectionChange([]);
      }
    }
    
    // Select all pages
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
    
    // Invert selection
    invertSelection() {
      const pageCount = this.engine.getCurrentPages().length;
      const newSelection = new Set();
      for (let i = 0; i < pageCount; i++) {
        if (!this.selectedPages.has(i)) {
          newSelection.add(i);
        }
      }
      this.selectedPages = newSelection;
      this.renderPages();
      if (this.onSelectionChange) {
        this.onSelectionChange(Array.from(this.selectedPages));
      }
    }
    
    // Set selection change callback
    setSelectionChangeCallback(callback) {
      this.onSelectionChange = callback;
    }
    
    // Set reorder callback
    setReorderCallback(callback) {
      this.onReorder = callback;
    }
    
    // Enable/disable thumbnails
    setShowThumbnails(show) {
      this.showThumbnails = show;
    }
    
    // Initialize SortableJS for drag & drop reordering
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
          
          // Reorder engine pages based on new DOM order
          for (let newIdx = 0; newIdx < items.length; newIdx++) {
            const item = items[newIdx];
            const oldIdx = parseInt(item.getAttribute('data-index'));
            if (oldIdx !== newIdx) {
              this.engine.reorderPages(oldIdx, newIdx);
            }
          }
          
          // Re-render to update indices
          const wasSelected = Array.from(this.selectedPages);
          this.selectedPages.clear();
          await this.renderPages();
          
          // Restore selections where possible
          for (const idx of wasSelected) {
            if (idx < this.engine.getCurrentPages().length) {
              this.selectedPages.add(idx);
            }
          }
          this.renderPages();
          
          if (this.onReorder) {
            this.onReorder();
          }
        }
      });
    }
    
    // Destroy Sortable instance
    destroySortable() {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
        this.sortableInstance = null;
      }
    }
  }
  
  // ========== Export ==========
  window.ToolTariPDFEngine = {
    PDFEngine,
    PDFPageUIManager,
    version: '2.0.0'
  };
  
  console.log('PDF Advanced Engine v2.0 loaded successfully');
})();
