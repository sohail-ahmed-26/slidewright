import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { FIXTURES } from '@slidewright/shared/src/fixtures';

export default function RenderSlide() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const slideIndex = parseInt(searchParams.get('slide') || '0', 10);
  const [slideData, setSlideData] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/outputs/decks/${deckId}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Deck not found locally");
        return res.json();
      })
      .then(data => {
        if (data.slides && data.slides[slideIndex]) {
          setSlideData(data.slides[slideIndex]);
          setTheme(data.theme);
        } else {
          setError("Slide not found in deck");
        }
      })
      .catch(err => {
        const deck = FIXTURES.decks.find(d => d.id === deckId) || FIXTURES.decks[0];
        if (deck && deck.slides && deck.slides[slideIndex]) {
          setSlideData(deck.slides[slideIndex]);
          setTheme((deck as any).theme);
        } else {
          setError(err.message + " (and no fixture fallback found)");
        }
      });
  }, [deckId, slideIndex]);

  if (error) {
    return <div className="p-8 text-red-500 font-bold">{error}</div>;
  }

  if (!slideData) {
    return <div className="p-8">Loading slide...</div>;
  }

  return (
    <SlideRenderer slide={slideData} theme={theme} exportMode />
  );
}
