export const FIXTURES = {
  decks: [
    {
      id: "deck-1",
      title: "Q3 Marketing Strategy",
      createdAt: new Date().toISOString(),
      status: "ready",
    },
    {
      id: "deck-2",
      title: "Product Launch: Slidewright",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "ready",
    },
    {
      id: "deck-3",
      title: "Q4 Roadmap",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "ready",
    },
    {
      id: "deck-4",
      title: "Investor Pitch",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "ready",
    },
    {
      id: "deck-5",
      title: "Team All-Hands",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: "ready",
    }
  ],
  runs: [
    {
      id: "run-1",
      status: "running",
      progress: 45,
      stage: "agents/writer"
    }
  ]
};
