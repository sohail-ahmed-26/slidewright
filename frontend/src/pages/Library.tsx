import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/useDeckStore';
import { DeckCard, formatRelative } from '../components/DeckCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, LayoutGrid, List as ListIcon, Trash2, FilePlus2, Loader2, AlertCircle } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { Skeleton } from '../components/ui/skeleton';

export function Library() {
  const navigate = useNavigate();
  const { decks, deleteDeck } = useDeckStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock loading/error
  React.useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredDecks = useMemo(() => {
    let result = decks.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
    
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    
    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'name') return a.title.localeCompare(b.title);
      if (sort === 'slides') return (b.slides?.length || 0) - (a.slides?.length || 0);
      return 0;
    });
    
    return result;
  }, [decks, search, sort, statusFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDecks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDecks.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} presentations?`)) {
      selectedIds.forEach(id => deleteDeck(id));
      setSelectedIds(new Set());
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load library</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => setError(null)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">Manage your presentations</p>
        </div>
        <Button onClick={() => navigate('/new')}>
          <FilePlus2 className="w-4 h-4 mr-2" /> New Presentation
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-card p-2 rounded-lg border">
        <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search presentations..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="slides">Most slides</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete {selectedIds.size}
            </Button>
          )}
          
          <div className="flex items-center border rounded-md bg-background">
            <Button variant="ghost" size="icon" className={`rounded-none rounded-l-md h-9 w-9 ${viewMode === 'grid' ? 'bg-muted' : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className={`rounded-none rounded-r-md h-9 w-9 ${viewMode === 'list' ? 'bg-muted' : ''}`} onClick={() => setViewMode('list')}>
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl w-full" />)}
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
          <Library className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No presentations found</h2>
          <p className="text-muted-foreground mb-6">Create a new presentation or adjust your filters.</p>
          <Button onClick={() => navigate('/new')}>Create Presentation</Button>
        </div>
      ) : (
        <div className="flex-1">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDecks.map(deck => (
                <div key={deck.id} className="relative group">
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox 
                      checked={selectedIds.has(deck.id)} 
                      onCheckedChange={() => toggleSelect(deck.id)}
                      className={`bg-white/80 data-[state=checked]:bg-primary ${selectedIds.has(deck.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                    />
                  </div>
                  <DeckCard deck={deck} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 bg-card border rounded-lg p-2">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 border-b text-sm font-medium text-muted-foreground items-center">
                <Checkbox checked={selectedIds.size > 0 && selectedIds.size === filteredDecks.length} onCheckedChange={toggleSelectAll} />
                <div>Name</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-24 text-center">Slides</div>
                <div className="w-32 text-right">Date</div>
              </div>
              {filteredDecks.map(deck => (
                <div key={deck.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 hover:bg-muted/50 rounded-md items-center cursor-pointer transition-colors" onClick={() => navigate(`/decks/${deck.id}`)}>
                  <div onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selectedIds.has(deck.id)} onCheckedChange={() => toggleSelect(deck.id)} />
                  </div>
                  <div className="font-medium truncate">{deck.title}</div>
                  <div className="w-24 flex justify-center">
                    <Badge variant="outline" className={
                      deck.status === 'ready' ? 'text-green-500 border-green-200' : 
                      deck.status === 'running' ? 'text-blue-500 border-blue-200' : 
                      'text-red-500 border-red-200'
                    }>{deck.status}</Badge>
                  </div>
                  <div className="w-24 text-center text-muted-foreground">{deck.slides?.length || 0}</div>
                  <div className="w-32 text-right text-muted-foreground text-sm">{formatRelative(deck.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
