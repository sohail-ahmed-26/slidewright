import React, { useEffect, useState } from 'react';

export function App() {
  const [health, setHealth] = useState<string>('Checking...');

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(`Backend ${data.status} / DB ${data.db}`);
      })
      .catch(err => {
        setHealth('Backend Offline');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Slidewright</h1>
        <p className="text-lg text-gray-600">{health}</p>
      </div>
    </div>
  );
}
