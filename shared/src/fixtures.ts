export const FIXTURES = {
  decks: [
    {
      id: "deck-1",
      title: "Q3 Marketing Strategy",
      createdAt: new Date().toISOString(),
      status: "ready",
      slides: [
        {
          id: "s1",
          layout: "cover",
          data: { title: "Slidewright", subtitle: "AI professional presentations", orgName: "Acme Corp" }
        },
        {
          id: "s2",
          layout: "two_cards",
          data: { 
            title: "Our Mission", 
            orgName: "Acme Corp", 
            pageNumber: 2,
            cards: [
              { title: "Empower Users", body: "We believe in making presentations easy and fast." },
              { title: "Quality Output", body: "Every pixel must be perfectly placed." }
            ]
          }
        },
        {
          id: "s3",
          layout: "icon_rows",
          data: {
            title: "Key Features",
            orgName: "Acme Corp",
            pageNumber: 3,
            rows: [
              { icon: "Zap", title: "Lightning Fast", body: "AI generates slides in seconds." },
              { icon: "Shield", title: "Secure", body: "Your data never leaves the platform." },
              { icon: "Palette", title: "Beautiful Design", body: "Clean, consistent, and modern." }
            ]
          }
        },
        {
          id: "s4",
          layout: "grid_2x2",
          data: {
            title: "Market Analysis",
            orgName: "Acme Corp",
            pageNumber: 4,
            cards: [
              { icon: "TrendingUp", title: "Growth", body: "300% YoY" },
              { icon: "Users", title: "Audience", body: "1M active users" },
              { icon: "Globe", title: "Global", body: "Available in 40 countries" },
              { icon: "Star", title: "Rating", body: "4.9/5 on App Store" }
            ]
          }
        },
        {
          id: "s5",
          layout: "icon_list_dark_panel",
          data: {
            title: "Strategic Goals",
            orgName: "Acme Corp",
            pageNumber: 5,
            darkPanel: { icon: "Target", title: "2027 Vision", subtitle: "Where we are heading" },
            list: ["Expand to enterprise", "Launch new AI features", "Reach $10M ARR"]
          }
        },
        {
          id: "s6",
          layout: "big_number_dark",
          data: { number: "1M+", label: "Presentations Created", orgName: "Acme Corp", pageNumber: 6 }
        },
        {
          id: "s7",
          layout: "cards_3_bar",
          data: {
            title: "Pricing Plans",
            orgName: "Acme Corp",
            pageNumber: 7,
            cards: [
              { title: "Basic", body: "Free forever." },
              { title: "Pro", body: "$10/mo for pros." },
              { title: "Enterprise", body: "Custom pricing." }
            ]
          }
        },
        {
          id: "s8",
          layout: "closing",
          data: { message: "Thank You", contact: "hello@slidewright.com", orgName: "Acme Corp", pageNumber: 8 }
        }
      ]
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
