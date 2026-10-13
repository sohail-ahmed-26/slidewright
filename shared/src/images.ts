/**
 * Topic-driven Image Generation and Curation Service
 * Generates dynamic, context-relevant AI imagery and curated visuals matching any topic (Gamma App style).
 */

export interface TopicVisual {
  imageUrl: string;
  prompt: string;
  alt: string;
}

const DOMAIN_IMAGE_CATALOG: Record<string, string[]> = {
  healthcare: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1280&q=80', // Doctor with digital tablet
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1280&q=80', // Modern medical diagnostic
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1280&q=80', // Laboratory research
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1280&q=80', // High-tech medical surgery room
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1280&q=80', // Hospital modern architecture
  ],
  ai_datascience: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&q=80', // Data analytics dashboards
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80', // AI microchip hardware
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&q=80', // Matrix digital code cybersecurity
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1280&q=80', // Developer workstation
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&q=80', // Neural network abstract digital
  ],
  finance_business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1280&q=80', // Financial trading charts
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&q=80', // Business analytics growth
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1280&q=80', // Corporate financial strategy
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1280&q=80', // Executive boardroom meeting
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1280&q=80', // Leadership strategy workshop
  ],
  education_career: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1280&q=80', // Collaborative students team
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1280&q=80', // Seminar interactive workshop
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1280&q=80', // Study desk with laptops
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1280&q=80', // Learning and career development
  ],
  engineering_energy: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1280&q=80', // Wind turbines renewable energy
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1280&q=80', // Solar clean energy panels
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1280&q=80', // Robotics and automation lab
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1280&q=80', // Modern engineering facility
  ],
  marketing_creative: [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1280&q=80', // Startup marketing campaign
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1280&q=80', // UI/UX design wireframing
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&q=80', // Team collaboration workshop
  ],
  general_corporate: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80', // Modern minimalist corporate office
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1280&q=80', // Professional executive workspace
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&q=80', // Modern architectural glass
  ]
};

function detectDomain(text: string): string {
  const lower = (text || '').toLowerCase();

  if (lower.match(/health|medic|doctor|clinic|patient|diagnos|hospital|biotech|pharma|bio/)) {
    return 'healthcare';
  }
  if (lower.match(/ai|artificial intelligence|data science|machine learning|neural|deep learning|software|developer|coding|cyber|cloud|tech|robot/)) {
    return 'ai_datascience';
  }
  if (lower.match(/finance|bank|money|invest|market|sales|revenue|trade|crypto|stock|fintech|quarterly/)) {
    return 'finance_business';
  }
  if (lower.match(/student|learn|teach|career|job|university|college|education|course|degree|curriculum|seminar/)) {
    return 'education_career';
  }
  if (lower.match(/energy|solar|wind|climate|sustainab|engineer|construct|manufactur|hardware/)) {
    return 'engineering_energy';
  }
  if (lower.match(/market|design|brand|content|creative|media|customer|social/)) {
    return 'marketing_creative';
  }
  return 'general_corporate';
}

function generateAiPromptForTopic(topic: string, context?: string): string {
  const domain = detectDomain(topic + ' ' + (context || ''));
  const cleanTopic = topic.replace(/[^\w\s]/g, '').trim();

  switch (domain) {
    case 'healthcare':
      return `professional healthcare medical AI diagnostics, doctor analyzing holographic medical scans in modern hospital laboratory, 8k photographic, cinematic, 16:9 widescreen`;
    case 'ai_datascience':
      return `modern data science and AI development workspace, multi-screen neural network training dashboards, sleek tech enterprise office, 8k photographic, cinematic, 16:9 widescreen`;
    case 'finance_business':
      return `executive financial intelligence, dynamic global market analytics dashboard, sleek corporate boardroom with high contrast charts, 8k photographic, 16:9 widescreen`;
    case 'education_career':
      return `diverse team of modern students and engineers collaborating on high-tech innovation project, modern university workshop, 8k photographic, 16:9 widescreen`;
    case 'engineering_energy':
      return `cutting-edge sustainable engineering and renewable technology, modern industrial innovation, clean photographic aesthetic, 8k, 16:9 widescreen`;
    case 'marketing_creative':
      return `creative product design and digital innovation workshop, modern studio with strategic workflow visuals, 8k, 16:9 widescreen`;
    default:
      return `${cleanTopic}, executive presentation aesthetic, sleek modern architectural design, professional cinematic lighting, 8k, 16:9 widescreen`;
  }
}

/**
 * Returns a high-definition, topic-specific image visual matching the presentation.
 * Uses AI generation URL (Pollinations AI) with curated Unsplash domain fallbacks.
 */
export function getTopicVisual(topic: string, context?: string, index: number = 0): TopicVisual {
  const domain = detectDomain(topic + ' ' + (context || ''));
  const prompt = generateAiPromptForTopic(topic, context);
  
  // Seed hash based on topic string for deterministic generation
  const seed = Math.abs(
    (topic || 'presentation').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 31
  );

  // Pollinations AI real-time generation URL (100% free, dynamic, Gamma-style)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${seed}`;

  // Curated Unsplash fallback for instant reliability
  const domainList = DOMAIN_IMAGE_CATALOG[domain] || DOMAIN_IMAGE_CATALOG.general_corporate;
  const fallbackUrl = domainList[index % domainList.length];

  return {
    // Return Pollinations AI URL by default; frontend image elements have onError fallback to curated domain image
    imageUrl: aiImageUrl,
    prompt,
    alt: `${topic} - ${prompt.substring(0, 50)}`
  };
}

export function getCuratedTopicFallback(topic: string, index: number = 0): string {
  const domain = detectDomain(topic);
  const domainList = DOMAIN_IMAGE_CATALOG[domain] || DOMAIN_IMAGE_CATALOG.general_corporate;
  return domainList[index % domainList.length];
}
