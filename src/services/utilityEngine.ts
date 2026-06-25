import JSZip from 'jszip';

export const utilityEngine = {
  // ZIP File Compressor (using JSZip)
  async compressToZip(
    files: File[],
    onProgress?: (percent: number, message: string) => void
  ): Promise<Blob> {
    if (files.length === 0) throw new Error('No files selected for ZIP compression.');
    const zip = new JSZip();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const stepPercent = Math.floor((i / files.length) * 90);
      onProgress?.(stepPercent, `Adding file ${i + 1} of ${files.length}: ${file.name}...`);
      zip.file(file.name, file);
    }
    
    onProgress?.(95, 'Generating ZIP archive...');
    const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      onProgress?.(95 + Math.floor(metadata.percent / 20), 'Writing binary streams...');
    });
    
    onProgress?.(100, 'ZIP packaging completed!');
    return zipBlob;
  },

  // Password Generator
  generatePassword(options: {
    length: number;
    upper: boolean;
    lower: boolean;
    nums: boolean;
    symbols: boolean;
  }): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbolsChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let allowedChars = '';
    let requiredChars = [];

    if (options.upper) {
      allowedChars += uppercase;
      requiredChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    }
    if (options.lower) {
      allowedChars += lowercase;
      requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    }
    if (options.nums) {
      allowedChars += numbers;
      requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }
    if (options.symbols) {
      allowedChars += symbolsChars;
      requiredChars.push(symbolsChars[Math.floor(Math.random() * symbolsChars.length)]);
    }

    if (allowedChars.length === 0) {
      throw new Error('Please select at least one character set.');
    }

    let password = [...requiredChars];
    const fillLength = options.length - requiredChars.length;

    for (let i = 0; i < fillLength; i++) {
      const randIdx = Math.floor(Math.random() * allowedChars.length);
      password.push(allowedChars[randIdx]);
    }

    // Shuffle characters
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
  },

  // Password Strength Checker
  checkPasswordStrength(password: string): {
    score: number; // 0 to 4
    label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
    entropy: number;
    feedback: string[];
  } {
    if (!password) {
      return { score: 0, label: 'Very Weak', entropy: 0, feedback: ['Enter a password to evaluate.'] };
    }

    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;

    // Calculate Information Entropy (L * log2(R))
    const entropy = Math.round(password.length * (Math.log(charsetSize) / Math.log(2)));
    
    let score = 0;
    if (entropy > 35) score++;
    if (entropy > 59) score++;
    if (entropy > 79) score++;
    if (entropy > 119) score++;

    const labels: ('Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong')[] = [
      'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'
    ];

    const feedback: string[] = [];
    if (password.length < 8) feedback.push('Password is too short (minimum 8 characters).');
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters to increase strength.');
    if (!/[0-9]/.test(password)) feedback.push('Add numbers to increase strength.');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters to increase strength.');

    return {
      score,
      label: labels[score],
      entropy,
      feedback: feedback.length > 0 ? feedback : ['Perfect! Safe password configuration.']
    };
  },

  // Base64 encoding and decoding
  encodeBase64(text: string): string {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      throw new Error('Encoding failed. Text contains invalid characters.');
    }
  },

  decodeBase64(base64: string): string {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      throw new Error('Decoding failed. Input is not a valid Base64 string.');
    }
  },

  // Convert files/images to Base64 data URL
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  // Color Converter HEX/RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length !== 3 && cleanHex.length !== 6) return null;

    let r = 0, g = 0, b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  },

  rgbToHex(r: number, g: number, b: number): string {
    const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
    const rh = clamp(r).toString(16).padStart(2, '0');
    const gh = clamp(g).toString(16).padStart(2, '0');
    const bh = clamp(b).toString(16).padStart(2, '0');
    return `#${rh}${gh}${bh}`;
  },

  // Batch renamer
  renameFiles(
    files: File[],
    options: {
      prefix: string;
      suffix: string;
      replaceFind: string;
      replaceWith: string;
      indexing: boolean;
    }
  ): string[] {
    return files.map((file, idx) => {
      // Get filename without extension
      const dotIdx = file.name.lastIndexOf('.');
      const name = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
      const ext = dotIdx !== -1 ? file.name.substring(dotIdx) : '';

      let newName = name;
      if (options.replaceFind) {
        newName = newName.split(options.replaceFind).join(options.replaceWith);
      }

      newName = `${options.prefix}${newName}${options.suffix}`;

      if (options.indexing) {
        newName = `${newName}_${idx + 1}`;
      }

      return `${newName}${ext}`;
    });
  }
};
