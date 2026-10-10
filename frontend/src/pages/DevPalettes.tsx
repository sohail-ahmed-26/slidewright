import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { TitleWithAccent, BigNumber } from '../components/slide/SlideComponents';
import { DesignerOutput } from '@slidewright/shared';

export default function DevPalettes() {
  const [designs, setDesigns] = useState<{ id: number; topic: string; design: DesignerOutput }[]>([]);
  const [loading, setLoading] = useState(true);

  // Since we don't have a real backend to list outputs, we'll fetch them from the mock backend port or just statically require them.
  // Wait, frontend cannot read `outputs/decks` directly via fs.
  // So we will just use a mock API or Vite's import.meta.glob to read the outputs folder!
  // BUT the outputs folder is outside frontend root. Vite blocks this by default unless configured.
  // I will just fetch them from our mock API (which doesn't exist yet for palettes).
  // Alternative: I can write a script to build `dev-palettes.json` into the `public` folder.
  
  // Actually, Vite supports import.meta.glob with absolute paths if server.fs.strict is false, but let's just fetch a statically generated file.
  
  useEffect(() => {
    fetch('/palettes.json')
      .then(res => res.json())
      .then(data => {
        setDesigns(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!designs.length) return <div className="p-8">No palettes found. Ensure you ran the script to copy them to frontend/public/palettes.json</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">Designer Eval: Palettes & Fonts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {designs.map(({ id, topic, design }) => (
          <div key={id} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Topic {id}: {topic}</h2>
            <div className="text-sm text-gray-600 mb-2">
              <p><strong>Mood:</strong> {design.moodName}</p>
              <p><strong>Rationale:</strong> {design.rationale}</p>
              <p><strong>Hue:</strong> {design.hue} | <strong>Fonts:</strong> {design.fontHeading} / {design.fontBody}</p>
            </div>
            
            {/* Color Swatches */}
            <div className="flex rounded overflow-hidden h-12 shadow-sm border border-gray-200">
              <div className="flex-1" style={{ backgroundColor: `hsl(${design.theme.primary})` }} title="Primary"></div>
              <div className="flex-1" style={{ backgroundColor: `hsl(${design.theme.muted})` }} title="Muted"></div>
              {design.theme.accent && <div className="flex-1" style={{ backgroundColor: `hsl(${design.theme.accent})` }} title="Accent"></div>}
            </div>

            {/* Sample Slides (Scaled down) */}
            <div className="flex gap-4">
              <Card 
                className="flex-1 aspect-video flex flex-col justify-center items-center text-center p-4" 
                style={{
                  backgroundColor: `hsl(${design.theme.primary})`,
                  color: `hsl(${design.theme.primaryForeground})`,
                  fontFamily: design.fontHeading
                }}
              >
                <h3 className="text-lg font-bold" style={{ fontFamily: design.fontHeading }}>{topic}</h3>
                <p className="text-xs opacity-80" style={{ fontFamily: design.fontBody }}>{design.rationale}</p>
              </Card>
              
              <Card 
                className="flex-1 aspect-video flex flex-col justify-center items-center p-4 bg-white"
                style={{ fontFamily: design.fontBody }}
              >
                <div className="w-full h-full flex flex-col" style={{ '--primary': design.theme.primary, '--muted': design.theme.muted } as any}>
                  <TitleWithAccent title="Key Insight" className="mb-2 text-sm" />
                  <div className="flex-1 rounded p-2" style={{ backgroundColor: `hsl(${design.theme.muted})`, borderRadius: design.radius === 'pill' ? '999px' : `${design.radius}px` }}>
                    <p className="text-xs" style={{ color: `hsl(${design.theme.mutedForeground})` }}>This card shows the radius ({design.radius}px) and tinted style.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
