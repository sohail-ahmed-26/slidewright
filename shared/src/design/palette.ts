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

export interface TopicTheme {
  primary: string; // hex color e.g. #0C7C79
  secondary: string; // e.g. #16B7B3
  accent: string; // e.g. #0E3A3B
  cardBg: string; // e.g. #F1FAFA
  cardBorder: string; // e.g. #D7EBEB
  darkBg: string; // e.g. #0E3A3B
  fontFamily: string;
  fontHeading: string;
  moodName: string;
}

export function getTopicTheme(topic: string): TopicTheme {
  const lower = (topic || '').toLowerCase();

  // 1. Healthcare, Medical, Biology, Clinical (Teal from reference.pptx)
  if (lower.match(/\b(health|healthcare|medical|medicine|doctor|clinic|clinical|patient|diagnosis|hospital|biotech|pharma|biology)\b/i)) {
    return {
      primary: '#0C7C79', // Clinical Teal from reference.pptx!
      secondary: '#16B7B3', // Vibrant Aqua from reference.pptx!
      accent: '#0E3A3B',
      cardBg: '#F1FAFA',
      cardBorder: '#D7EBEB',
      darkBg: '#0E3A3B',
      fontFamily: 'Calibri',
      fontHeading: 'Calibri',
      moodName: 'Clinical Precision'
    };
  }

  // 2. Energy, Environment, Sustainability, Solar, Green, Climate
  if (lower.match(/\b(energy|solar|wind|climate|sustainability|sustainable|green|nature|eco|earth|renewable|renewables|environment)\b/i)) {
    return {
      primary: '#15803D', // Sustainable Forest
      secondary: '#CA8A04', // Sunburst Amber
      accent: '#22C55E',
      cardBg: '#F0FDF4',
      cardBorder: '#DCFCE7',
      darkBg: '#052E16',
      fontFamily: 'Inter',
      fontHeading: 'Inter',
      moodName: 'Sustainable Future'
    };
  }

  // 3. Marketing, Creative, Media, Design, Brand
  if (lower.match(/\b(marketing|brand|branding|advertising|campaign|content|creative|media|customer|social media)\b/i)) {
    return {
      primary: '#7C3AED', // Vibrant Violet
      secondary: '#DB2777', // Modern Fuchsia
      accent: '#8B5CF6',
      cardBg: '#FAF5FF',
      cardBorder: '#F3E8FF',
      darkBg: '#2E1065',
      fontFamily: 'Outfit',
      fontHeading: 'Outfit',
      moodName: 'Creative Momentum'
    };
  }

  // 4. Finance, Banking, Investment, Crypto, Revenue, Sales, Trading, Fintech
  if (lower.match(/\b(finance|financial|banking|bank|money|investment|investing|venture|capital|sales|revenue|trade|trading|crypto|stock|stocks|fintech|quarterly|accounting)\b/i)) {
    return {
      primary: '#047857', // Wealth Emerald
      secondary: '#D97706', // Executive Amber Gold
      accent: '#10B981',
      cardBg: '#F9FAFB',
      cardBorder: '#E5E7EB',
      darkBg: '#064E3B',
      fontFamily: 'Inter',
      fontHeading: 'Inter',
      moodName: 'Executive Wealth & Trust'
    };
  }

  // 5. AI, Data Science, Machine Learning, Neural, Deep Learning, Software, Cloud, Robotics
  if (lower.match(/\b(ai|artificial intelligence|data science|machine learning|neural|deep learning|software|developer|coding|cyber|cloud|tech|technology|robot|robotics|algorithm)\b/i)) {
    return {
      primary: '#2563EB', // Electric Tech Cobalt
      secondary: '#06B6D4', // Cyber Cyan
      accent: '#3B82F6',
      cardBg: '#F8FAFC',
      cardBorder: '#E2E8F0',
      darkBg: '#070F26',
      fontFamily: 'Inter',
      fontHeading: 'Inter',
      moodName: 'Modern Tech Intelligence'
    };
  }

  // 6. Education, Career, Student, University, Teaching, Academic, Training
  if (lower.match(/\b(student|students|learning|learn|teaching|teach|career|careers|job|jobs|university|college|education|academic|course|degree|curriculum|seminar|school)\b/i)) {
    return {
      primary: '#4F46E5', // Academic Indigo
      secondary: '#F43F5E', // Dynamic Rose
      accent: '#6366F1',
      cardBg: '#EEF2FF',
      cardBorder: '#E0E7FF',
      darkBg: '#1E1B4B',
      fontFamily: 'Outfit',
      fontHeading: 'Outfit',
      moodName: 'Academic Innovation'
    };
  }

  // Default: Corporate Executive
  return {
    primary: '#1E3A8A', // Executive Navy
    secondary: '#0284C7', // Sky Accent
    accent: '#3B82F6',
    cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0',
    darkBg: '#0B132B',
    fontFamily: 'Inter',
    fontHeading: 'Inter',
    moodName: 'Executive Strategic'
  };
}
