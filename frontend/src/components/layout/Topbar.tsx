import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../lib/store';
import { useDeckStore } from '../../store/useDeckStore';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUIStore();
  const isMock = import.meta.env.VITE_API_MODE !== 'http';
  const decks = useDeckStore(s => s.decks);

  // Breadcrumb logic
  const path = location.pathname;
  let breadcrumb = 'Home';
  
  if (path.startsWith('/decks/')) {
    const parts = path.split('/');
    const deckId = parts[2];
    const deck = decks.find(d => d.id === deckId);
    const suffix = parts.length > 3 ? ` / ${parts.slice(3).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}` : '';
    breadcrumb = deck ? `Decks / ${deck.title}${suffix}` : `Decks / ${deckId}${suffix}`;
  } else if (path !== '/') {
    breadcrumb = path.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">{breadcrumb}</h2>
      </div>
      <div className="flex items-center gap-4">
        <Badge 
          variant={isMock ? 'warning' : 'success'} 
          className="cursor-pointer hover:opacity-80"
          onClick={() => navigate('/settings')}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isMock ? 'bg-orange-500' : 'bg-green-500'}`} />
          {isMock ? 'Mock mode' : 'Live'}
        </Badge>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
