import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FIXTURES } from '@slidewright/shared/src/fixtures';

export type Deck = typeof FIXTURES.decks[0];
export type Slide = Deck['slides'][0];

interface DeckState {
  decks: Deck[];
  history: Deck[][];
  future: Deck[][];

  // Actions
  addDeck: (deck: Deck) => void;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  
  // Slide Actions
  addSlide: (deckId: string, slide: Slide, index?: number) => void;
  updateSlide: (deckId: string, slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (deckId: string, slideId: string) => void;
  reorderSlides: (deckId: string, startIndex: number, endIndex: number) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  _saveHistory: () => void;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [...FIXTURES.decks],
  history: [],
  future: [],

  _saveHistory: () => {
    set(state => ({
      history: [...state.history, state.decks].slice(-20), // keep last 20
      future: []
    }));
  },

  undo: () => {
    set(state => {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        decks: previous,
        history: newHistory,
        future: [state.decks, ...state.future]
      };
    });
  },

  redo: () => {
    set(state => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        decks: next,
        history: [...state.history, state.decks],
        future: newFuture
      };
    });
  },

  addDeck: (deck) => {
    get()._saveHistory();
    set(state => ({ decks: [deck, ...state.decks] }));
  },

  updateDeck: (id, updates) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  },

  deleteDeck: (id) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.filter(d => d.id !== id)
    }));
  },

  addSlide: (deckId, slide, index) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.map(d => {
        if (d.id !== deckId) return d;
        const newSlides = [...d.slides];
        if (typeof index === 'number') {
          newSlides.splice(index, 0, slide);
        } else {
          newSlides.push(slide);
        }
        return { ...d, slides: newSlides };
      })
    }));
  },

  updateSlide: (deckId, slideId, updates) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.map(d => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          slides: d.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
        };
      })
    }));
  },

  deleteSlide: (deckId, slideId) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.map(d => {
        if (d.id !== deckId) return d;
        return { ...d, slides: d.slides.filter(s => s.id !== slideId) };
      })
    }));
  },

  reorderSlides: (deckId, startIndex, endIndex) => {
    get()._saveHistory();
    set(state => ({
      decks: state.decks.map(d => {
        if (d.id !== deckId) return d;
        const result = Array.from(d.slides);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { ...d, slides: result };
      })
    }));
  }
    }),
    {
      name: 'slidewright-deck-store',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          // Reset to fixtures due to massive design system changes
          return {
            decks: [...FIXTURES.decks],
            history: [],
            future: []
          };
        }
        return persistedState;
      }
    }
  )
);
