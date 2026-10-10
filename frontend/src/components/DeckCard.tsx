import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { SlideRenderer } from './slide/SlideRenderer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MoreVertical, Play, Edit2, Copy, Download, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Deck, useDeckStore } from '../store/useDeckStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

export function formatRelative(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString();
}

export function DeckCard({ deck }: { deck: Deck }) {
  const navigate = useNavigate();
  const deleteDeck = useDeckStore(s => s.deleteDeck);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const statusColor = deck.status === 'ready' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 
                      deck.status === 'running' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 
                      'bg-red-500/10 text-red-500 hover:bg-red-500/20';

  return (
    <>
      <Card className="group overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border bg-card flex flex-col" onClick={() => navigate(`/decks/${deck.id}`)}>
        {/* Thumbnail container */}
        <div className="relative aspect-video bg-muted/30 border-b overflow-hidden">
          {deck.slides && deck.slides[0] ? (
            <div className="w-full h-full pointer-events-none origin-top-left flex items-center justify-center p-2">
               <div className="w-full h-full relative">
                 <SlideRenderer slide={deck.slides[0]} theme={deck.theme} exportMode />
               </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
              Empty
            </div>
          )}
          
          <div className="absolute top-2 left-2">
             <Badge variant="secondary" className={statusColor}>
                {deck.status}
             </Badge>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
             <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm rounded-full" onClick={(e) => { e.stopPropagation(); navigate(`/decks/${deck.id}/present`); }}>
                <Play className="h-4 w-4" fill="currentColor" />
             </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base line-clamp-1">{deck.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelative(deck.createdAt)} • {deck.slides?.length || 0} slides
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 shrink-0">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => navigate(`/decks/${deck.id}`)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/decks/${deck.id}/present`)}>
                  <Play className="h-4 w-4 mr-2" /> Present
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Rename mock")}>
                  <Edit2 className="h-4 w-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Duplicate mock")}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert("Download mock")}>
                  <Download className="h-4 w-4 mr-2" /> Download PPTX
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deck.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDeck(deck.id)} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
