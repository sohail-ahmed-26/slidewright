export const FIXTURES = {
  decks: [
    {
      id: "deck-1",
      title: "Q3 Marketing Strategy",
      createdAt: new Date().toISOString(),
      status: "ready",
      theme: { primary: "173 80% 40%", fontFamily: "Inter, sans-serif" }, // Teal
      slides: [
        { id: "s1_1", layout: "cover", data: { title: "Q3 Marketing Strategy", subtitle: "Driving growth through digital", orgName: "Acme Corp" } },
        { id: "s1_2", layout: "chip_grid_callout", data: { title: "Strategic Pillars", orgName: "Acme Corp", pageNumber: 2, callout: { title: "Focus Areas", body: "We are doubling down on performance channels." }, chips: ["SEO", "Content", "Paid Social", "Email Marketing", "Partnerships", "Webinars"] } },
        { id: "s1_3", layout: "chart", data: { title: "User Growth", orgName: "Acme Corp", pageNumber: 3, dataKey: "users", xAxisKey: "month", data: [{ month: "Jan", users: 400 }, { month: "Feb", users: 500 }, { month: "Mar", users: 800 }, { month: "Apr", users: 1200 }] } },
        { id: "s1_4", layout: "icon_rows", data: { title: "Key Channels", orgName: "Acme Corp", pageNumber: 4, rows: [{ icon: "Search", title: "Search", body: "Dominating high-intent queries." }, { icon: "Mail", title: "Email", body: "Nurturing existing leads." }] } },
        { id: "s1_5", layout: "timeline", data: { title: "Q3 Roadmap", orgName: "Acme Corp", pageNumber: 5, events: [{ date: "July", title: "Campaign Launch", body: "Global rollout" }, { date: "August", title: "Optimization", body: "A/B testing" }, { date: "Sept", title: "Review", body: "Quarterly assessment" }] } },
      ]
    },
    {
      id: "deck-2",
      title: "Product Launch: Slidewright",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "ready",
      theme: { primary: "220 80% 50%", fontFamily: "Arial, sans-serif" }, // Blue
      slides: [
        { id: "s2_1", layout: "image_overlay", data: { title: "Slidewright", subtitle: "The future of presentations.", orgName: "Slidewright Inc", pageNumber: 1, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1280&h=720" } },
        { id: "s2_2", layout: "big_circle_text", data: { title: "Our Mission", text: "To eliminate the friction between a great idea and a beautiful presentation.", circleText: "Zero Friction", orgName: "Slidewright Inc", pageNumber: 2 } },
        { id: "s2_3", layout: "process_steps", data: { title: "How it works", orgName: "Slidewright Inc", pageNumber: 3, steps: [{ title: "Prompt", body: "Tell the AI what you want." }, { title: "Generate", body: "AI builds the story and layout." }, { title: "Export", body: "Download perfectly formatted PPTX." }] } },
        { id: "s2_4", layout: "comparison", data: { title: "Old vs New", orgName: "Slidewright Inc", pageNumber: 4, left: { title: "Traditional", points: ["Hours formatting", "Ugly templates", "Manual updates"] }, right: { title: "Slidewright", points: ["Instant generation", "Designer quality", "Auto layout"] } } },
        { id: "s2_5", layout: "stats", data: { title: "Impact", orgName: "Slidewright Inc", pageNumber: 5, stats: [{ number: "10x", label: "Faster", subtext: "than manual" }, { number: "0", label: "Formatting", subtext: "required" }] } },
      ]
    },
    {
      id: "deck-3",
      title: "Q4 Engineering Plan",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "ready",
      theme: { primary: "25 90% 50%", fontFamily: "Georgia, serif" }, // Orange
      slides: [
        { id: "s3_1", layout: "cover", data: { title: "Engineering Q4", subtitle: "Scaling the infrastructure.", orgName: "TechCorp" } },
        { id: "s3_2", layout: "dark_panel_points", data: { orgName: "TechCorp", pageNumber: 2, darkPanel: { title: "Core Goals", subtitle: "Reliability & Speed" }, points: [{ title: "Migration", body: "Moving to the new cluster." }, { title: "Latency", body: "Reducing API response time." }] } },
        { id: "s3_3", layout: "diagram", data: { title: "New Architecture", description: "High-level overview of the microservices topology.", orgName: "TechCorp", pageNumber: 3 } },
        { id: "s3_4", layout: "grid_2x2", data: { title: "Team Focus", orgName: "TechCorp", pageNumber: 4, cards: [{ icon: "Server", title: "Backend", body: "Rust rewrite" }, { icon: "Layout", title: "Frontend", body: "React 19 upgrade" }, { icon: "Shield", title: "Security", body: "SOC2 Compliance" }, { icon: "Database", title: "Data", body: "Pipeline migration" }] } },
        { id: "s3_5", layout: "stacked_rows_3", data: { title: "Milestones", orgName: "TechCorp", pageNumber: 5, rows: [{ icon: "CheckCircle", title: "October", body: "Complete design phase." }, { icon: "CheckCircle", title: "November", body: "Begin rollouts." }, { icon: "CheckCircle", title: "December", body: "Final load testing." }] } },
      ]
    },
    {
      id: "deck-4",
      title: "Company Culture",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "ready",
      theme: { primary: "280 70% 50%", fontFamily: "Trebuchet MS, sans-serif" }, // Purple
      slides: [
        { id: "s4_1", layout: "image_split", data: { title: "Our Culture", text: "We build together, learn together, and grow together.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=640&h=720", imagePos: "right", orgName: "Starlight", pageNumber: 1 } },
        { id: "s4_2", layout: "quote", data: { quote: "Culture eats strategy for breakfast.", author: "Peter Drucker", role: "Management Consultant", orgName: "Starlight", pageNumber: 2 } },
        { id: "s4_3", layout: "cards_3_bar", data: { title: "Core Values", orgName: "Starlight", pageNumber: 3, cards: [{ title: "Transparency", body: "Default to open." }, { title: "Excellence", body: "High bar for quality." }, { title: "Empathy", body: "Assume good intent." }] } },
        { id: "s4_4", layout: "big_number_dark", data: { number: "100%", label: "Remote", orgName: "Starlight", pageNumber: 4 } },
        { id: "s4_5", layout: "closing", data: { message: "Join Us", contact: "careers@starlight.com", orgName: "Starlight" } },
      ]
    }
  ,
    
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
