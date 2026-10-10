import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../lib/store';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function Topbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const isMock = import.meta.env.VITE_API_MODE !== 'http';

  // Basic breadcrumb logic
  const path = location.pathname;
  const breadcrumb = path === '/' ? 'Home' : path.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">{breadcrumb}</h2>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={isMock ? 'secondary' : 'default'} className="font-mono text-xs">
          {isMock ? 'Mock mode' : 'Live'}
        </Badge>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
