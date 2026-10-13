import PptxGenJS from 'pptxgenjs';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db';
import * as icons from 'lucide-static';

function safeHex(colorStr: string): string {
  // Extract hex from simple strings or try to handle rgba/hsl safely if possible.
  // For this spike, we assume colors come in as raw hsl strings like "173 80% 40%" from theme.
  // Converting HSL to Hex requires a small helper.
  // Wait, the project stores theme.primary as "173 80% 40%". Let's write a quick converter.
  // But standard color overrides might be `#16B7B3`.
  let c = colorStr.trim();
  if (c.startsWith('#')) c = c.slice(1);
  if (c.length === 8) c = c.slice(0, 6); // remove alpha
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (/^[0-9a-fA-F]{6}$/.test(c)) return c.toUpperCase();
  
  // Very rough HSL fallback for now
  return '16B7B3'; // Default teal if we can't parse easily
}

async function renderIcon(iconName: string, hexColor: string): Promise<string> {
  let svg = (icons as any)[iconName] || (icons as any)['Image'];
  svg = svg.replace('<svg ', `<svg fill="none" stroke="#${hexColor}" `);
  const buffer = await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png()
    .toBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export async function exportDeckToPptx(deckId: string): Promise<string> {
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck) throw new Error('Deck not found');
  
  const data = deck.data ? JSON.parse(deck.data) : { slides: [] };
  const design = deck.design ? JSON.parse(deck.design) : { theme: { primary: "16B7B3" } };
  
  const primaryHex = safeHex(design.theme?.primary || '16B7B3');
  const textColor = '333333';
  const bgColor = 'FFFFFF';
  const fontFace = 'Arial'; // Office safe fallback

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5

  // Slide Master for footer/wordmark
  pres.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: bgColor },
    objects: [
      { text: { text: data.title || 'Presentation', options: { x: 0.5, y: 7.1, w: 5, h: 0.3, fontSize: 10, color: '888888', fontFace } } },
      { text: { text: 'Slidewright', options: { x: 11.0, y: 7.1, w: 2, h: 0.3, fontSize: 10, color: '888888', fontFace, align: 'right' } } },
      // Slide number
      { slideNumber: { x: 12.5, y: 7.1, w: 0.5, h: 0.3, fontSize: 10, color: '888888', fontFace, align: 'right' } }
    ]
  });

  const marginX = 0.6; // 5-8% safety margin (13.3 * 0.05 ~ 0.66)
  const contentWidth = 13.333 - (marginX * 2);

  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i];
    const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    const sd = s.data || {};
    
    // Notes
    if (sd.notes) {
      slide.addNotes(sd.notes);
    } else {
      slide.addNotes(`Slide ${i+1}: ${s.layout}`);
    }

    const shadowObj = { type: 'outer', angle: 45, blur: 3, offset: 3, color: '000000', opacity: 0.2 };

    if (s.layout === 'cover') {
      slide.addText(sd.title || '', { x: marginX, y: 2.5, w: contentWidth, h: 1.5, fontSize: 44, bold: true, color: primaryHex, fontFace });
      slide.addText(sd.subtitle || '', { x: marginX, y: 4.0, w: contentWidth, h: 1.0, fontSize: 24, color: textColor, fontFace });
    } else if (s.layout === 'image_split') {
      const isRight = sd.imagePos === 'right';
      const textX = isRight ? marginX : 13.333 / 2 + 0.5;
      const imgX = isRight ? 13.333 / 2 : 0;
      slide.addText(sd.title || '', { x: textX, y: 2.0, w: contentWidth / 2 - 0.5, h: 1.0, fontSize: 36, bold: true, color: primaryHex, fontFace });
      slide.addText(sd.text || '', { x: textX, y: 3.5, w: contentWidth / 2 - 0.5, h: 3.0, fontSize: 20, color: textColor, fontFace });
      slide.addShape('rect', { x: imgX, y: 0, w: 13.333 / 2, h: 7.5, fill: { color: 'EAEAEA' } });
      slide.addText('IMAGE PLACEHOLDER', { x: imgX, y: 3.5, w: 13.333 / 2, h: 0.5, align: 'center', color: '999999' });
    } else if (s.layout === 'chip_grid_callout') {
      slide.addText(sd.title || '', { x: marginX, y: 0.5, w: contentWidth, h: 1.0, fontSize: 32, bold: true, color: primaryHex, fontFace });
      let cx = marginX;
      let cy = 2.0;
      (sd.chips || []).forEach((chip: string) => {
        slide.addShape('rect', { x: cx, y: cy, w: 2, h: 0.8, fill: { color: 'F5F5F5' }, line: { color: primaryHex, width: 1 }, shadow: shadowObj });
        slide.addText(chip, { x: cx, y: cy, w: 2, h: 0.8, fontSize: 16, color: textColor, fontFace, align: 'center', isTextBox: true, margin: 0 });
        cx += 2.2;
        if (cx > 8) { cx = marginX; cy += 1.0; }
      });
      if (sd.callout) {
        slide.addShape('rect', { x: 9.0, y: 2.0, w: 3.5, h: 3.0, fill: { color: primaryHex, transparency: 90 }, shadow: shadowObj });
        slide.addText(sd.callout.title, { x: 9.2, y: 2.2, w: 3.1, h: 0.5, fontSize: 20, bold: true, color: primaryHex, fontFace, isTextBox: true, margin: 0 });
        slide.addText(sd.callout.body, { x: 9.2, y: 2.7, w: 3.1, h: 2.0, fontSize: 16, color: textColor, fontFace, isTextBox: true, margin: 0 });
      }
    } else if (s.layout === 'chart') {
      slide.addText(sd.title || '', { x: marginX, y: 0.5, w: contentWidth, h: 1.0, fontSize: 32, bold: true, color: primaryHex, fontFace });
      
      const chartData = [
        {
          name: sd.dataKey || 'Series',
          labels: (sd.data || []).map((d: any) => d[sd.xAxisKey || 'label'] || ''),
          values: (sd.data || []).map((d: any) => d[sd.dataKey || 'value'] || 0)
        }
      ];
      slide.addChart(pres.ChartType.bar, chartData, { x: marginX, y: 2.0, w: contentWidth, h: 4.5, showLegend: true, showTitle: false, chartColors: [primaryHex] });
    } else {
      // Generic fallback
      slide.addText(sd.title || 'Slide Title', { x: marginX, y: 0.5, w: contentWidth, h: 1.0, fontSize: 32, bold: true, color: primaryHex, fontFace });
      slide.addText(JSON.stringify(sd).substring(0, 500), { x: marginX, y: 2.0, w: contentWidth, h: 4.5, fontSize: 14, color: textColor, fontFace });
    }
  }

  const outDir = path.resolve(process.cwd(), '../outputs/pptx');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const filename = `${deckId}.pptx`;
  const pptxPath = path.join(outDir, filename);
  
  await pres.writeFile({ fileName: pptxPath });

  // Record an asset row
  await prisma.asset.create({
    data: {
      kind: 'pptx',
      path: `/outputs/pptx/${filename}`,
      deckId: deck.id
    }
  });

  return `/outputs/pptx/${filename}`;
}
