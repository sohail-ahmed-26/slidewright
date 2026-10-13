import { create } from 'zustand';
import { Slide as SharedSlide } from '@slidewright/shared/src/schemas/visuals';

export type Deck = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  slides: Slide[];
  theme?: any;
};
export type Slide = SharedSlide & { id: string };

interface DeckState {
  decks: Deck[];
  history: Deck[][];
  future: Deck[][];

  // Actions
  setDecks: (decks: Deck[]) => void;
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

const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-q3-marketing',
    title: 'Q3 Marketing Strategy',
    status: 'ready',
    createdAt: new Date().toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 's_1',
        layout: 'cover',
        data: {
          title: 'Q3 Marketing Strategy',
          subtitle: 'Driving Growth Through Digital Innovation',
          orgName: 'Slidewright AI',
          date: 'October 2026',
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 's_2',
        layout: 'two_cards',
        data: {
          title: 'Market Analysis & Strategic Goals',
          cards: [
            { title: 'Digital Market Expansion', body: 'Targeting enterprise cloud and SaaS sectors with 45% projected Q3 uplift.' },
            { title: 'Retention Optimization', body: 'Enhancing client onboarding flows to increase net retention by 28%.' }
          ],
          orgName: 'Slidewright AI',
          pageNumber: 2
        }
      },
      {
        id: 's_3',
        layout: 'stats',
        data: {
          title: 'Key Performance Drivers',
          stats: [
            { number: '+148%', label: 'Pipeline Velocity', subtext: 'Accelerated conversion' },
            { number: '$4.2M', label: 'Projected ARR', subtext: 'Target for Q3 close' },
            { number: '92%', label: 'Client Satisfaction', subtext: 'Net promoter index' }
          ],
          orgName: 'Slidewright AI',
          pageNumber: 3
        }
      },
      {
        id: 's_4',
        layout: 'grid_2x2',
        data: {
          title: 'Core Strategic Initiatives',
          cards: [
            { title: 'Multi-Agent Pipeline', body: 'Automating slide structuring and drafting with dedicated AI roles.', icon: 'Sparkles' },
            { title: 'Native PPTX Export', body: 'Seamless round-trip conversion into PowerPoint with pixel precision.', icon: 'FileSpreadsheet' },
            { title: 'Smart Theming Engine', body: 'Dynamic palette harmonies adhering strictly to executive design rules.', icon: 'Palette' },
            { title: 'Critic Scoring', body: 'Heuristic review checking layout density, contrast, and messaging.', icon: 'BarChart3' }
          ],
          orgName: 'Slidewright AI',
          pageNumber: 4
        }
      },
      {
        id: 's_5',
        layout: 'process_steps',
        data: {
          title: 'Three-Stage Execution Roadmap',
          steps: [
            { title: 'Discovery & Framing', body: 'Capture key topic objectives, persona vectors, and tone requirements.' },
            { title: 'Agent Synthesis', body: 'Coordinated execution across Writer, Designer, and Critic engines.' },
            { title: 'Review & Delivery', body: 'Interactive slide refinement, visual tweaks, and native presentation export.' }
          ],
          orgName: 'Slidewright AI',
          pageNumber: 5
        }
      },
      {
        id: 's_6',
        layout: 'closing',
        data: {
          message: 'Driving the Next Wave of Innovation',
          contact: 'contact@slidewright.ai • www.slidewright.ai',
          orgName: 'Slidewright AI'
        }
      }
    ]
  },
  {
    id: 'deck-product-launch',
    title: 'Product Launch: Slidewright',
    status: 'ready',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 'pl_1',
        layout: 'cover',
        data: {
          title: 'Product Launch: Slidewright',
          subtitle: 'The Intelligent Multi-Agent Presentation Studio',
          orgName: 'Slidewright Team',
          date: 'October 2026',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 'pl_2',
        layout: 'big_number_dark',
        data: {
          number: '10x',
          label: 'Faster Deck Creation from Concept to PPTX',
          orgName: 'Slidewright Team',
          pageNumber: 2
        }
      },
      {
        id: 'pl_3',
        layout: 'cards_3_bar',
        data: {
          title: 'Architectural Advantages',
          cards: [
            { title: 'Specialized Agents', body: 'Each step is managed by dedicated agents with specific system prompts.' },
            { title: 'Structured Schemas', body: 'Guaranteed JSON layout schemas eliminate malformed outputs.' },
            { title: 'Native Visuals', body: 'Tailwind CSS layouts mapped 1:1 to editable PowerPoint shapes.' }
          ],
          orgName: 'Slidewright Team',
          pageNumber: 3
        }
      },
      {
        id: 'pl_4',
        layout: 'comparison',
        data: {
          title: 'Traditional Tools vs Slidewright',
          left: {
            title: 'Manual Slide Creation',
            points: ['Hours spent resizing boxes', 'Inconsistent fonts and paddings', 'Painful PPTX formatting bugs']
          },
          right: {
            title: 'Slidewright AI Pipeline',
            points: ['Instant end-to-end deck generation', 'Consistent executive design system', 'Pixel-perfect native PPTX download']
          },
          orgName: 'Slidewright Team',
          pageNumber: 4
        }
      },
      {
        id: 'pl_5',
        layout: 'closing',
        data: {
          message: 'Build Presentations at the Speed of Thought',
          contact: 'demo@slidewright.ai',
          orgName: 'Slidewright Team'
        }
      }
    ]
  },
  {
    id: 'deck-q4-engineering',
    title: 'Q4 Engineering Plan',
    status: 'running',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 'eng_1',
        layout: 'cover',
        data: {
          title: 'Q4 Engineering Plan',
          subtitle: 'Scalability, Reliability & Multi-Model Orchestration',
          orgName: 'Engineering',
          date: 'Q4 2026',
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 'eng_2',
        layout: 'timeline',
        data: {
          title: 'Key Milestones',
          events: [
            { date: 'OCT 15', title: 'Pipeline V2', body: 'Full schema enforcement and error boundary integration.' },
            { date: 'NOV 01', title: 'Export Engine', body: 'Comprehensive node-pptx alignment for all 20 layout types.' },
            { date: 'DEC 01', title: 'Enterprise SSO', body: 'Role-based access control and workspace telemetry.' }
          ],
          orgName: 'Engineering',
          pageNumber: 2
        }
      },
      {
        id: 'eng_3',
        layout: 'stats',
        data: {
          title: 'Quality & Reliability Metrics',
          stats: [
            { number: '99.9%', label: 'API Uptime', subtext: 'Target SLA' },
            { number: '< 800ms', label: 'Average Latency', subtext: 'Agent pipeline routing' },
            { number: '100%', label: 'Schema Compliance', subtext: 'Zero undefined layout errors' }
          ],
          orgName: 'Engineering',
          pageNumber: 3
        }
      },
      {
        id: 'eng_4',
        layout: 'closing',
        data: {
          message: 'Engineering Excellence for Slidewright',
          contact: 'eng-leads@slidewright.ai',
          orgName: 'Engineering'
        }
      }
    ]
  },
  {
    id: 'deck-company-culture',
    title: 'Company Culture',
    status: 'ready',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 'cul_1',
        layout: 'cover',
        data: {
          title: 'Our Company Culture',
          subtitle: 'Empowering Builders, Fostering Innovation',
          orgName: 'People Team',
          date: '2026',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 'cul_2',
        layout: 'quote',
        data: {
          quote: 'We believe exceptional software is built by autonomous teams with relentless attention to craft.',
          author: 'Leadership Team',
          role: 'Core Philosophy',
          orgName: 'People Team',
          pageNumber: 2
        }
      },
      {
        id: 'cul_3',
        layout: 'closing',
        data: {
          message: 'Join Us on the Journey',
          contact: 'careers@slidewright.ai',
          orgName: 'People Team'
        }
      }
    ]
  },
  {
    id: 'deck-ai-healthcare',
    title: 'AI in Healthcare',
    status: 'ready',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 'hc_1',
        layout: 'cover',
        data: {
          title: 'AI in Healthcare',
          subtitle: 'Transforming Patient Outcomes Through Machine Intelligence',
          orgName: 'Medical AI Research',
          date: '2026',
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 'hc_2',
        layout: 'closing',
        data: {
          message: 'The Future of Precision Medicine',
          contact: 'research@healthai.org',
          orgName: 'Medical AI Research'
        }
      }
    ]
  },
  {
    id: 'deck-renewable-energy',
    title: 'Renewable Energy',
    status: 'draft',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    theme: { primary: '#2F6BFF', fontFamily: 'Inter' },
    slides: [
      {
        id: 're_1',
        layout: 'cover',
        data: {
          title: 'Renewable Energy Outlook',
          subtitle: 'Transitioning to Clean, Sustainable Power Grids',
          orgName: 'Global Energy Institute',
          date: '2026',
          image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1280&q=80'
        }
      },
      {
        id: 're_2',
        layout: 'closing',
        data: {
          message: 'Sustainable Power for Tomorrow',
          contact: 'cleanenergy@future.org',
          orgName: 'Global Energy Institute'
        }
      }
    ]
  }
];

export const useDeckStore = create<DeckState>()(
  (set, get) => ({
    decks: INITIAL_DECKS,
  history: [],
  future: [],

  setDecks: (decks) => {
    set({ decks });
  },

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
    set(state => {
      const existingIdx = state.decks.findIndex(d => d.id === deck.id);
      if (existingIdx !== -1) {
        const newDecks = [...state.decks];
        newDecks[existingIdx] = deck;
        return { decks: newDecks };
      }
      return { decks: [deck, ...state.decks] };
    });
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
}));
