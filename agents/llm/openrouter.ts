import { z } from 'zod';

export interface OpenRouterOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  mockMode?: boolean;
  temperature?: number;
}

export async function callOpenRouter(options: OpenRouterOptions): Promise<string> {
  if (options.mockMode) {
    console.log(`[Mock OpenRouter] Generating response for model: ${options.model}`);
    return await generateMockResponse(options);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model,
      temperature: options.temperature ?? 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

// Simple mock generator for writer
async function generateMockResponse(options: OpenRouterOptions): Promise<string> {
  const slideCountMatch = options.userPrompt.match(/slide count (\d+)/i);
  const requestedCount = slideCountMatch ? parseInt(slideCountMatch[1]) : 10;
  const count = Math.max(10, Math.min(requestedCount, 20)); // Ensure at least 10 for variety rule
  
  const slides = [];
  slides.push({
    layout: 'cover',
    data: { title: 'Mock Presentation', subtitle: 'Auto-generated for testing', orgName: 'Testing Corp' }
  });
  
  // Needs 6 distinct layouts total. We have cover and closing (2). Need 4 more.
  // And 1 dark slide.
  
  const middleLayouts = ['two_cards', 'grid_2x2', 'icon_rows', 'big_number_dark', 'chip_grid_callout', 'timeline'];
  
  for (let i = 1; i < count - 1; i++) {
    // Just cycle through the layouts
    let layoutName = middleLayouts[(i - 1) % middleLayouts.length];
    
    // Ensure only one dark slide (at i = 4)
    if (layoutName === 'big_number_dark' && i !== 4) {
      layoutName = 'two_cards';
    } else if (i === 4) {
      layoutName = 'big_number_dark';
    }

    if (layoutName === 'big_number_dark') {
      slides.push({ layout: layoutName, data: { number: '100%', label: 'Success', orgName: 'Testing Corp', pageNumber: i + 1 } });
    } else if (layoutName === 'two_cards') {
      slides.push({ layout: layoutName, data: { title: 'Overview', orgName: 'Testing Corp', pageNumber: i + 1, cards: [{ title: 'Point A', body: 'Detail A' }, { title: 'Point B', body: 'Detail B' }] } });
    } else if (layoutName === 'grid_2x2') {
      slides.push({ layout: layoutName, data: { title: 'Grid', orgName: 'Testing Corp', pageNumber: i + 1, cards: [{ title: 'A', body: '1' }, { title: 'B', body: '2' }, { title: 'C', body: '3' }, { title: 'D', body: '4' }] } });
    } else if (layoutName === 'icon_rows') {
      slides.push({ layout: layoutName, data: { title: 'Rows', orgName: 'Testing Corp', pageNumber: i + 1, rows: [{ icon: 'Check', title: 'A', body: '1' }] } });
    } else if (layoutName === 'chip_grid_callout') {
      slides.push({ layout: layoutName, data: { title: 'Callout', orgName: 'Testing Corp', pageNumber: i + 1, callout: { title: 'Hey', body: 'Listen' }, chips: ['One', 'Two'] } });
    } else if (layoutName === 'timeline') {
      slides.push({ layout: layoutName, data: { title: 'Timeline', orgName: 'Testing Corp', pageNumber: i + 1, events: [{ date: '2023', title: 'Start', body: 'Genesis' }] } });
    }
  }

  slides.push({
    layout: 'closing',
    data: { message: 'Thank You', contact: 'questions@test.com', orgName: 'Testing Corp' }
  });

  return JSON.stringify({ slides });
}
