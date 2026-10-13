import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple unzip helper for standard uncompressed/deflated ZIP entries
function inspectPptx() {
  const pptxPath = path.resolve('references/ui/reference.pptx/Types of Jobs in Data Science & Full Stack AI Development.pptx');
  if (!fs.existsSync(pptxPath)) {
    console.log('File does not exist at:', pptxPath);
    return;
  }
  const stat = fs.statSync(pptxPath);
  console.log(`[Inspect] File exists! Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);

  // Let's use adm-zip or native unzip if available, or extract via PowerShell
}

inspectPptx();
