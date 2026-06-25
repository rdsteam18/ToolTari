import type { ToolRegistryEntry } from '../types/tool';

export const pdfTools: ToolRegistryEntry[] = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/merge-pdf',
    description: 'Combine multiple PDF files into one document. Drag and drop to reorder pages.',
    icon: 'fa-object-group',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Merge PDF Online Free - ToolTari',
      description: 'Combine multiple PDF files into one document easily. Drag, drop, reorder, and merge PDFs locally in your browser memory for 100% security.',
      keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'free pdf merger']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['split-pdf', 'compress-pdf', 'protect-pdf']
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/split-pdf',
    description: 'Split PDF into multiple files. Extract specific pages or split at intervals.',
    icon: 'fa-cut',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Split PDF Online Free - ToolTari',
      description: 'Split PDF into multiple documents or extract specific page ranges locally in your browser. Fast, secure, and free.',
      keywords: ['split pdf', 'extract pdf pages', 'cut pdf document', 'separate pdf pages']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['merge-pdf', 'compress-pdf', 'extract-pages']
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/compress-pdf',
    description: 'Reduce PDF file size while maintaining quality. Perfect for email attachments.',
    icon: 'fa-compress',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Compress PDF Online Free - ToolTari',
      description: 'Compress PDF files online to reduce file size without losing quality. Native browser execution guarantees complete document safety.',
      keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf size optimizer']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['merge-pdf', 'split-pdf', 'protect-pdf']
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/protect-pdf',
    description: 'Add password protection and encryption to your PDF files securely in browser.',
    icon: 'fa-lock',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Protect PDF Online Free - ToolTari',
      description: 'Add password protection and strict encryption permissions to your PDF files. Secure browser-based execution protects your document credentials.',
      keywords: ['protect pdf', 'encrypt pdf', 'password protect pdf', 'secure pdf']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['unlock-pdf', 'compress-pdf', 'merge-pdf']
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/unlock-pdf',
    description: 'Remove password protection and restrictions from PDF files locally.',
    icon: 'fa-unlock-alt',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Unlock PDF Online Free - ToolTari',
      description: 'Remove password restrictions and lock privileges from PDF files. All processing occurs locally in browser memory.',
      keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'free pdf unlocker']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['protect-pdf', 'compress-pdf', 'merge-pdf']
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF Pages',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/rotate-pdf',
    description: 'Rotate pages in your PDF document 90°, 180°, or 270° and save.',
    icon: 'fa-redo-alt',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Rotate PDF Pages Free Online - ToolTari',
      description: 'Rotate PDF pages 90 degrees clockwise, counter-clockwise, or 180 degrees. Re-orient documents securely in browser memory.',
      keywords: ['rotate pdf', 'turn pdf pages', 'reorient pdf', 'flip pdf pages']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['merge-pdf', 'split-pdf', 'watermark-pdf']
  },
  {
    id: 'watermark-pdf',
    name: 'Watermark PDF',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/watermark-pdf',
    description: 'Add custom text watermarks to all pages of your PDF document.',
    icon: 'fa-paintbrush',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Watermark PDF Online Free - ToolTari',
      description: 'Add text watermarks, security markings, or branding overlays to PDF documents locally in-browser.',
      keywords: ['watermark pdf', 'add watermark to pdf', 'stamp pdf pages', 'pdf branding']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['add-page-numbers', 'rotate-pdf', 'protect-pdf']
  },
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/add-page-numbers',
    description: 'Add page numbers to your PDF document with custom positioning.',
    icon: 'fa-sort-numeric-up',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Add Page Numbers to PDF Free - ToolTari',
      description: 'Add pagination index arrays (Page X of Y) to PDF pages securely. Customizable positions.',
      keywords: ['add page numbers to pdf', 'paginate pdf', 'number pdf pages', 'free pdf numbering']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['watermark-pdf', 'merge-pdf', 'protect-pdf']
  },
  {
    id: 'delete-pages',
    name: 'Delete PDF Pages',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/delete-pages',
    description: 'Remove unwanted pages from your PDF document easily in browser.',
    icon: 'fa-trash-alt',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Delete PDF Pages Free - ToolTari',
      description: 'Delete specific pages from a PDF. Clean up slides or documents client-side.',
      keywords: ['delete pdf pages', 'remove pages from pdf', 'cut pages pdf']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['extract-pages', 'split-pdf', 'merge-pdf']
  },
  {
    id: 'extract-pages',
    name: 'Extract PDF Pages',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/extract-pages',
    description: 'Extract specific pages from your PDF into a new, smaller document.',
    icon: 'fa-file-export',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Extract PDF Pages Online Free - ToolTari',
      description: 'Extract specific pages from a PDF file online. Re-compile into a separate PDF locally and securely.',
      keywords: ['extract pdf pages', 'save pdf pages separately', 'take pages out of pdf']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['delete-pages', 'split-pdf', 'merge-pdf']
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/pdf-to-word',
    description: 'Extract text from PDF and convert to editable Word document (RTF).',
    icon: 'fa-file-word',
    popularity: 5,
    status: 'coming-soon',
    seo: {
      title: 'PDF to Word Converter Online - ToolTari',
      description: 'Convert PDF files to editable Word documents (DOCX/RTF) free. Text extraction runs entirely locally.',
      keywords: ['pdf to word', 'convert pdf to docx', 'pdf to doc', 'pdf converter']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['pdf-to-ppt', 'pdf-to-image', 'merge-pdf']
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/pdf-to-ppt',
    description: 'Transform PDF slides into editable PowerPoint presentations.',
    icon: 'fa-chalkboard',
    popularity: 3,
    status: 'coming-soon',
    seo: {
      title: 'PDF to PowerPoint Converter Free - ToolTari',
      description: 'Convert PDF slides into editable PowerPoint PPTX files online without uploading data to servers.',
      keywords: ['pdf to ppt', 'pdf to powerpoint', 'convert pdf to pptx', 'slides converter']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['pdf-to-word', 'pdf-to-image', 'merge-pdf']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    category: 'pdf',
    categorySlug: 'pdf-tools',
    slug: '/pdf-tools/pdf-to-image',
    description: 'Convert PDF pages to JPG or PNG images. Extract every page as an image.',
    icon: 'fa-image',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'PDF to Image Converter Free - ToolTari',
      description: 'Convert PDF pages into high-quality JPEG or PNG images. Client-side extraction ensures your pages remain secure.',
      keywords: ['pdf to image', 'convert pdf to png', 'extract pages as jpg', 'pdf to jpg']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['pdf-to-word', 'merge-pdf', 'image-to-pdf']
  }
];
