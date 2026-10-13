import PptxGenJS from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

function formatColor(colorStr: string | undefined, fallback: string = '2F6BFF'): string {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('#')) return colorStr.substring(1);
  return colorStr.length === 6 ? colorStr : fallback;
}

export async function exportDeckToPptx(deck: any, outputPath: string): Promise<string> {
  const pres = new PptxGenJS();
  // Standard PowerPoint 16:9 widescreen: 13.333" x 7.500" (12192000 x 6858000 EMU)
  pres.defineLayout({ name: 'LAYOUT_16x9_WIDE', width: 13.333, height: 7.5 });
  pres.layout = 'LAYOUT_16x9_WIDE';

  const SHAPES = {
    rect: 'rect' as const,
    line: 'line' as const,
    roundRect: 'roundRect' as const,
    ellipse: 'ellipse' as const,
  };

  const theme = deck.theme || deck.design?.theme || {};
  const primaryColor = formatColor(theme?.primary || '#2F6BFF');
  const secondaryColor = formatColor(theme?.secondary || '#0EA5E9');
  const fontFace = theme?.fontFamily || 'Calibri';
  const headingFont = theme?.fontFamily || 'Calibri';

  const slides = deck.slides || deck.data?.slides || [];

  if (slides.length === 0) {
    const slide = pres.addSlide();
    slide.background = { color: '070F26' };
    slide.addText(deck.title || 'Executive Presentation', {
      x: 1.0, y: 2.5, w: 11.333, h: 2.0,
      fontSize: 40, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center'
    });
  }

  // Safe canvas coordinates for 13.333" x 7.500"
  // Left: 0.80", Content Width: 11.733", Max Right: 12.533"
  // Top: 0.75", Content Height: 6.100", Max Bottom: 6.850"
  const MARGIN_LEFT = 0.80;
  const MARGIN_TOP = 0.75;
  const CONTENT_WIDTH = 11.733;

  const addSlideFooter = (slide: any, pageNum: number, isDark: boolean = false) => {
    // Subtle separator line
    slide.addShape(SHAPES.line, {
      x: MARGIN_LEFT, y: 6.75, w: CONTENT_WIDTH, h: 0,
      line: { color: isDark ? '1E293B' : 'E2E8F0', width: 0.75 }
    });
    // Footer org branding
    slide.addText(deck.title || 'Executive Presentation', {
      x: MARGIN_LEFT, y: 6.82, w: 7.0, h: 0.35,
      fontSize: 9.5, fontFace, color: isDark ? '64748B' : '94A3B8', valign: 'middle'
    });
    // Page number
    slide.addText(String(pageNum), {
      x: MARGIN_LEFT + CONTENT_WIDTH - 2.0, y: 6.82, w: 2.0, h: 0.35,
      fontSize: 9.5, fontFace, color: isDark ? '64748B' : '94A3B8', align: 'right', valign: 'middle'
    });
  };

  for (let sIdx = 0; sIdx < slides.length; sIdx++) {
    const slideData = slides[sIdx];
    const pageNumber = sIdx + 1;
    const slide = pres.addSlide();
    let layout = slideData.layout || 'title_body';
    let data = slideData.data || {};

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.layout && !slideData.layout) layout = parsed.layout;
        data = parsed.data || parsed;
      } catch (e) {}
    }

    const isDarkLayout = ['cover', 'closing', 'big_number_dark'].includes(layout);
    slide.background = { color: isDarkLayout ? '070F26' : 'FFFFFF' };

    const titleColor = isDarkLayout ? 'FFFFFF' : '0F172A';
    const bodyColor = isDarkLayout ? '94A3B8' : '334155';
    const cardBg = isDarkLayout ? '111C38' : 'F8FAFC';
    const cardBorder = isDarkLayout ? '1E293B' : 'E2E8F0';

    if (layout === 'cover') {
      // 1. Cover Slide
      slide.addShape(SHAPES.roundRect, {
        x: MARGIN_LEFT, y: 1.15, w: 2.5, h: 0.36,
        fill: { color: '1E293B' },
        line: { color: primaryColor, width: 1 }
      });
      slide.addText('EXECUTIVE PRESENTATION', {
        x: MARGIN_LEFT, y: 1.15, w: 2.5, h: 0.36,
        fontSize: 10, fontFace: headingFont, color: primaryColor, bold: true, align: 'center', valign: 'middle'
      });

      slide.addText(data.title || deck.title || 'Executive Presentation', {
        x: MARGIN_LEFT, y: 1.75, w: 7.2, h: 2.4,
        fontSize: 38, fontFace: headingFont, color: 'FFFFFF', bold: true, valign: 'top'
      });

      if (data.subtitle) {
        slide.addText(data.subtitle, {
          x: MARGIN_LEFT, y: 4.25, w: 7.2, h: 1.3,
          fontSize: 16, fontFace, color: '94A3B8', valign: 'top', lineSpacing: 22
        });
      }

      slide.addText(`Presented by: ${data.orgName || 'Slidewright AI'}   •   ${data.date || 'October 2026'}`, {
        x: MARGIN_LEFT, y: 6.35, w: 7.2, h: 0.45,
        fontSize: 11, fontFace, color: '64748B', valign: 'bottom'
      });

      // Right Visual Panel (Widescreen bounded: 8.5 to 12.5")
      const heroImageUrl = slideData.image || data.image || deck.image;
      let imageAdded = false;
      if (heroImageUrl && typeof heroImageUrl === 'string' && (heroImageUrl.startsWith('http') || fs.existsSync(heroImageUrl))) {
        try {
          slide.addImage({
            path: heroImageUrl,
            x: 8.45, y: 1.0, w: 4.08, h: 5.4,
            rounding: true
          });
          imageAdded = true;
        } catch (e) {
          imageAdded = false;
        }
      }

      if (!imageAdded) {
        slide.addShape(SHAPES.roundRect, {
          x: 8.45, y: 1.0, w: 4.08, h: 5.4,
          fill: { color: '111C38' },
          line: { color: primaryColor, width: 1.5 }
        });
        slide.addShape(SHAPES.roundRect, {
          x: 8.95, y: 1.5, w: 3.08, h: 4.4,
          fill: { color: '070F26' },
          line: { color: '1E293B', width: 1 }
        });
        slide.addText(data.title || deck.title || 'Strategic Overview', {
          x: 9.15, y: 2.6, w: 2.68, h: 2.0,
          fontSize: 20, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
        });
      }

    } else if (layout === 'title_body') {
      // 2. Title & Body
      slide.addText(data.title || 'Key Insights', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      let currentY = MARGIN_TOP + 1.05;
      if (data.body) {
        slide.addText(data.body, {
          x: MARGIN_LEFT, y: currentY, w: CONTENT_WIDTH, h: 1.5,
          fontSize: 16, fontFace, color: bodyColor, lineSpacing: 25
        });
        currentY += 1.65;
      }

      if (Array.isArray(data.points) && data.points.length > 0) {
        const bulletText = data.points.map((pt: string) => `•   ${pt}`).join('\n\n');
        slide.addText(bulletText, {
          x: MARGIN_LEFT, y: currentY, w: CONTENT_WIDTH, h: Math.min(3.6, 6.5 - currentY),
          fontSize: 14.5, fontFace, color: bodyColor, lineSpacing: 22
        });
      }

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'agenda') {
      // 2b. Agenda / Executive Roadmap
      slide.addText(data.title || 'Executive Agenda & Roadmap', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });
      if (data.subtitle) {
        slide.addText(data.subtitle, {
          x: MARGIN_LEFT, y: MARGIN_TOP + 0.85, w: CONTENT_WIDTH, h: 0.35,
          fontSize: 13, fontFace, color: bodyColor
        });
      }

      const rawItems = (Array.isArray(data.items) && data.items.length > 0) 
        ? data.items 
        : (Array.isArray(data.cards) && data.cards.length > 0 ? data.cards : (Array.isArray(data.steps) ? data.steps : []));
      const items = rawItems.slice(0, 4);
      const count = Math.max(1, items.length);
      const gap = 0.35;
      const colWidth = (CONTENT_WIDTH - (count - 1) * gap) / count;

      items.forEach((item: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);
        // Card container
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 2.10, w: colWidth, h: 4.45,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        // Top accent line
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 2.10, w: colWidth, h: 0.08,
          fill: { color: primaryColor },
          line: { color: primaryColor }
        });
        // Number badge
        slide.addText(`0${idx + 1}`, {
          x: posX + 0.3, y: 2.30, w: 1.2, h: 0.45,
          fontSize: 20, fontFace: headingFont, color: primaryColor, bold: true
        });
        // Item title
        const itemTitle = typeof item === 'object' ? (item.title || item.heading || `Pillar ${idx + 1}`) : `Topic ${idx + 1}`;
        slide.addText(itemTitle, {
          x: posX + 0.3, y: 2.80, w: colWidth - 0.6, h: 0.60,
          fontSize: 16, fontFace: headingFont, color: titleColor, bold: true
        });
        // Item description
        const itemBody = typeof item === 'object' ? (item.body || item.text || item.description || '') : String(item);
        slide.addText(itemBody, {
          x: posX + 0.3, y: 3.45, w: colWidth - 0.6, h: 2.85,
          fontSize: 13, fontFace, color: bodyColor, lineSpacing: 20
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'two_cards') {
      // 3. Two Cards
      slide.addText(data.title || 'Strategic Pillars', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const cards = data.cards || [];
      const colWidth = (CONTENT_WIDTH - 0.45) / 2; // 5.64"
      cards.slice(0, 2).forEach((c: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + 0.45);
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 1.95, w: colWidth, h: 4.60,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 1.95, w: colWidth, h: 0.08,
          fill: { color: primaryColor },
          line: { color: primaryColor }
        });
        slide.addText(c.title || `Dimension ${idx + 1}`, {
          x: posX + 0.35, y: 2.25, w: colWidth - 0.7, h: 0.55,
          fontSize: 18, fontFace: headingFont, color: primaryColor, bold: true
        });
        slide.addText(c.body || '', {
          x: posX + 0.35, y: 2.90, w: colWidth - 0.7, h: 3.40,
          fontSize: 14, fontFace, color: bodyColor, lineSpacing: 22
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'cards_3_bar') {
      // 4. Three Cards
      slide.addText(data.title || 'Three Core Pillars', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const cards = data.cards || [];
      const gap = 0.35;
      const colWidth = (CONTENT_WIDTH - 2 * gap) / 3; // 3.67"
      cards.slice(0, 3).forEach((c: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 1.95, w: colWidth, h: 4.60,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 1.95, w: colWidth, h: 0.08,
          fill: { color: primaryColor },
          line: { color: primaryColor }
        });
        slide.addText(c.title || `Pillar ${idx + 1}`, {
          x: posX + 0.3, y: 2.25, w: colWidth - 0.6, h: 0.55,
          fontSize: 17, fontFace: headingFont, color: primaryColor, bold: true
        });
        slide.addText(c.body || '', {
          x: posX + 0.3, y: 2.90, w: colWidth - 0.6, h: 3.40,
          fontSize: 13, fontFace, color: bodyColor, lineSpacing: 20
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'grid_2x2') {
      // 5. Grid 2x2
      slide.addText(data.title || 'Core Capabilities', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const cards = data.cards || [];
      const colWidth = (CONTENT_WIDTH - 0.45) / 2; // 5.64"
      const rowHeight = 2.15;
      cards.slice(0, 4).forEach((c: any, idx: number) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const posX = MARGIN_LEFT + col * (colWidth + 0.45);
        const posY = 1.95 + row * (rowHeight + 0.25);
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: posY, w: colWidth, h: rowHeight,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        slide.addText(c.title || `Capability ${idx + 1}`, {
          x: posX + 0.3, y: posY + 0.2, w: colWidth - 0.6, h: 0.45,
          fontSize: 16, fontFace: headingFont, color: primaryColor, bold: true
        });
        slide.addText(c.body || '', {
          x: posX + 0.3, y: posY + 0.7, w: colWidth - 0.6, h: 1.3,
          fontSize: 13, fontFace, color: bodyColor, lineSpacing: 18
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'process_steps') {
      // 6. Process Steps (CRITICAL: 13.333" Widescreen Bounded, ZERO Overflow)
      slide.addText(data.title || 'Implementation Process', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const steps = data.steps || [];
      const stepCount = Math.max(1, Math.min(steps.length, 4));
      const gap = 0.35;
      // For 4 steps: (11.733 - 3 * 0.35) / 4 = 2.67"
      // Max right edge: 0.8 + 3*(2.67+0.35) + 2.67 = 12.53" <= 13.333" (Strictly leaves 0.80" margin!)
      const colWidth = (CONTENT_WIDTH - (stepCount - 1) * gap) / stepCount;

      steps.slice(0, 4).forEach((s: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);

        // Step number badge (centered above card)
        const badgeSize = 0.68;
        const badgeX = posX + (colWidth - badgeSize) / 2;
        slide.addShape(SHAPES.roundRect, {
          x: badgeX, y: 1.95, w: badgeSize, h: badgeSize,
          fill: { color: primaryColor },
          line: { color: primaryColor }
        });
        slide.addText(String(idx + 1), {
          x: badgeX, y: 1.95, w: badgeSize, h: badgeSize,
          fontSize: 16, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
        });

        // Step card
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 2.80, w: colWidth, h: 3.75,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        // Top accent line on card
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 2.80, w: colWidth, h: 0.06,
          fill: { color: primaryColor },
          line: { color: primaryColor }
        });

        slide.addText(s.title || `Phase ${idx + 1}`, {
          x: posX + 0.2, y: 3.05, w: colWidth - 0.4, h: 0.65,
          fontSize: 15, fontFace: headingFont, color: primaryColor, bold: true, align: 'center'
        });
        slide.addText(s.body || '', {
          x: posX + 0.2, y: 3.75, w: colWidth - 0.4, h: 2.60,
          fontSize: 12.5, fontFace, color: bodyColor, lineSpacing: 18, align: 'left'
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'big_number_dark') {
      // 7. Executive Metric Dashboard (Upgraded from empty slide to rich executive KPI slide)
      slide.addText(data.title || 'Strategic Performance Indicator', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: 'FFFFFF', bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      // Left KPI Showcase Card (x: 0.80 to 5.60)
      slide.addShape(SHAPES.roundRect, {
        x: MARGIN_LEFT, y: 1.95, w: 4.80, h: 4.60,
        fill: { color: '111C38' },
        line: { color: primaryColor, width: 1.5 }
      });
      slide.addText(data.number || '75%', {
        x: MARGIN_LEFT + 0.2, y: 2.30, w: 4.40, h: 1.80,
        fontSize: 64, fontFace: headingFont, color: primaryColor, bold: true, align: 'center', valign: 'middle'
      });
      slide.addText(data.label || 'Improved Performance Metric', {
        x: MARGIN_LEFT + 0.2, y: 4.20, w: 4.40, h: 0.70,
        fontSize: 18, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center'
      });
      slide.addText(data.baseline || data.subtext || 'Verified against industry enterprise benchmarks', {
        x: MARGIN_LEFT + 0.2, y: 4.95, w: 4.40, h: 1.20,
        fontSize: 13, fontFace, color: '94A3B8', align: 'center', lineSpacing: 18
      });

      // Right Strategic Drivers & Context Card (x: 5.85 to 12.53)
      slide.addShape(SHAPES.roundRect, {
        x: 5.85, y: 1.95, w: 6.68, h: 4.60,
        fill: { color: '0B1528' },
        line: { color: '1E293B', width: 1 }
      });
      slide.addText('Strategic Context & Business Impact', {
        x: 6.15, y: 2.25, w: 6.08, h: 0.45,
        fontSize: 16, fontFace: headingFont, color: primaryColor, bold: true
      });

      const takeaways = Array.isArray(data.takeaways) && data.takeaways.length > 0
        ? data.takeaways
        : [
            data.body || 'Accelerates mission-critical decision workflows through intelligent real-time processing.',
            'Eliminates friction points across operational pipelines while maintaining rigorous quality control.',
            'Scales predictably to enterprise workloads with guaranteed latency and resource efficiency.'
          ];

      takeaways.slice(0, 3).forEach((tk: string, idx: number) => {
        const itemY = 2.85 + idx * 1.15;
        slide.addShape(SHAPES.roundRect, {
          x: 6.15, y: itemY + 0.05, w: 0.35, h: 0.35,
          fill: { color: primaryColor }
        });
        slide.addText('✓', {
          x: 6.15, y: itemY + 0.05, w: 0.35, h: 0.35,
          fontSize: 12, fontFace, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
        });
        slide.addText(tk, {
          x: 6.65, y: itemY, w: 5.58, h: 0.95,
          fontSize: 13, fontFace, color: 'CBD5E1', lineSpacing: 18
        });
      });

      addSlideFooter(slide, pageNumber, true);

    } else if (layout === 'stats') {
      // 8. Stats Layout
      slide.addText(data.title || 'Key Metrics & KPI Performance', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const stats = Array.isArray(data.stats) ? data.stats.slice(0, 3) : [];
      const gap = 0.35;
      const colWidth = (CONTENT_WIDTH - 2 * gap) / 3;

      stats.forEach((s: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 2.10, w: colWidth, h: 4.40,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        slide.addText(s.number || '0', {
          x: posX + 0.2, y: 2.60, w: colWidth - 0.4, h: 1.30,
          fontSize: 48, fontFace: headingFont, color: primaryColor, bold: true, align: 'center'
        });
        slide.addText(s.label || '', {
          x: posX + 0.2, y: 4.00, w: colWidth - 0.4, h: 0.65,
          fontSize: 16, fontFace: headingFont, color: titleColor, bold: true, align: 'center'
        });
        if (s.subtext) {
          slide.addText(s.subtext, {
            x: posX + 0.2, y: 4.70, w: colWidth - 0.4, h: 1.40,
            fontSize: 12.5, fontFace, color: bodyColor, align: 'center', lineSpacing: 18
          });
        }
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'timeline') {
      // 9. Timeline
      slide.addText(data.title || 'Project Milestones & Roadmap', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const events = data.events || [];
      const evCount = Math.max(1, Math.min(events.length, 4));
      const gap = 0.35;
      const colWidth = (CONTENT_WIDTH - (evCount - 1) * gap) / evCount;

      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: 2.95, w: CONTENT_WIDTH, h: 0,
        line: { color: 'CBD5E1', width: 2 }
      });

      events.slice(0, 4).forEach((e: any, idx: number) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);

        slide.addText(e.date || `Phase ${idx + 1}`, {
          x: posX, y: 2.25, w: colWidth, h: 0.45,
          fontSize: 14, fontFace: headingFont, color: primaryColor, bold: true, align: 'center'
        });
        slide.addShape(SHAPES.ellipse, {
          x: posX + colWidth / 2 - 0.18, y: 2.77, w: 0.36, h: 0.36,
          fill: { color: primaryColor },
          line: { color: 'FFFFFF', width: 2 }
        });

        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 3.40, w: colWidth, h: 3.15,
          fill: { color: cardBg },
          line: { color: cardBorder, width: 1 }
        });
        slide.addText(e.title || `Milestone ${idx + 1}`, {
          x: posX + 0.2, y: 3.55, w: colWidth - 0.4, h: 0.55,
          fontSize: 15, fontFace: headingFont, color: titleColor, bold: true
        });
        slide.addText(e.body || '', {
          x: posX + 0.2, y: 4.15, w: colWidth - 0.4, h: 2.15,
          fontSize: 12, fontFace, color: bodyColor, lineSpacing: 18
        });
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'comparison') {
      // 10. Comparison
      slide.addText(data.title || 'Comparative Analysis', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const colWidth = (CONTENT_WIDTH - 0.45) / 2;
      const left = data.left || { title: 'Traditional Approach', points: [] };
      const right = data.right || { title: 'Modern Solution', points: [] };

      // Left Column
      slide.addShape(SHAPES.roundRect, {
        x: MARGIN_LEFT, y: 1.95, w: colWidth, h: 4.60,
        fill: { color: 'F1F5F9' },
        line: { color: 'CBD5E1', width: 1 }
      });
      slide.addText(left.title || 'Traditional', {
        x: MARGIN_LEFT + 0.35, y: 2.25, w: colWidth - 0.7, h: 0.55,
        fontSize: 18, fontFace: headingFont, color: '64748B', bold: true
      });
      if (Array.isArray(left.points)) {
        slide.addText(left.points.map((p: string) => `✕   ${p}`).join('\n\n'), {
          x: MARGIN_LEFT + 0.35, y: 2.95, w: colWidth - 0.7, h: 3.35,
          fontSize: 13.5, fontFace, color: '475569', lineSpacing: 22
        });
      }

      // Right Column
      const rightX = MARGIN_LEFT + colWidth + 0.45;
      slide.addShape(SHAPES.roundRect, {
        x: rightX, y: 1.95, w: colWidth, h: 4.60,
        fill: { color: 'EFF6FF' },
        line: { color: primaryColor, width: 1.5 }
      });
      slide.addText(right.title || 'Modern Approach', {
        x: rightX + 0.35, y: 2.25, w: colWidth - 0.7, h: 0.55,
        fontSize: 18, fontFace: headingFont, color: primaryColor, bold: true
      });
      if (Array.isArray(right.points)) {
        slide.addText(right.points.map((p: string) => `✓   ${p}`).join('\n\n'), {
          x: rightX + 0.35, y: 2.95, w: colWidth - 0.7, h: 3.35,
          fontSize: 13.5, fontFace, color: '1E293B', lineSpacing: 22
        });
      }

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'image_split') {
      // 11. Image Split
      slide.addText(data.title || 'Context & Perspective', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: 5.60, h: 0.90,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.90, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });
      slide.addText(data.text || data.body || '', {
        x: MARGIN_LEFT, y: 2.20, w: 5.60, h: 4.30,
        fontSize: 15, fontFace, color: bodyColor, lineSpacing: 24
      });

      const splitImageUrl = slideData.image || data.image;
      let imgOk = false;
      if (splitImageUrl && typeof splitImageUrl === 'string' && (splitImageUrl.startsWith('http') || fs.existsSync(splitImageUrl))) {
        try {
          slide.addImage({
            path: splitImageUrl,
            x: 6.85, y: 1.20, w: 5.68, h: 5.35,
            rounding: true
          });
          imgOk = true;
        } catch (e) {
          imgOk = false;
        }
      }

      if (!imgOk) {
        slide.addShape(SHAPES.roundRect, {
          x: 6.85, y: 1.20, w: 5.68, h: 5.35,
          fill: { color: '0F172A' },
          line: { color: primaryColor, width: 1.5 }
        });
        slide.addText(data.title || 'Featured Visual', {
          x: 7.15, y: 3.20, w: 5.08, h: 1.40,
          fontSize: 22, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
        });
      }

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'diagram') {
      // 12. Diagram / Flow
      slide.addText(data.title || 'System Architecture & Workflow', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      if (data.description) {
        slide.addText(data.description, {
          x: MARGIN_LEFT, y: 1.80, w: CONTENT_WIDTH, h: 0.65,
          fontSize: 14, fontFace, color: bodyColor
        });
      }

      const nodes = [
        { title: 'Data Ingestion', label: 'Multi-source raw telemetry & event ingestion' },
        { title: 'AI Processing', label: 'Neural analysis, embeddings & transformer reasoning' },
        { title: 'Validation', label: 'Guardrail verification & quality scoring' },
        { title: 'Deployment', label: 'Production endpoints & stakeholder dashboards' }
      ];

      const gap = 0.35;
      const colWidth = (CONTENT_WIDTH - 3 * gap) / 4; // 2.67"

      nodes.forEach((n, idx) => {
        const posX = MARGIN_LEFT + idx * (colWidth + gap);
        slide.addShape(SHAPES.roundRect, {
          x: posX, y: 3.10, w: colWidth, h: 2.80,
          fill: { color: cardBg },
          line: { color: primaryColor, width: 1.5 }
        });
        slide.addText(`Phase 0${idx + 1}`, {
          x: posX + 0.2, y: 3.30, w: colWidth - 0.4, h: 0.35,
          fontSize: 12, fontFace: headingFont, color: primaryColor, bold: true
        });
        slide.addText(n.title, {
          x: posX + 0.2, y: 3.75, w: colWidth - 0.4, h: 0.50,
          fontSize: 16, fontFace: headingFont, color: titleColor, bold: true
        });
        slide.addText(n.label, {
          x: posX + 0.2, y: 4.30, w: colWidth - 0.4, h: 1.40,
          fontSize: 12, fontFace, color: bodyColor, lineSpacing: 17
        });

        if (idx < nodes.length - 1) {
          slide.addText('➔', {
            x: posX + colWidth + 0.05, y: 4.10, w: gap - 0.1, h: 0.5,
            fontSize: 18, fontFace, color: primaryColor, align: 'center'
          });
        }
      });

      addSlideFooter(slide, pageNumber, false);

    } else if (layout === 'closing') {
      // 13. Closing Slide
      slide.addShape(SHAPES.roundRect, {
        x: 4.66, y: 1.80, w: 4.0, h: 0.40,
        fill: { color: '1E293B' },
        line: { color: primaryColor, width: 1 }
      });
      slide.addText('STRATEGIC NEXT STEPS', {
        x: 4.66, y: 1.80, w: 4.0, h: 0.40,
        fontSize: 11, fontFace: headingFont, color: primaryColor, bold: true, align: 'center', valign: 'middle'
      });

      slide.addText(data.message || data.title || 'Driving Next-Generation Innovation', {
        x: 1.5, y: 2.60, w: 10.333, h: 1.80,
        fontSize: 36, fontFace: headingFont, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
      });

      if (data.contact) {
        slide.addShape(SHAPES.roundRect, {
          x: 4.16, y: 4.80, w: 5.0, h: 0.75,
          fill: { color: '111C38' },
          line: { color: primaryColor, width: 1.5 }
        });
        slide.addText(data.contact, {
          x: 4.16, y: 4.80, w: 5.0, h: 0.75,
          fontSize: 15, fontFace, color: 'FFFFFF', align: 'center', valign: 'middle'
        });
      }

      slide.addText(data.orgName || 'Slidewright AI', {
        x: 1.5, y: 6.45, w: 10.333, h: 0.40,
        fontSize: 11, fontFace, color: '64748B', align: 'center'
      });

    } else {
      // Fallback
      slide.addText(data.title || 'Strategic Overview', {
        x: MARGIN_LEFT, y: MARGIN_TOP, w: CONTENT_WIDTH, h: 0.75,
        fontSize: 26, fontFace: headingFont, color: titleColor, bold: true
      });
      slide.addShape(SHAPES.line, {
        x: MARGIN_LEFT, y: MARGIN_TOP + 0.75, w: 1.8, h: 0,
        line: { color: primaryColor, width: 2.5 }
      });

      const textContent = data.body || data.text || (typeof data === 'object' ? Object.values(data).filter(v => typeof v === 'string').join('\n\n') : '');
      if (textContent) {
        slide.addText(textContent, {
          x: MARGIN_LEFT, y: 2.10, w: CONTENT_WIDTH, h: 4.40,
          fontSize: 15, fontFace, color: bodyColor, lineSpacing: 24
        });
      }

      addSlideFooter(slide, pageNumber, false);
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await pres.writeFile({ fileName: outputPath });
  return outputPath;
}
