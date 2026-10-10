import React, { useState, useEffect } from 'react';
import { SlideRenderer } from '../components/slide/SlideRenderer';

export default function DevDiagrams() {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will just dynamically load eval-visuals-1 to 6
    const load = async () => {
      try {
        const data = await fetch('/visuals.json').then(r => r.json());
        setDecks(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!decks.length) return <div className="p-8">No diagrams found. Did you run export-visuals?</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">Visuals Eval: Diagrams & Images</h1>
      <div className="flex flex-col gap-12">
        {decks.map((deck: any) => (
          <div key={deck.id} className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">{deck.title}</h2>
            
            <div className="grid grid-cols-2 gap-8">
              {deck.slides.map((s: any) => (
                <div key={s.id} className="flex flex-col gap-2">
                  <div className="font-mono text-sm text-gray-500 truncate max-w-full">
                    {s.layout === 'diagram' ? `Diagram (${s.diagram?.type})` : 'Image Split'}
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-300 bg-white shadow-sm">
                    <SlideRenderer slide={s} theme={{ primary: '220 80% 50%', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
