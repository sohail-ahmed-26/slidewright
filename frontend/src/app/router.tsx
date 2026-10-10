import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import DevKit from '../pages/DevKit';

// Placeholder Pages
const Home = () => <div className="p-8"><h1 className="text-2xl font-bold">Home</h1><p className="text-muted-foreground mt-2">Welcome to Slidewright. Start by creating a new presentation or checking the library.</p></div>;
const NewDeck = () => <div className="p-8"><h1 className="text-2xl font-bold">New Presentation</h1></div>;
const RunJob = () => <div className="p-8"><h1 className="text-2xl font-bold">Running Job...</h1></div>;
const Library = () => <div className="p-8"><h1 className="text-2xl font-bold">Library</h1></div>;
const DeckEditor = () => <div className="p-8"><h1 className="text-2xl font-bold">Deck Editor</h1></div>;
const DeckPresent = () => <div className="p-8"><h1 className="text-2xl font-bold">Presentation View</h1></div>;
const Agents = () => <div className="p-8"><h1 className="text-2xl font-bold">Agents</h1></div>;
const AgentConfig = () => <div className="p-8"><h1 className="text-2xl font-bold">Agent Config</h1></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'new', element: <NewDeck /> },
      { path: 'runs/:jobId', element: <RunJob /> },
      { path: 'library', element: <Library /> },
      { path: 'decks/:id', element: <DeckEditor /> },
      { path: 'decks/:id/present', element: <DeckPresent /> },
      { path: 'agents', element: <Agents /> },
      { path: 'agents/:name', element: <AgentConfig /> },
      { path: 'settings', element: <Settings /> },
      { path: 'dev/kit', element: <DevKit /> },
    ]
  }
]);
