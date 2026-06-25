import type { ToolRegistryEntry } from '../types/tool';

export const developerTools: ToolRegistryEntry[] = [
  {
    id: 'base64-converter',
    name: 'Base64 Converter',
    category: 'developer',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/base64-converter',
    description: 'Encode text to Base64 or decode Base64 strings to raw text securely.',
    icon: 'fa-code',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Base64 Encoder/Decoder Free - ToolTari',
      description: 'Convert plain text to Base64 formatting or decode strings client-side. Complete privacy for API tokens and passwords.',
      keywords: ['base64 encoder', 'base64 decoder', 'base64 convert', 'text to base64']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['image-to-base64', 'password-generator', 'text-converter']
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    category: 'developer',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/image-to-base64',
    description: 'Convert images to Base64 strings for embedding directly in HTML or CSS.',
    icon: 'fa-code',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Image to Base64 Converter Online - ToolTari',
      description: 'Convert JPG, PNG, SVG or WebP images to Base64 data URLs for seamless CSS/HTML embeds. Private browser conversion.',
      keywords: ['image to base64', 'convert picture to base64', 'data url generator']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5 enabled browser'
    },
    relatedTools: ['base64-converter', 'image-converter', 'color-converter']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'security',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/password-generator',
    description: 'Generate cryptographically strong random passwords with custom parameters.',
    icon: 'fa-key',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Random Password Generator Free - ToolTari',
      description: 'Generate highly secure, customizable passwords locally in your browser. Select lengths, casing, numbers, and symbols.',
      keywords: ['password generator', 'strong password creator', 'random key generator', 'secure password generator']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['password-strength', 'base64-converter', 'random-number']
  },
  {
    id: 'password-strength',
    name: 'Password Strength Checker',
    category: 'security',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/password-strength',
    description: 'Evaluate password strength and complexity metrics with real-time feedback.',
    icon: 'fa-shield-alt',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Password Strength Meter Online - ToolTari',
      description: 'Check how secure your password is using real-time entropy metrics and complexity grading locally.',
      keywords: ['password strength checker', 'evaluate password entropy', 'password checker']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['password-generator', 'base64-converter', 'random-number']
  },
  {
    id: 'random-number',
    name: 'Random Number Generator',
    category: 'utility',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/random-number-generator',
    description: 'Generate single or sequence arrays of random numbers for giveaways or stats.',
    icon: 'fa-random',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Random Number Generator Free - ToolTari',
      description: 'Pick single or multiple random numbers between custom ranges instantly. High randomness index.',
      keywords: ['random number generator', 'number picker', 'pick random number', 'rng online']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['password-generator', 'file-renamer', 'color-converter']
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    category: 'design',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/color-converter',
    description: 'Convert colors between HEX, RGB, and HSL formats. Select colors dynamically.',
    icon: 'fa-palette',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'HEX to RGB Color Converter Free - ToolTari',
      description: 'Translate color codes between HEX, RGB, and HSL palettes instantly. Perfect for designers and developers.',
      keywords: ['hex to rgb', 'rgb to hex', 'color code converter', 'color palette picker']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['image-to-base64', 'random-number', 'base64-converter']
  },
  {
    id: 'file-renamer',
    name: 'Batch File Renamer',
    category: 'utility',
    categorySlug: 'developer-tools',
    slug: '/developer-tools/file-renamer',
    description: 'Batch rename multiple local files with custom prefixes, suffixes, search/replace, or indexing.',
    icon: 'fa-i-cursor',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Batch File Renamer Online - ToolTari',
      description: 'Rename files in batches online using formatting rules. Safe local manipulation prevents leaks.',
      keywords: ['batch file renamer', 'rename files online', 'file renamer utility']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['zip-compressor', 'random-number', 'base64-converter']
  },
  {
    id: 'text-converter',
    name: 'Text Case Converter',
    category: 'text',
    categorySlug: 'text-tools',
    slug: '/text-tools/text-converter',
    description: 'Adjust casing formats of paragraphs (UPPERCASE, lowercase, Title Case, Sentence Case).',
    icon: 'fa-underline',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Text Case Converter Free - ToolTari',
      description: 'Convert paragraph casing online. Change words to uppercase, lowercase, sentence case, or title formatting instantly.',
      keywords: ['text converter', 'uppercase online', 'sentence case converter', 'lowercase formatting']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'TextApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['word-counter', 'base64-converter', 'password-generator']
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    category: 'text',
    categorySlug: 'text-tools',
    slug: '/text-tools/word-counter',
    description: 'Count words, characters, sentences, paragraphs, and reading times instantly.',
    icon: 'fa-calculator',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Word Counter Online Free - ToolTari',
      description: 'Count characters, words, sentences, and layout structures in real-time. Calculate density metrics locally.',
      keywords: ['word counter', 'character count', 'word checker', 'free character counter']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'TextApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['text-converter', 'base64-converter', 'password-generator']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'qr',
    categorySlug: 'qr-tools',
    slug: '/qr-tools/qr-generator',
    description: 'Create customized QR codes for URLs, plain text, Wi-Fi parameters, and contacts.',
    icon: 'fa-qrcode',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'QR Code Generator Free Online - ToolTari',
      description: 'Generate high-quality custom QR codes for websites, emails, or credentials. Select custom sizing and colors.',
      keywords: ['qr code generator', 'make qr code', 'free qr creator', 'generate custom qr']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['qr-scanner', 'image-to-base64', 'color-converter']
  },
  {
    id: 'qr-scanner',
    name: 'QR Code Scanner',
    category: 'qr',
    categorySlug: 'qr-tools',
    slug: '/qr-tools/qr-scanner',
    description: 'Scan and read QR codes using local webcam streams or upload files.',
    icon: 'fa-camera',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'QR Code Scanner Online Free - ToolTari',
      description: 'Scan QR codes using webcams or uploaded images. Processing occurs locally frame-by-frame; no webcam streams leave your device.',
      keywords: ['qr scanner', 'read qr code online', 'scan barcode', 'camera qr scanner']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5 camera permissions enabled browser'
    },
    relatedTools: ['qr-generator', 'image-to-base64', 'file-renamer']
  },
  {
    id: 'zip-compressor',
    name: 'ZIP File Compressor',
    category: 'archive',
    categorySlug: 'archive-tools',
    slug: '/archive-tools/zip-compressor',
    description: 'Pack multiple files or folders into a single compressed ZIP archive locally.',
    icon: 'fa-file-archive',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'ZIP File Compressor Online Free - ToolTari',
      description: 'Compress files, images, or documents into a clean ZIP folder. Browser-native compile ensures instant downloads.',
      keywords: ['zip compressor', 'create zip online', 'compress files to zip', 'archive maker']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5 enabled browser'
    },
    relatedTools: ['file-renamer', 'compress-image', 'compress-pdf']
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'converter',
    categorySlug: 'converter-tools',
    slug: '/converter-tools/word-to-pdf',
    description: 'Convert DOCX, DOC, or office files into PDF format online.',
    icon: 'fa-file-pdf',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Word to PDF Converter Online Free - ToolTari',
      description: 'Convert Word document layers (DOCX) to clean PDFs client-side in browser memory.',
      keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf', 'office converter']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ConverterApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['image-to-pdf', 'pdf-to-word', 'zip-compressor']
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail Downloader',
    category: 'media',
    categorySlug: 'video-tools',
    slug: '/video-tools/youtube-thumbnail',
    description: 'Extract and save high-quality cover images and thumbnails from YouTube videos.',
    icon: 'fab fa-youtube',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'YouTube Thumbnail Downloader Online - ToolTari',
      description: 'Download full-resolution, high-definition thumbnails from any YouTube URL instantly.',
      keywords: ['youtube thumbnail downloader', 'save youtube cover', 'youtube image extractor']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'MediaApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires Internet access'
    },
    relatedTools: ['instagram-downloader', 'image-converter', 'resize-image']
  },
  {
    id: 'instagram-downloader',
    name: 'Instagram Media Downloader',
    category: 'media',
    categorySlug: 'video-tools',
    slug: '/video-tools/instagram-downloader',
    description: 'Inspect and save files and image cover resources from Instagram urls.',
    icon: 'fab fa-instagram',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Instagram Downloader & Media Preview - ToolTari',
      description: 'Preview and extract image and media structures from Instagram shares in-browser.',
      keywords: ['instagram downloader', 'instagram photo saver', 'save insta content']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'MediaApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires Internet access'
    },
    relatedTools: ['youtube-thumbnail', 'image-converter', 'resize-image']
  }
];
