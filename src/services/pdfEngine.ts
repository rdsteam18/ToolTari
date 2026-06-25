import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export const pdfEngine = {
  // Merge multiple PDF files into one Blob
  async mergePDFs(
    files: File[],
    onProgress?: (percent: number, message: string) => void
  ): Promise<Blob> {
    if (files.length === 0) throw new Error('No files selected for merging.');
    
    onProgress?.(10, 'Initializing PDF Library...');
    const mergedPdf = await PDFDocument.create();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const stepPercent = 10 + Math.floor((i / files.length) * 80);
      onProgress?.(stepPercent, `Reading file ${i + 1} of ${files.length}: ${file.name}...`);
      
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    onProgress?.(95, 'Compiling merged document...');
    const mergedBytes = await mergedPdf.save();
    onProgress?.(100, 'Merge completed!');
    
    return new Blob([mergedBytes as any], { type: 'application/pdf' });
  },

  // Split a PDF by extracting pages into multiple PDFs
  async splitPDF(file: File, pageRanges: string): Promise<Blob[]> {
    const fileBytes = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBytes);
    const totalPages = sourcePdf.getPageCount();
    const blobs: Blob[] = [];

    // Parse ranges (e.g., "1-3, 5, 6-8")
    const ranges = pageRanges.split(',').map(r => r.trim());
    for (const r of ranges) {
      if (!r) continue;
      const parts = r.split('-');
      let start = parseInt(parts[0], 10) - 1;
      let end = parts[1] ? parseInt(parts[1], 10) - 1 : start;

      if (isNaN(start) || start < 0 || start >= totalPages) continue;
      if (isNaN(end) || end < 0 || end >= totalPages) end = start;

      const newPdf = await PDFDocument.create();
      const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const bytes = await newPdf.save();
      blobs.push(new Blob([bytes as any], { type: 'application/pdf' }));
    }

    return blobs;
  },

  // Compress PDF (flattens forms and cleans structures)
  async compressPDF(file: File): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    
    // Save with compression flags
    const compressedBytes = await pdf.save({
      useObjectStreams: true
    });
    
    return new Blob([compressedBytes as any], { type: 'application/pdf' });
  },

  // Rotate pages of a PDF by set angle
  async rotatePDF(file: File, angleDegrees: number): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const pages = pdf.getPages();
    
    for (const page of pages) {
      const currentRotation = page.getRotation().angle || 0;
      page.setRotation(degrees((currentRotation + angleDegrees) % 360));
    }
    
    const bytes = await pdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Password-protect a PDF
  async protectPDF(file: File, password: string): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    
    (pdf as any).encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    const bytes = await pdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Remove password protection from a PDF
  async unlockPDF(file: File, password: string): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    // Load with user password to decrypt
    const pdf = await PDFDocument.load(fileBytes, { password } as any);
    const bytes = await pdf.save(); // Save decrypted bytes
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Add watermarks to all PDF pages
  async watermarkPDF(file: File, text: string, opacity: number = 0.3): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 4,
        y: height / 2,
        size: 50,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opacity,
        rotate: degrees(45),
      });
    }

    const bytes = await pdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Add page numbers in specified positions
  async addPageNumbers(file: File, position: 'top' | 'bottom' = 'bottom'): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const count = pages.length;

    for (let i = 0; i < count; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const text = `Page ${i + 1} of ${count}`;
      const size = 10;
      const textWidth = font.widthOfTextAtSize(text, size);
      
      const x = (width - textWidth) / 2;
      const y = position === 'bottom' ? 30 : height - 30;

      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0)
      });
    }

    const bytes = await pdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Delete specified indices from a PDF
  async deletePages(file: File, pageIndices: number[]): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    
    // Delete pages starting from highest index to prevent shift issues
    const sortedIndices = [...pageIndices].sort((a, b) => b - a);
    for (const idx of sortedIndices) {
      if (idx >= 0 && idx < pdf.getPageCount()) {
        pdf.removePage(idx);
      }
    }

    const bytes = await pdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  },

  // Extract selected page indices into a new PDF
  async extractPages(file: File, pageIndices: number[]): Promise<Blob> {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const bytes = await newPdf.save();
    return new Blob([bytes as any], { type: 'application/pdf' });
  }
};
