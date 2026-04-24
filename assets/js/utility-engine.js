// ========== UTILITY TOOLS ENGINE - Reusable Core ==========
// Provides common functions for all utility tools

(function() {
  'use strict';
  
  // ========== Utility Functions ==========
  const UtilityTools = {
    
    // ========== Text Tools ==========
    
    // Character Counter
    countCharacters(text) {
      return {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
        lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
        sentences: text === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphs: text === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        spaces: (text.match(/\s/g) || []).length,
        punctuation: (text.match(/[.,!?;:'"()]/g) || []).length
      };
    },
    
    // Text Case Converter
    convertCase(text, type) {
      switch(type) {
        case 'upper': return text.toUpperCase();
        case 'lower': return text.toLowerCase();
        case 'title': return text.replace(/\b\w/g, c => c.toUpperCase());
        case 'sentence': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        case 'inverse': return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        default: return text;
      }
    },
    
    // Word Counter (detailed)
    getWordStats(text) {
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const wordCount = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
      return { totalWords: words.length, uniqueWords: Object.keys(wordCount).length, topWords: sorted };
    },
    
    // ========== Number Tools ==========
    
    // Number Format
    formatNumber(num, format) {
      const n = parseFloat(num);
      if(isNaN(n)) return 'Invalid number';
      
      switch(format) {
        case 'comma': return n.toLocaleString('en-US');
        case 'indian': return n.toLocaleString('en-IN');
        case 'compact': return n.toLocaleString('en-US', { notation: 'compact' });
        case 'percent': return (n * 100).toFixed(2) + '%';
        case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
        case 'scientific': return n.toExponential(4);
        default: return n.toString();
      }
    },
    
    // Number to Words
    numberToWords(num) {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      const convertHundreds = (n) => {
        if(n === 0) return '';
        if(n < 10) return ones[n];
        if(n < 20) return teens[n - 10];
        if(n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertHundreds(n % 100) : '');
      };
      
      if(num === 0) return 'Zero';
      let n = Math.floor(num);
      let result = '';
      if(n >= 10000000) { result += convertHundreds(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
      if(n >= 100000) { result += convertHundreds(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
      if(n >= 1000) { result += convertHundreds(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
      if(n >= 100) { result += convertHundreds(Math.floor(n / 100)) + ' Hundred '; n %= 100; }
      if(n > 0) result += convertHundreds(n);
      return result.trim();
    },
    
    // Random Number Generator
    generateRandom(min, max, count) {
      const results = [];
      for(let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      return results;
    },
    
    // ========== Color Tools ==========
    
    // Hex to RGB
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    },
    
    // RGB to Hex
    rgbToHex(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // Generate Random Color
    randomColor() {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },
    
    // ========== Password Tools ==========
    
    // Password Generator
    generatePassword(length = 12, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      let chars = '';
      if(options.uppercase) chars += upper;
      if(options.lowercase) chars += lower;
      if(options.numbers) chars += numbers;
      if(options.symbols) chars += symbols;
      
      if(chars === '') chars = lower + numbers;
      
      let password = '';
      for(let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      
      // Ensure at least one of each selected type
      if(options.uppercase && !/[A-Z]/.test(password)) password = password.slice(0, -1) + upper[Math.floor(Math.random() * upper.length)];
      if(options.lowercase && !/[a-z]/.test(password)) password = password.slice(0, -1) + lower[Math.floor(Math.random() * lower.length)];
      if(options.numbers && !/[0-9]/.test(password)) password = password.slice(0, -1) + numbers[Math.floor(Math.random() * numbers.length)];
      if(options.symbols && !/[!@#$%^&*()_+=-]/.test(password)) password = password.slice(0, -1) + symbols[Math.floor(Math.random() * symbols.length)];
      
      return password;
    },
    
    // Password Strength Checker
    checkPasswordStrength(password) {
      let score = 0;
      if(password.length >= 8) score++;
      if(password.length >= 12) score++;
      if(/[A-Z]/.test(password)) score++;
      if(/[a-z]/.test(password)) score++;
      if(/[0-9]/.test(password)) score++;
      if(/[^A-Za-z0-9]/.test(password)) score++;
      
      const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][Math.min(5, score)];
      const color = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#059669'][Math.min(5, score)];
      
      return { score, strength, color, message: `${strength} password` };
    },
    
    // ========== Hash Tools (Simple) ==========
    
    // Simple Hash (not cryptographic)
    simpleHash(str) {
      let hash = 0;
      for(let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    },
    
    // Base64 Encode
    base64Encode(str) {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch(e) {
        return btoa(str);
      }
    },
    
    // Base64 Decode
    base64Decode(str) {
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch(e) {
        return atob(str);
      }
    }
  };
  
  // ========== Export ==========
  window.ToolTariUtils = UtilityTools;
  
  console.log('Utility Tools Engine loaded');
})();
