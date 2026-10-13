import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../lib/store';
import { useDeckStore } from '../../store/useDeckStore';
import { Plus, Library, Bot, Settings, PanelLeftClose, PanelLeft, Crown, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const decks = useDeckStore(s => s.decks);
  const recentDecks = decks.slice(0, 5);

  const navigate = useNavigate();

  return (
    <aside className={cn(
      "h-screen flex flex-col bg-background border-r border-border transition-all duration-300 overflow-hidden shrink-0",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs leading-none">S</span>
            </div>
            <span className="font-bold tracking-tight text-foreground">Slidewright</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Toggle Sidebar">
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        <Button 
          className={cn("justify-start gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md", !sidebarOpen && "justify-center px-0")}
          onClick={() => navigate('/new')}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {sidebarOpen && "New Presentation"}
        </Button>
        
        <NavItem to="/library" icon={<Library className="h-4 w-4 shrink-0" />} label="Library" open={sidebarOpen} />
        <NavItem to="/agents" icon={<Bot className="h-4 w-4 shrink-0" />} label="Agents" open={sidebarOpen} />
        <NavItem to="/settings" icon={<Settings className="h-4 w-4 shrink-0" />} label="Settings" open={sidebarOpen} />

        {sidebarOpen && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Recent
            </h3>
            <div className="flex flex-col gap-1">
              {recentDecks.map(deck => (
                <NavLink
                  key={deck.id}
                  to={`/decks/${deck.id}`}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg truncate transition-colors",
                    isActive ? "text-white font-medium bg-white/10" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{deck.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {sidebarOpen && (
        <div className="p-4 mt-auto">
          <div className="bg-card rounded-xl p-4 border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2 text-warning">
              <Crown className="w-4 h-4" />
              <span className="font-semibold text-sm text-foreground">Upgrade Plan</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock more agents and a higher limits
            </p>
            <Link to="/settings" className="text-xs text-primary flex items-center gap-1 hover:underline w-fit">
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ to, icon, label, open }: { to: string, icon: React.ReactNode, label: string, open: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
        isActive ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-white",
        !open && "justify-center px-0"
      )}
      title={!open ? label : undefined}
    >
      {icon}
      {open && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
