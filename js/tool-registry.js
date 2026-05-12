const TOOLS = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    desc: 'Beautify, minify, and validate JSON with syntax highlighting.',
    icon: '{}',
    category: 'format',
    badge: 'Formatter',
    url: '/tools/json-formatter',
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty print'],
    popular: true
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    desc: 'Encode text and files to Base64 or decode Base64 strings.',
    icon: '64',
    category: 'encode',
    badge: 'Encoder',
    url: '/tools/base64',
    keywords: ['base64', 'encode', 'decode', 'btoa', 'atob'],
    popular: true
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    desc: 'Generate UUID v4, v1, v7, NanoID, and CUID2 in bulk.',
    icon: '#',
    category: 'generate',
    badge: 'Generator',
    url: '/tools/uuid-generator',
    keywords: ['uuid', 'guid', 'nanoid', 'cuid', 'random id', 'unique id'],
    popular: true
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    desc: 'Test and debug regular expressions with real-time highlighting.',
    icon: '/.*/',
    category: 'text',
    badge: 'Text',
    url: '/tools/regex-tester',
    keywords: ['regex', 'regular expression', 'test', 'match', 'pattern'],
    popular: true
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    desc: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly.',
    icon: '##',
    category: 'security',
    badge: 'Security',
    url: '/tools/hash-generator',
    keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'crypto'],
    popular: false
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder / Decoder',
    desc: 'Encode or decode URLs and parse query strings.',
    icon: '%',
    category: 'encode',
    badge: 'Encoder',
    url: '/tools/url-encoder',
    keywords: ['url', 'encode', 'decode', 'uri', 'component', 'query'],
    popular: false
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    desc: 'Decode and inspect JSON Web Tokens without sending secrets.',
    icon: 'JW',
    category: 'security',
    badge: 'Security',
    url: '/tools/jwt-decoder',
    keywords: ['jwt', 'token', 'decode', 'inspect', 'auth', 'claim'],
    popular: true
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    desc: 'Convert Unix timestamps to human-readable dates and multiple timezones.',
    icon: '⌚',
    category: 'convert',
    badge: 'Converter',
    url: '/tools/timestamp-converter',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert'],
    popular: true
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    desc: 'Generate highly secure, random passwords with custom parameters.',
    icon: '***',
    category: 'security',
    badge: 'Security',
    url: '/tools/password-generator',
    keywords: ['password', 'generate', 'random', 'secure', 'entropy'],
    popular: true
  },
  {
    id: 'color-picker',
    name: 'Color Picker & Contrast',
    desc: 'Pick colors, convert formats (HEX, RGB, OKLCH), and check WCAG contrast.',
    icon: '🎨',
    category: 'convert',
    badge: 'Converter',
    url: '/tools/color-picker',
    keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'oklch', 'contrast'],
    popular: true
  },
  {
    id: 'markdown-html',
    name: 'Markdown to HTML',
    desc: 'Convert Markdown to sanitized HTML with real-time preview.',
    icon: 'M↓',
    category: 'format',
    badge: 'Formatter',
    url: '/tools/markdown-html',
    keywords: ['markdown', 'html', 'convert', 'preview', 'render'],
    popular: false
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    desc: 'Generate placeholder text in classic, hipster, or dev themes.',
    icon: 'Aa',
    category: 'generate',
    badge: 'Generator',
    url: '/tools/lorem-ipsum',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'generator', 'dummy'],
    popular: true
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    desc: 'Generate customizable, high-resolution QR codes from text or URLs.',
    icon: 'QR',
    category: 'generate',
    badge: 'Generator',
    url: '/tools/qr-generator',
    keywords: ['qr', 'code', 'generate', 'barcode', 'url'],
    popular: true
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    desc: 'Compare two text blocks to find added, removed, or modified lines.',
    icon: '±',
    category: 'text',
    badge: 'Text',
    url: '/tools/diff-checker',
    keywords: ['diff', 'compare', 'text', 'difference', 'checker'],
    popular: false
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    desc: 'Count words, characters, sentences, and calculate reading time.',
    icon: '12',
    category: 'text',
    badge: 'Text',
    url: '/tools/word-counter',
    keywords: ['word', 'character', 'count', 'frequency', 'stats', 'reading'],
    popular: true
  },
  {
    id: 'image-base64',
    name: 'Image to Base64',
    desc: 'Convert local images to Base64 data URIs for direct HTML/CSS embedding.',
    icon: 'img',
    category: 'encode',
    badge: 'Encoder',
    url: '/tools/image-base64',
    keywords: ['image', 'base64', 'encode', 'datauri', 'convert'],
    popular: false
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    desc: 'Convert numbers between binary, octal, decimal, and hexadecimal.',
    icon: '01',
    category: 'convert',
    badge: 'Converter',
    url: '/tools/number-base-converter',
    keywords: ['number', 'base', 'binary', 'hex', 'octal', 'decimal', 'convert'],
    popular: false
  },
  {
    id: 'html-entity',
    name: 'HTML Entity Encoder',
    desc: 'Encode or decode HTML entities safely for web display.',
    icon: '&lt;',
    category: 'encode',
    badge: 'Encoder',
    url: '/tools/html-entity',
    keywords: ['html', 'entity', 'encode', 'decode', 'escape', 'chars'],
    popular: false
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    desc: 'Compress CSS code to reduce file size and improve load times.',
    icon: 'css',
    category: 'format',
    badge: 'Formatter',
    url: '/tools/css-minifier',
    keywords: ['css', 'minify', 'compress', 'optimize', 'reduce'],
    popular: false
  },
  {
    id: 'chmod-calculator',
    name: 'Chmod Calculator',
    desc: 'Visual interface to calculate Linux file permission octal and symbolic modes.',
    icon: '755',
    category: 'convert',
    badge: 'Converter',
    url: '/tools/chmod-calculator',
    keywords: ['chmod', 'permissions', 'linux', 'octal', 'unix'],
    popular: false
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer',
    desc: 'Clean up and minify SVG code to strip unnecessary metadata.',
    icon: 'svg',
    category: 'format',
    badge: 'Formatter',
    url: '/tools/svg-optimizer',
    keywords: ['svg', 'optimize', 'minify', 'clean', 'vector'],
    popular: false
  },
  {
    id: 'cron-generator',
    name: 'Cron Generator',
    desc: 'Build and explain cron schedule expressions intuitively.',
    icon: '* *',
    category: 'generate',
    badge: 'Generator',
    url: '/tools/cron-generator',
    keywords: ['cron', 'schedule', 'expression', 'time', 'generator'],
    popular: false
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    desc: 'Generate SEO and social media meta tags with live SERP previews.',
    icon: '<m>',
    category: 'web',
    badge: 'Web',
    url: '/tools/meta-tag-generator',
    keywords: ['meta', 'tag', 'seo', 'html', 'head', 'og', 'twitter'],
    popular: false
  },
  {
    id: 'color-converter',
    name: 'Color Format Converter',
    desc: 'Convert any color instantly between HEX, RGB, HSL, OKLCH, and CMYK.',
    icon: 'RGB',
    category: 'convert',
    badge: 'Converter',
    url: '/tools/color-converter',
    keywords: ['color', 'convert', 'hex', 'rgb', 'hsl', 'oklch', 'cmyk'],
    popular: false
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    desc: 'Convert JSON arrays to flat CSV format for spreadsheet importing.',
    icon: 'csv',
    category: 'format',
    badge: 'Formatter',
    url: '/tools/json-to-csv',
    keywords: ['json', 'csv', 'convert', 'export', 'data', 'table'],
    popular: false
  }
];

const fuse = new Fuse(TOOLS, {
  keys: ['name', 'desc', 'keywords'],
  threshold: 0.3,
  includeScore: true
});

function searchTools(query) {
  if (!query || !query.trim()) return TOOLS;
  return fuse.search(query.trim()).map(result => result.item);
}

function filterByCategory(category) {
  if (category === 'all') return TOOLS;
  return TOOLS.filter(tool => tool.category === category);
}