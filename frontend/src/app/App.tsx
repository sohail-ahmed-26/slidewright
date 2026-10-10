import React, { useEffect, useState } from 'react';

import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<string>('Checking...');
  const [loading, setLoading] = useState<boolean>(true);

  const checkHealth = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(`Backend ${data.status} / DB ${data.db}`);
      })
      .catch(err => {
        setHealth('Backend Offline');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold text-gray-800">Slidewright</h1>
        <p className="text-lg text-gray-600">{health}</p>
        <Button 
          onClick={checkHealth} 
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh Status
        </Button>
      </div>
    </div>
  );
}
