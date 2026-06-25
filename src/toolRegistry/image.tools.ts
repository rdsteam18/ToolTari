import type { ToolRegistryEntry } from '../types/tool';

export const imageTools: ToolRegistryEntry[] = [
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/image-to-pdf',
    description: 'Convert JPG, PNG, WebP images to PDF. Multiple images supported.',
    icon: 'fa-file-pdf',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Convert Image to PDF Free - ToolTari',
      description: 'Convert JPG, PNG, WebP, GIF, or BMP images to a clean PDF document. Drag and drop multiple images to merge into a single PDF.',
      keywords: ['image to pdf', 'convert jpg to pdf', 'png to pdf', 'photos to pdf']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['compress-image', 'image-converter', 'pdf-to-image']
  },
  {
    id: 'compress-image',
    name: 'Compress Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/compress-image',
    description: 'Reduce image file size while maintaining high visual quality.',
    icon: 'fa-compress',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Compress Image Online Free - ToolTari',
      description: 'Compress PNG, JPEG, WebP, or SVG images. Optimize file size for web speed and storage while retaining sharp visual detail.',
      keywords: ['compress image', 'reduce image size', 'shrink jpeg', 'png optimizer']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['resize-image', 'image-converter', 'crop-image']
  },
  {
    id: 'resize-image',
    name: 'Resize Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/resize-image',
    description: 'Change image dimensions by height and width with aspect ratio preservation.',
    icon: 'fa-expand',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Resize Image Online Free - ToolTari',
      description: 'Change dimensions (width and height in pixels) of your images in-browser. Fast, free, and completely local.',
      keywords: ['resize image', 'change image dimensions', 'crop and resize', 'image scale']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['compress-image', 'crop-image', 'rotate-image']
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/crop-image',
    description: 'Select coordinates and crop your images to the perfect bounding box size.',
    icon: 'fa-crop',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Crop Image Online Free - ToolTari',
      description: 'Select customized aspect ratios or drag selection boundaries to crop photos securely. No file upload required.',
      keywords: ['crop image', 'cut image', 'photo cropper', 'trim picture']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['resize-image', 'compress-image', 'image-filter']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/image-converter',
    description: 'Convert between JPG, PNG, WebP, GIF, BMP, TIFF, SVG, and ICO formats.',
    icon: 'fa-exchange-alt',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Image Converter Online Free - ToolTari',
      description: 'Convert images to PNG, JPG, WebP, or SVG formats instantly. All processing occurs locally in browser memory.',
      keywords: ['image converter', 'convert png to jpg', 'convert webp', 'free image format changer']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['compress-image', 'image-to-pdf', 'resize-image']
  },
  {
    id: 'rotate-image',
    name: 'Rotate Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/rotate-image',
    description: 'Rotate images 90°, 180°, 270° or flip horizontally and vertically.',
    icon: 'fa-redo-alt',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Rotate Image Online Free - ToolTari',
      description: 'Rotate images clockwise or counter-clockwise or flip axes. Client-side canvas graphics manipulation.',
      keywords: ['rotate image', 'flip photo', 'mirror image', 'turn photo']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['resize-image', 'image-filter', 'watermark-image']
  },
  {
    id: 'image-filter',
    name: 'Image Filter',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/image-filter',
    description: 'Apply grayscale, sepia, brightness, contrast, and modern visual filters.',
    icon: 'fa-magic',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Apply Filters to Images Free - ToolTari',
      description: 'Adjust brightness, contrast, grayscale, sepia, or apply filters to photos locally in-browser.',
      keywords: ['image filter', 'photo effects', 'grayscale online', 'edit image colors']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['watermark-image', 'rotate-image', 'blur-image']
  },
  {
    id: 'blur-image',
    name: 'Blur Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/image-blur',
    description: 'Apply Gaussian blur filters to your photos with adjustable intensity variables.',
    icon: 'fa-tint',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Blur Image Online Free - ToolTari',
      description: 'Apply adjustable Gaussian blur filters to highlight regions or soften photo details securely in-browser.',
      keywords: ['blur image', 'gaussian blur', 'soften photo', 'blur background']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['image-filter', 'watermark-image', 'crop-image']
  },
  {
    id: 'image-metadata',
    name: 'Image Metadata Viewer',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/image-metadata',
    description: 'Inspect EXIF details including camera settings, geolocation tags, and date taken variables.',
    icon: 'fa-info-circle',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Image Metadata & EXIF Viewer Free - ToolTari',
      description: 'Read camera attributes, GPS locations, focal lengths, and capture timestamp EXIF metadata embedded in photos.',
      keywords: ['image metadata', 'exif viewer', 'view exif online', 'photo details inspector']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['image-converter', 'compress-image', 'watermark-image']
  },
  {
    id: 'watermark-image',
    name: 'Watermark Image',
    category: 'image',
    categorySlug: 'image-tools',
    slug: '/image-tools/watermark-image',
    description: 'Add text watermarks to images with custom positions, fonts, and opacity variables.',
    icon: 'fa-paintbrush',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Watermark Image Online Free - ToolTari',
      description: 'Overlay watermarks, logos, or copyright tags onto photos. Client-side canvas calculations ensure zero remote copies.',
      keywords: ['watermark image', 'add text to photo', 'copyright stamp', 'image overlay']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5, WebAssembly, and JavaScript enabled modern browser'
    },
    relatedTools: ['image-filter', 'blur-image', 'rotate-image']
  }
];
