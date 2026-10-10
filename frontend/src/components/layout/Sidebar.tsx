import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../lib/store';
import { Plus, Library, Bot, Settings, PanelLeftClose, PanelLeft, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { FIXTURES } from '@slidewright/shared/src/fixtures';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const recentDecks = FIXTURES.decks.slice(0, 5);

  return (
    <aside className={cn(
      "h-screen flex flex-col bg-card border-r transition-all duration-300 overflow-hidden",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="h-14 flex items-center justify-between px-4 border-b">
        {sidebarOpen && <span className="font-bold text-lg tracking-tight truncate">Slidewright</span>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0" aria-label="Toggle Sidebar">
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2">
        <NavItem to="/new" icon={<Plus className="h-4 w-4" />} label="New Presentation" open={sidebarOpen} />
        <NavItem to="/library" icon={<Library className="h-4 w-4" />} label="Library" open={sidebarOpen} />
        <NavItem to="/agents" icon={<Bot className="h-4 w-4" />} label="Agents" open={sidebarOpen} />
        <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" open={sidebarOpen} />

        {sidebarOpen && (
          <div className="mt-8 px-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Recent
            </h3>
            <div className="flex flex-col gap-1">
              {recentDecks.map(deck => (
                <NavLink
                  key={deck.id}
                  to={`/decks/${deck.id}`}
                  className={({ isActive }) => cn(
                    "block px-2 py-1.5 text-sm rounded-md truncate transition-colors",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {deck.title}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

function NavItem({ to, icon, label, open }: { to: string, icon: React.ReactNode, label: string, open: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-sm font-medium",
        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        !open && "justify-center"
      )}
      title={!open ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {open && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
