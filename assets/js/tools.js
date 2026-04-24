// ========== TOOLS.JS - Core PDF Processing Logic (FIXED) ==========

(function() {
  'use strict';
  
  // Wait for pdfLib to be available
  function waitForPdfLib() {
    return new Promise((resolve) => {
      if (typeof pdfLib !== 'undefined' && pdfLib && pdfLib.PDFDocument) {
        resolve(pdfLib);
        return;
      }
      
      // Check if window.pdfLib exists (different loading method)
      if (typeof window.pdfLib !== 'undefined' && window.pdfLib && window.pdfLib.PDFDocument) {
        resolve(window.pdfLib);
        return;
      }
      
      // Wait for script to load
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((typeof pdfLib !== 'undefined' && pdfLib && pdfLib.PDFDocument) ||
            (typeof window.pdfLib !== 'undefined' && window.pdfLib && window.pdfLib.PDFDocument)) {
          clearInterval(interval);
          resolve(pdfLib || window.pdfLib);
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error('PDF library failed to load after 5 seconds'));
        }
      }, 100);
    });
  }
  
  // Make sure pdfLib is available globally
  let PDFLib = null;
  
  // ========== MERGE PDF FUNCTION ==========
  async function mergePDFs(pdfFiles) {
    const lib = PDFLib || (typeof pdfLib !== 'undefined' ? pdfLib : window.pdfLib);
    if (!lib || !lib.PDFDocument) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = lib;
    const mergedPdf = await PDFDocument.create();
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const fileName = `merged_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== COMPRESS PDF FUNCTION ==========
  async function compressPDF(pdfFiles) {
    const lib = PDFLib || (typeof pdfLib !== 'undefined' ? pdfLib : window.pdfLib);
    if (!lib || !lib.PDFDocument) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = lib;
    
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to compress.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });
    
    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const fileName = `compressed_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== SPLIT PDF FUNCTION ==========
  async function splitPDF(pdfFiles) {
    const lib = PDFLib || (typeof pdfLib !== 'undefined' ? pdfLib : window.pdfLib);
    if (!lib || !lib.PDFDocument) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = lib;
    
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to split.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const pageCount = sourcePdf.getPageCount();
    
    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(sourcePdf, [0]);
    newPdf.addPage(firstPage);
    
    const splitBytes = await newPdf.save();
    const blob = new Blob([splitBytes], { type: 'application/pdf' });
    const fileName = `split_page1_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== ROTATE PDF FUNCTION ==========
  async function rotatePDF(pdfFiles, degrees = 90) {
    const lib = PDFLib || (typeof pdfLib !== 'undefined' ? pdfLib : window.pdfLib);
    if (!lib || !lib.PDFDocument) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument, degrees: pdfDegrees } = lib;
    
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to rotate.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    pages.forEach(page => {
      page.setRotation(pdfDegrees(degrees));
    });
    
    const rotatedBytes = await pdfDoc.save();
    const blob = new Blob([rotatedBytes], { type: 'application/pdf' });
    const fileName = `rotated_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== INITIALIZE PDF LIBRARY ==========
  async function initPDFLibrary() {
    try {
      PDFLib = await waitForPdfLib();
      console.log('PDF library loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load PDF library:', error);
      return false;
    }
  }
  
  // ========== EXPORT FUNCTIONS ==========
  window.ToolTariTools = {
    mergePDFs,
    compressPDF,
    splitPDF,
    rotatePDF,
    initPDFLibrary,
    isReady: () => !!PDFLib
  };
  
  // Auto-initialize
  initPDFLibrary();
  
  console.log('Tools.js loaded - waiting for PDF library');
})();
