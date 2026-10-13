import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RouteError } from '../components/RouteError';
import RenderSlide from '../pages/RenderSlide';
import { DeckPresent } from '../pages/DeckPresent';
import { Home } from '../pages/Home';
import { Library } from '../pages/Library';
import { DeckEditor } from '../pages/DeckEditor';
import { NewDeck } from '../pages/NewDeck';
import { RunJob } from '../pages/RunJob';
import { Agents } from '../pages/Agents';
import { AgentConfig } from '../pages/AgentConfig';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'new', element: <NewDeck /> },
      { path: 'runs/:jobId', element: <RunJob /> },
      { path: 'library', element: <Library /> },
      { path: 'decks/:id', element: <DeckEditor /> },
      { path: 'agents', element: <Agents /> },
      { path: 'agents/:name', element: <AgentConfig /> },
      { path: 'settings', element: <Settings /> },
    ]
  },
  {
    path: '/decks/:id/present',
    element: <DeckPresent />
  },
  {
    // Render standalone slide (without app layout)
    path: '/render/:deckId',
    element: <RenderSlide />
  }
]);
