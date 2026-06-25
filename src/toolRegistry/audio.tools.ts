import type { ToolRegistryEntry } from '../types/tool';

export const audioTools: ToolRegistryEntry[] = [
  {
    id: 'compress-audio',
    name: 'Audio Compressor',
    category: 'audio',
    categorySlug: 'audio-tools',
    slug: '/audio-tools/compress-audio',
    description: 'Compress MP3, WAV, FLAC, and OGG audio files to reduce size without sacrificing quality.',
    icon: 'fa-compress',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Free Audio Compressor Online - ToolTari',
      description: 'Reduce audio file sizes securely in-browser. Compress MP3, WAV, AAC, and FLAC client-side with complete privacy.',
      keywords: ['audio compressor', 'compress mp3', 'reduce audio size', 'shrink wav file']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['trim-audio', 'convert-audio', 'volume-audio']
  },
  {
    id: 'trim-audio',
    name: 'Audio Cutter & Trim',
    category: 'audio',
    categorySlug: 'audio-tools',
    slug: '/audio-tools/trim-audio',
    description: 'Cut and trim audio files with a visual waveform representation and offline playback controls.',
    icon: 'fa-scissors',
    popularity: 5,
    status: 'active',
    seo: {
      title: 'Visual Audio Cutter & Trim Online - ToolTari',
      description: 'Trim your MP3, WAV, and AAC music files visually. Silence detection markers, drag sliders, and instant local export.',
      keywords: ['audio cutter', 'trim mp3', 'music splitter', 'cut audio online']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5 enabled browser'
    },
    relatedTools: ['compress-audio', 'volume-audio', 'convert-audio']
  },
  {
    id: 'volume-audio',
    name: 'Volume Booster',
    category: 'audio',
    categorySlug: 'audio-tools',
    slug: '/audio-tools/volume-audio',
    description: 'Boost audio volume levels or normalize gain parameters safely in your browser.',
    icon: 'fa-volume-up',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Online Volume Booster & Normalizer - ToolTari',
      description: 'Increase volume levels or normalize sound dynamics in your browser RAM. Simple adjustment factor inputs.',
      keywords: ['volume booster', 'audio normalizer', 'boost mp3 volume', 'increase wav gain']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['trim-audio', 'compress-audio', 'metadata-audio']
  },
  {
    id: 'convert-audio',
    name: 'Audio Converter',
    category: 'audio',
    categorySlug: 'audio-tools',
    slug: '/audio-tools/convert-audio',
    description: 'Transcode between MP3, WAV, AAC, FLAC, OGG, and OPUS audio formats securely.',
    icon: 'fa-music',
    popularity: 4,
    status: 'active',
    seo: {
      title: 'Free Audio Converter - MP3/WAV/AAC - ToolTari',
      description: 'Convert music and recordings client-side. Convert WAV to MP3, MP3 to AAC, or FLAC formats in browser RAM.',
      keywords: ['audio converter', 'convert wav to mp3', 'mp3 format changer', 'flac to mp3']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires HTML5 Canvas/WASM enabled browser'
    },
    relatedTools: ['compress-audio', 'trim-audio', 'volume-audio']
  },
  {
    id: 'metadata-audio',
    name: 'Audio Tag Editor',
    category: 'audio',
    categorySlug: 'audio-tools',
    slug: '/audio-tools/metadata-audio',
    description: 'View and edit audio tags including title, artist, album, genre, and year values.',
    icon: 'fa-tags',
    popularity: 3,
    status: 'active',
    seo: {
      title: 'Online Audio ID3 Metadata Tag Editor - ToolTari',
      description: 'Read and write Title, Artist, Album, Genre, and Year tags on MP3/WAV audio streams client-side.',
      keywords: ['mp3 tag editor', 'edit audio metadata', 'id3 tagger', 'edit mp3 properties']
    },
    schema: {
      type: 'WebApplication',
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript enabled browser'
    },
    relatedTools: ['volume-audio', 'convert-audio', 'trim-audio']
  }
];
