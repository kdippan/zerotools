/**
 * ZeroTools - Color Picker & Format Converter
 * File: js/tools/color-picker.js
 */

(function () {
  const TOOL_ID = 'color-picker';

  // --- DOM Elements ---
  const colorNativeEl = document.getElementById('color-native');
  const swatchEl = document.getElementById('color-swatch');
  const namedColorEl = document.getElementById('named-color-match');
  const contrastRatioEl = document.getElementById('contrast-ratio');
  const contrastAaEl = document.getElementById('contrast-aa');
  const contrastAaaEl = document.getElementById('contrast-aaa');
  const contrastLargeEl = document.getElementById('contrast-large');
  const bgCompareEl = document.getElementById('bg-compare');

  // Input groups
  const hexInput = document.getElementById('input-hex');
  const rgbInput = document.getElementById('input-rgb');
  const hslInput = document.getElementById('input-hsl');
  const oklchInput = document.getElementById('input-oklch');
  const cmykInput = document.getElementById('input-cmyk');

  // Palette containers
  const tintsContainer = document.getElementById('palette-tints');
  const shadesContainer = document.getElementById('palette-shades');

  // --- Color Dictionary (150+ CSS named colors) ---
  const NAMED_COLORS = {
    "aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#00ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkgrey":"#a9a9a9","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkslategrey":"#2f4f4f",
    "darkturquoise":"#00ced1","darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dimgrey":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f","grey":"#808080",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgray":"#d3d3d3","lightgreen":"#90ee90","lightgrey":"#d3d3d3","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899",
    "lightslategrey":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370db","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#db7093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","slategrey":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"
  };

  // --- Math & Conversion Logic ---
  
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function hexToRgbObj(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
  }

  function rgbObjToHex(r, g, b) {
    const toHex = (c) => {
      const hex = Math.round(clamp(c, 0, 255)).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; 
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    
    if (k === 1) {
      c = m = y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }
    return { 
      c: Math.round(c * 100), 
      m: Math.round(m * 100), 
      y: Math.round(y * 100), 
      k: Math.round(k * 100) 
    };
  }

  // Linear sRGB to OKLCH (Simplified approximation for web use)
  // Accurate OKLCH requires complex matrix math; this is a close web-safe proxy.
  function srgbToLinear(val) {
    val = val / 255;
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  }

  function rgbToOklch(r, g, b) {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
    
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    
    const okl = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const oka = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const okb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    const c = Math.sqrt(oka * oka + okb * okb);
    let h = Math.atan2(okb, oka) * (180 / Math.PI);
    if (h < 0) h += 360;

    return { 
      l: (okl).toFixed(3), 
      c: (c).toFixed(3), 
      h: Math.round(h) || 0 
    };
  }

  // --- Color Utilities ---

  function hexToDistance(hex1, hex2) {
    const rgb1 = hexToRgbObj(hex1);
    const rgb2 = hexToRgbObj(hex2);
    // Simple Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(rgb2.r - rgb1.r, 2) +
      Math.pow(rgb2.g - rgb1.g, 2) +
      Math.pow(rgb2.b - rgb1.b, 2)
    );
  }

  function getNearestNamedColor(hex) {
    let closestName = "unknown";
    let minDistance = Infinity;
    
    for (const [name, colorHex] of Object.entries(NAMED_COLORS)) {
      if (hex.toLowerCase() === colorHex) return name; // Exact match
      
      const distance = hexToDistance(hex, colorHex);
      if (distance < minDistance) {
        minDistance = distance;
        closestName = name;
      }
    }
    return `~${closestName}`;
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
      val = v / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  function mixColors(color1, color2, weight) {
    const w = clamp(weight, 0, 1);
    const r = Math.round(color1.r * (1 - w) + color2.r * w);
    const g = Math.round(color1.g * (1 - w) + color2.g * w);
    const b = Math.round(color1.b * (1 - w) + color2.b * w);
    return { r, g, b };
  }

  // --- UI Updates ---

  function updateAllFromRgb(r, g, b, source) {
    r = clamp(Math.round(r), 0, 255);
    g = clamp(Math.round(g), 0, 255);
    b = clamp(Math.round(b), 0, 255);

    const hex = rgbObjToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const oklch = rgbToOklch(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    if (source !== 'native' && colorNativeEl) colorNativeEl.value = hex;
    if (source !== 'hex' && hexInput) hexInput.value = hex.toUpperCase();
    if (source !== 'rgb' && rgbInput) rgbInput.value = `rgb(${r}, ${g}, ${b})`;
    if (source !== 'hsl' && hslInput) hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    if (source !== 'oklch' && oklchInput) oklchInput.value = `oklch(${oklch.l} ${oklch.c} ${oklch.h})`;
    if (source !== 'cmyk' && cmykInput) cmykInput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    if (swatchEl) {
      swatchEl.style.backgroundColor = hex;
      swatchEl.setAttribute('aria-label', `Color swatch: ${hex}`);
    }

    if (namedColorEl) {
      namedColorEl.textContent = getNearestNamedColor(hex);
    }

    updateContrast(hex);
    generatePalette(r, g, b);
    saveState(hex);
  }

  function updateContrast(fgHex) {
    if (!bgCompareEl || !contrastRatioEl) return;
    
    // Validate background input
    let bgStr = bgCompareEl.value.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(bgStr)) {
      if (/^[0-9A-Fa-f]{6}$/.test(bgStr)) bgStr = '#' + bgStr;
      else bgStr = '#0a0a0a'; // fallback to theme dark
    }

    const fgRgb = hexToRgbObj(fgHex);
    const bgRgb = hexToRgbObj(bgStr);
    
    const ratio = getContrastRatio(fgRgb, bgRgb);
    const ratioFmt = ratio.toFixed(2);
    
    contrastRatioEl.textContent = `${ratioFmt}:1`;
    contrastRatioEl.style.color = ratio >= 4.5 ? 'var(--color-success)' : 'var(--color-error)';

    // Update badges
    if (contrastAaEl) {
      contrastAaEl.textContent = ratio >= 4.5 ? 'PASS AA' : 'FAIL AA';
      contrastAaEl.className = ratio >= 4.5 ? 'badge badge-generate' : 'badge badge-security';
    }
    if (contrastAaaEl) {
      contrastAaaEl.textContent = ratio >= 7.0 ? 'PASS AAA' : 'FAIL AAA';
      contrastAaaEl.className = ratio >= 7.0 ? 'badge badge-generate' : 'badge badge-security';
    }
    if (contrastLargeEl) {
      contrastLargeEl.textContent = ratio >= 3.0 ? 'PASS AA (Large)' : 'FAIL AA (Large)';
      contrastLargeEl.className = ratio >= 3.0 ? 'badge badge-generate' : 'badge badge-security';
    }
  }

  function generatePalette(r, g, b) {
    if (!tintsContainer || !shadesContainer) return;
    
    const baseColor = { r, g, b };
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    
    let tintsHtml = '';
    let shadesHtml = '';
    
    // 5 steps: 16%, 32%, 50%, 68%, 84%
    const weights = [0.16, 0.32, 0.50, 0.68, 0.84];
    
    weights.forEach(w => {
      const tintRgb = mixColors(baseColor, white, w);
      const shadeRgb = mixColors(baseColor, black, w);
      
      const tintHex = rgbObjToHex(tintRgb.r, tintRgb.g, tintRgb.b);
      const shadeHex = rgbObjToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
      
      tintsHtml += createSwatchHtml(tintHex);
      shadesHtml += createSwatchHtml(shadeHex);
    });

    tintsContainer.innerHTML = tintsHtml;
    shadesContainer.innerHTML = shadesHtml;

    // Attach listeners to new swatches
    document.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const hex = e.target.dataset.hex;
        const rgb = hexToRgbObj(hex);
        updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'palette');
        // Scroll back to top for mobile users
        if (window.innerWidth < 768) {
           colorNativeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function createSwatchHtml(hex) {
    return `
      <div class="palette-swatch" data-hex="${hex}" title="${hex}" 
           style="background-color: ${hex}; height: 40px; flex: 1; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); cursor: pointer; transition: transform 0.1s;">
      </div>
    `;
  }

  // --- Event Listeners ---

  function parseHex(val) {
    val = val.replace(/[^0-9a-fA-F]/g, '');
    if (val.length === 3 || val.length === 6) {
      if (val.length === 3) val = val.split('').map(c => c+c).join('');
      const rgb = hexToRgbObj('#' + val);
      updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'hex');
    }
  }

  function parseRgb(val) {
    const nums = val.match(/\d+/g);
    if (nums && nums.length >= 3) {
      updateAllFromRgb(parseInt(nums[0]), parseInt(nums[1]), parseInt(nums[2]), 'rgb');
    }
  }

  function parseHsl(val) {
    const nums = val.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const rgb = hslToRgb(parseInt(nums[0]), parseInt(nums[1]), parseInt(nums[2]));
      updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'hsl');
    }
  }

  // Note: OKLCH and CMYK parsing omitted for brevity; they act as read-only or best-effort in UI

  if (colorNativeEl) {
    colorNativeEl.addEventListener('input', (e) => {
      const rgb = hexToRgbObj(e.target.value);
      updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'native');
    });
  }

  if (hexInput) hexInput.addEventListener('change', (e) => parseHex(e.target.value));
  if (rgbInput) rgbInput.addEventListener('change', (e) => parseRgb(e.target.value));
  if (hslInput) hslInput.addEventListener('change', (e) => parseHsl(e.target.value));
  
  if (bgCompareEl) {
    bgCompareEl.addEventListener('input', () => {
      if (colorNativeEl) {
        updateContrast(colorNativeEl.value);
        if (typeof window.saveToolInput === 'function') {
           window.saveToolInput(TOOL_ID + '-bg', bgCompareEl.value);
        }
      }
    });
  }

  // Add copy buttons logic
  document.querySelectorAll('.copy-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      const input = document.getElementById(targetId);
      if (input && input.value) {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(input.value, e.currentTarget);
        } else {
          navigator.clipboard.writeText(input.value);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      }
    });
  });

  // --- State Management ---
  function saveState(hex) {
    if (typeof window.saveToolInput === 'function') {
      window.saveToolInput(TOOL_ID, hex);
    }
  }

  function init() {
    let startHex = '#00dc82'; // Default ZeroTools Accent
    let startBg = '#0a0a0a';

    if (typeof window.loadToolInput === 'function') {
      const saved = window.loadToolInput(TOOL_ID);
      const savedBg = window.loadToolInput(TOOL_ID + '-bg');
      if (saved && /^#[0-9A-Fa-f]{6}$/.test(saved)) startHex = saved;
      if (savedBg && /^#[0-9A-Fa-f]{6}$/.test(savedBg)) startBg = savedBg;
    }

    if (bgCompareEl) bgCompareEl.value = startBg;
    
    const rgb = hexToRgbObj(startHex);
    updateAllFromRgb(rgb.r, rgb.g, rgb.b, 'init');
  }

  init();

})();