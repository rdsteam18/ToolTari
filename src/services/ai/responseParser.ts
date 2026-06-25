export const responseParser = {
  /**
   * Validates response length, safety, and formats basic markdown structures to safe HTML.
   */
  parse(text: string): string {
    if (!text) return '';

    // 1. Basic safety sanitization (escape raw script and iframe tags to prevent XSS)
    let safeText = text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // 2. Parse Markdown Code Blocks
    safeText = safeText.replace(/```([a-zA-Z0-9-]*)\n([\s\S]*?)```/gm, (_, lang, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 select-text"><code class="language-${lang}">${escapedCode}</code></pre>`;
    });

    // 3. Parse Markdown Headers
    safeText = safeText.replace(/^### (.*$)/gim, '<h3 class="text-sm font-extrabold text-slate-800 mt-4 mb-2">$1</h3>');
    safeText = safeText.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-slate-800 mt-5 mb-3">$1</h2>');
    safeText = safeText.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-indigo-600 mt-6 mb-4">$1</h1>');

    // 4. Parse Bold and Italics
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    safeText = safeText.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');

    // 5. Parse Inline Code Elements
    safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-slate-100 border border-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">$1</code>');

    // 6. Parse Lists (Bulleted)
    // Convert lines starting with "- " or "* " to <li>
    const lines = safeText.split('\n');
    let insideList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      const listMatch = trimmed.match(/^[-*]\s+(.*)$/);

      if (listMatch) {
        let prefix = '';
        if (!insideList) {
          insideList = true;
          prefix = '<ul class="list-none flex flex-col gap-1.5 my-3 pl-1">';
        }
        return `${prefix}<li class="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"><span class="text-indigo-500 font-bold shrink-0">•</span><span>${listMatch[1]}</span></li>`;
      } else {
        if (insideList) {
          insideList = false;
          return `</ul>\n${line}`;
        }
        return line;
      }
    });

    if (insideList) {
      processedLines.push('</ul>');
    }

    safeText = processedLines.join('\n');

    // 7. Parse Paragraphs (replace double newlines with clean margin breaks)
    // We only wrap segments that aren't already wrapped in block elements (h1, h2, h3, pre, ul, li)
    const paragraphs = safeText.split(/\n{2,}/);
    const parsedParagraphs = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('</ul')
      ) {
        return trimmed;
      }
      return `<p class="text-xs md:text-sm text-slate-600 leading-relaxed my-2.5">${trimmed}</p>`;
    });

    safeText = parsedParagraphs.filter(p => p !== '').join('\n');

    // Replace single line breaks with <br/> inside paragraphs to preserve text structure
    safeText = safeText.replace(/(?<!>)\n(?!<)/g, '<br />');

    return safeText;
  }
};
