export interface HSL { h: number; s: number; l: number; }

// Convert HSL to linear RGB for luminance calculation
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

// Calculate relative luminance
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hsl1: HSL, hsl2: HSL): number {
  const l1 = luminance(...hslToRgb(hsl1.h, hsl1.s, hsl1.l));
  const l2 = luminance(...hslToRgb(hsl2.h, hsl2.s, hsl2.l));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Ensure contrast ratio >= 4.5 against a target color (usually white or black)
export function ensureContrast(color: HSL, target: HSL = { h: 0, s: 0, l: 100 }, minRatio: number = 4.5): HSL {
  let l = color.l;
  let ratio = getContrastRatio({ ...color, l }, target);
  
  // If target is white (L=100), we need to lower our lightness to increase contrast
  if (target.l > 50) {
    while (ratio < minRatio && l > 0) {
      l -= 1;
      ratio = getContrastRatio({ ...color, l }, target);
    }
  } else {
    // Target is black/dark, we need to raise our lightness
    while (ratio < minRatio && l < 100) {
      l += 1;
      ratio = getContrastRatio({ ...color, l }, target);
    }
  }
  return { ...color, l };
}

export interface Palette {
  primary: string; // hsl(h, s%, l%)
  primaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent?: string;
  accentForeground?: string;
}

export function generatePalette(hue: number, accentHue?: number | null): Palette {
  // Base primary is a vibrant version of the hue
  let primaryHsl: HSL = { h: hue, s: 80, l: 50 };
  // Ensure primary has >= 4.5 contrast against white for text, 
  // but if it's used as a background, white text needs >= 4.5 contrast against it.
  primaryHsl = ensureContrast(primaryHsl, { h: 0, s: 0, l: 100 }, 4.5);
  
  const primary = `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`;
  const primaryForeground = `0 0% 100%`; // White text on primary
  
  const muted = `${hue} 20% 90%`; // Light tinted background
  
  // Muted foreground needs contrast against muted background
  const mutedBgHsl: HSL = { h: hue, s: 20, l: 90 };
  let mutedFgHsl: HSL = { h: hue, s: 30, l: 40 };
  mutedFgHsl = ensureContrast(mutedFgHsl, mutedBgHsl, 4.5);
  const mutedForeground = `${mutedFgHsl.h} ${mutedFgHsl.s}% ${mutedFgHsl.l}%`;

  const palette: Palette = {
    primary,
    primaryForeground,
    muted,
    mutedForeground
  };

  if (accentHue !== undefined && accentHue !== null) {
    let accentHsl: HSL = { h: accentHue, s: 90, l: 50 };
    accentHsl = ensureContrast(accentHsl, { h: 0, s: 0, l: 100 }, 4.5);
    palette.accent = `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`;
    palette.accentForeground = `0 0% 100%`;
  }

  return palette;
}
