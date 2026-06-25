import type { ToolRegistryEntry } from '../types/tool';

export const aiTools: ToolRegistryEntry[] = [
  {
    id: 'chat-pdf',
    name: 'Chat with PDF',
    category: 'ai',
    categorySlug: 'ai-tools',
    slug: '/ai-tools/chat-pdf',
    description: 'Ask questions, summarize findings, and extract insights from PDF documents using AI.',
    icon: 'fa-robot',
    popularity: 5,
    status: 'coming-soon',
    seo: {
      title: 'Chat with PDF Online Free - ToolTari',
      description: 'Interact with your PDF documents using artificial intelligence. Ask questions and get summaries in real-time.',
      keywords: ['chat with pdf', 'ai pdf reader', 'pdf summarizer ai', 'chatpdf free']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AiApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires modern web browser with Internet access'
    },
    relatedTools: ['merge-pdf', 'pdf-to-word', 'compress-pdf']
  },
  {
    id: 'ai-writer',
    name: 'AI Copywriter',
    category: 'ai',
    categorySlug: 'ai-tools',
    slug: '/ai-tools/ai-writer',
    description: 'Draft emails, articles, and marketing copy using AI providers locally.',
    icon: 'fa-pen-fancy',
    popularity: 4,
    status: 'coming-soon',
    seo: {
      title: 'AI Copywriter & Copy Generator - ToolTari',
      description: 'Draft marketing copy, blog posts, and emails instantly with advanced AI assistance.',
      keywords: ['ai copywriter', 'ai writer', 'generate blog content', 'free ai copy']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AiApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires modern web browser with Internet access'
    },
    relatedTools: ['text-converter', 'word-counter', 'chat-pdf']
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    category: 'ai',
    categorySlug: 'ai-tools',
    slug: '/ai-tools/ocr-pdf',
    description: 'Extract text from scanned PDF documents locally using browser OCR engines.',
    icon: 'fa-file-invoice',
    popularity: 5,
    status: 'coming-soon',
    seo: {
      title: 'Free PDF OCR Online - ToolTari',
      description: 'Run OCR on scanned PDF documents to extract editable text. 100% private in-browser conversions.',
      keywords: ['pdf ocr', 'ocr pdf online', 'extract text from pdf', 'scanned pdf to text']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AiApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires modern web browser with Internet access'
    },
    relatedTools: ['chat-pdf', 'compress-pdf', 'merge-pdf']
  },
  {
    id: 'ocr-image',
    name: 'Image to Text',
    category: 'ai',
    categorySlug: 'ai-tools',
    slug: '/ai-tools/ocr-image',
    description: 'Convert scanned images (JPG, PNG, WebP) to editable text files.',
    icon: 'fa-font',
    popularity: 5,
    status: 'coming-soon',
    seo: {
      title: 'Free Image to Text Converter Online - ToolTari',
      description: 'Convert PNG, JPG, or WebP images to editable text locally. Private client-side OCR tool.',
      keywords: ['image to text', 'convert image to text', 'jpg to text', 'online ocr free']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AiApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires modern web browser with Internet access'
    },
    relatedTools: ['ai-writer', 'compress-image', 'image-converter']
  }
];
