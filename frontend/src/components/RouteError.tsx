import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

export function RouteError() {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  
  console.error(error);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full p-8 border rounded-xl shadow-lg bg-card text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred in the application.
          </p>
        </div>
        <div className="bg-muted p-4 rounded-md text-sm text-left overflow-auto max-h-32">
          <code className="text-xs text-muted-foreground break-words">
            {error?.message || error?.statusText || "Unknown error"}
          </code>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button className="flex-1" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
