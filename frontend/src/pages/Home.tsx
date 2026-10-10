import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Wand2, Sparkles } from 'lucide-react';
import { useDeckStore } from '../store/useDeckStore';
import { DeckCard } from '../components/DeckCard';

export function Home() {
  const navigate = useNavigate();
  const decks = useDeckStore(s => s.decks);
  const recentDecks = decks.slice(0, 5);

  const handlePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/new');
  };

  return (
    <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Slidewright AI</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">What do you want to present?</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Describe your topic, target audience, and key takeaways. Slidewright will generate a designer-quality presentation in seconds.
        </p>

        <form onSubmit={handlePrompt} className="w-full max-w-2xl relative shadow-xl rounded-full">
          <Input 
            className="w-full h-14 pl-6 pr-32 rounded-full text-lg bg-background border-2 border-primary/20 focus-visible:ring-primary focus-visible:border-primary" 
            placeholder="e.g., A pitch deck for a new SaaS product..."
          />
          <Button type="submit" size="sm" className="absolute right-2 top-2 h-10 rounded-full px-6">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </form>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Recent Presentations</h2>
          <Button variant="ghost" onClick={() => navigate('/library')}>View all</Button>
        </div>
        
        {recentDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentDecks.map(deck => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
            No recent presentations. Create one above!
          </div>
        )}
      </div>
    </div>
  );
}
