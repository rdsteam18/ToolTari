// ========== TOOLS.JS - Core PDF Processing Logic ==========
// This file contains all PDF processing functions that will be used by individual tool pages

(function() {
  'use strict';
  
  // Make pdfLib available globally
  window.pdfLib = window.pdfLib || (typeof pdfLib !== 'undefined' ? pdfLib : null);
  
  // ========== MERGE PDF FUNCTION ==========
  async function mergePDFs(pdfFiles) {
    if (!window.pdfLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = window.pdfLib;
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
  
  // ========== COMPRESS PDF FUNCTION (Basic version) ==========
  async function compressPDF(pdfFiles) {
    if (!window.pdfLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = window.pdfLib;
    
    // For single file compression
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to compress.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Load and re-save with compression
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    // Optional: Remove metadata, compress images (simplified)
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });
    
    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const fileName = `compressed_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== SPLIT PDF FUNCTION (Extract first page as demo) ==========
  async function splitPDF(pdfFiles) {
    if (!window.pdfLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument } = window.pdfLib;
    
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to split.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const pageCount = sourcePdf.getPageCount();
    
    // Create a new PDF with first page only (for demo)
    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(sourcePdf, [0]);
    newPdf.addPage(firstPage);
    
    const splitBytes = await newPdf.save();
    const blob = new Blob([splitBytes], { type: 'application/pdf' });
    const fileName = `split_page1_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== PDF TO IMAGE (Placeholder - requires additional library) ==========
  async function pdfToImage(pdfFiles) {
    // Note: Full PDF to Image conversion requires canvas and pdf.js
    // This is a placeholder that will be implemented with pdf.js
    throw new Error('PDF to Image tool coming soon!');
  }
  
  // ========== IMAGE TO PDF (Placeholder) ==========
  async function imageToPDF(imageFiles) {
    throw new Error('Image to PDF tool coming soon!');
  }
  
  // ========== WORD TO PDF (Placeholder) ==========
  async function wordToPDF(wordFiles) {
    throw new Error('Word to PDF tool coming soon!');
  }
  
  // ========== PDF TO WORD (Placeholder) ==========
  async function pdfToWord(pdfFiles) {
    throw new Error('PDF to Word tool coming soon!');
  }
  
  // ========== ROTATE PDF FUNCTION ==========
  async function rotatePDF(pdfFiles, degrees = 90) {
    if (!window.pdfLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument, degrees: pdfDegrees } = window.pdfLib;
    
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
  
  // ========== ADD WATERMARK FUNCTION ==========
  async function addWatermark(pdfFiles, watermarkText = 'ToolTari') {
    if (!window.pdfLib) {
      throw new Error('PDF library not loaded. Please refresh the page.');
    }
    
    const { PDFDocument, rgb, StandardFonts } = window.pdfLib;
    
    if (pdfFiles.length !== 1) {
      throw new Error('Please select exactly one PDF file to watermark.');
    }
    
    const file = pdfFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 50,
        y: height / 2,
        size: 30,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.3,
        rotate: pdfLib.degrees(45)
      });
    });
    
    const watermarkedBytes = await pdfDoc.save();
    const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
    const fileName = `watermarked_${Date.now()}.pdf`;
    
    return { blob, fileName };
  }
  
  // ========== EXPORT FUNCTIONS GLOBALLY ==========
  window.ToolTariTools = {
    mergePDFs,
    compressPDF,
    splitPDF,
    pdfToImage,
    imageToPDF,
    wordToPDF,
    pdfToWord,
    rotatePDF,
    addWatermark
  };
  
  console.log('Tools.js loaded - PDF processing functions ready');
})();
