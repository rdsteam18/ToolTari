export interface ClusterItem {
  title: string;
  url: string;
}

export interface CategoryCluster {
  tools: ClusterItem[];
  guides: ClusterItem[];
  comparisons: ClusterItem[];
  faq: ClusterItem[];
  glossary: ClusterItem[];
  troubleshooting: ClusterItem[];
  resources: ClusterItem[];
}

export const CLUSTERS_DATA: Record<string, CategoryCluster> = {
  "pdf-tools": {
    tools: [
      { title: "Merge PDF Tool", url: "/pdf-tools/merge-pdf" },
      { title: "Split PDF Tool", url: "/pdf-tools/split-pdf" },
      { title: "Compress PDF Tool", url: "/pdf-tools/compress-pdf" },
      { title: "Protect PDF Tool", url: "/pdf-tools/protect-pdf" }
    ],
    guides: [
      { title: "How to Compress PDF Online", url: "/blog/compress-pdf-online" },
      { title: "How to Merge PDFs Step-by-Step", url: "/blog/merge-pdf-guide" },
      { title: "Complete Guide to PDF Tools", url: "/blog/pdf-tools-guide" }
    ],
    comparisons: [
      { title: "PDF vs Word Format Comparison", url: "/blog/pdf-vs-word" },
      { title: "Merge PDF vs PDF Combine Differences", url: "/blog/pdf-merge-vs-combine" }
    ],
    faq: [
      { title: "PDF Security & Safety FAQs", url: "/blog/pdf-security-faqs" }
    ],
    glossary: [
      { title: "What is OCR (Optical Character Recognition)?", url: "/blog/what-is-ocr" },
      { title: "What is PDF?", url: "/blog/what-is-pdf" },
      { title: "What is PDF Compression?", url: "/blog/what-is-pdf-compression" }
    ],
    troubleshooting: [
      { title: "Fixing Common PDF Errors", url: "/blog/pdf-not-opening" },
      { title: "Resolving Large File PDF Upload Failures", url: "/blog/large-pdf-issues" }
    ],
    resources: [
      { title: "Ultimate Document Optimization Checklist", url: "/blog/document-optimization-checklist" }
    ]
  },
  "image-tools": {
    tools: [
      { title: "Compress Image Tool", url: "/image-tools/compress-image" },
      { title: "Resize Image Tool", url: "/image-tools/resize-image" },
      { title: "Image Converter Tool", url: "/image-tools/image-converter" },
      { title: "Crop Image Tool", url: "/image-tools/crop-image" }
    ],
    guides: [
      { title: "How to Reduce Image Size", url: "/blog/reduce-image-size" },
      { title: "Convert Images to PDF Guide", url: "/blog/image-to-pdf-guide" }
    ],
    comparisons: [
      { title: "PNG vs JPG Image Formatting Comparison", url: "/blog/png-vs-jpg" },
      { title: "WebP vs PNG Performance Metrics", url: "/blog/webp-vs-png" }
    ],
    faq: [
      { title: "Image Compression FAQ & Metadata Safety", url: "/blog/image-compression-faqs" }
    ],
    glossary: [
      { title: "What is WebP?", url: "/blog/what-is-webp" },
      { title: "What is DPI?", url: "/blog/what-is-dpi" },
      { title: "What is Metadata?", url: "/blog/what-is-metadata" }
    ],
    troubleshooting: [
      { title: "Resolving Image Quality Degradation Issues", url: "/blog/image-compression-issues" }
    ],
    resources: [
      { title: "Responsive Image Integration Checklist", url: "/blog/responsive-image-checklist" }
    ]
  },
  "developer-tools": {
    tools: [
      { title: "Base64 Converter Tool", url: "/developer-tools/base64-converter" },
      { title: "Password Generator Tool", url: "/developer-tools/password-generator" },
      { title: "Password Strength Checker", url: "/developer-tools/password-strength" }
    ],
    guides: [
      { title: "How to Generate Cryptographically Secure Passwords", url: "/blog/password-generator-guide" },
      { title: "Base64 Encoding & Decoding Guide", url: "/blog/base64-converter-guide" }
    ],
    comparisons: [
      { title: "Base64 Encoding vs Hex Strings", url: "/blog/base64-vs-hex" }
    ],
    faq: [
      { title: "Developer Tools Local Sandboxed Safety FAQs", url: "/blog/dev-security-faqs" }
    ],
    glossary: [
      { title: "What is Base64?", url: "/blog/what-is-base64" },
      { title: "What is Hex Encoding?", url: "/blog/what-is-hex" }
    ],
    troubleshooting: [
      { title: "Fixing Code Syntax Encoding Faults", url: "/blog/code-encoding-errors" }
    ],
    resources: [
      { title: "Secure Password Policies Resource Sheet", url: "/blog/password-policy-cheat-sheet" }
    ]
  }
};
