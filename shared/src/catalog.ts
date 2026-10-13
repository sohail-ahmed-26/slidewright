export const LAYOUT_CATALOG = {
  cover: {
    maxSlots: { title: 1, subtitle: 1 },
    theme: 'dark'
  },
  agenda: {
    maxSlots: { items: 4 },
    theme: 'light'
  },
  title_body: {
    maxSlots: { title: 1, body: 1, points: 5 },
    theme: 'light'
  },
  two_cards: {
    maxSlots: { cards: 2 },
    theme: 'light'
  },
  icon_rows: {
    maxSlots: { rows: 5 },
    theme: 'light'
  },
  grid_2x2: {
    maxSlots: { cards: 4 },
    theme: 'light'
  },
  icon_list_dark_panel: {
    maxSlots: { list: 5 },
    theme: 'light' // Mixed, but counts as light for rhythm
  },
  big_number_dark: {
    maxSlots: { number: 1, label: 1, title: 1, baseline: 1, takeaways: 3 },
    theme: 'dark'
  },
  cards_3_bar: {
    maxSlots: { cards: 3 },
    theme: 'light'
  },
  closing: {
    maxSlots: { message: 1, contact: 1 },
    theme: 'dark'
  },
  chip_grid_callout: {
    maxSlots: { chips: 12 },
    theme: 'light'
  },
  big_circle_text: {
    maxSlots: { text: 1, circleText: 1 },
    theme: 'light'
  },
  dark_panel_points: {
    maxSlots: { points: 4 },
    theme: 'light' // Mixed
  },
  stacked_rows_3: {
    maxSlots: { rows: 3 },
    theme: 'light'
  },
  stats: {
    maxSlots: { stats: 4 },
    theme: 'light'
  },
  timeline: {
    maxSlots: { events: 5 },
    theme: 'light'
  },
  process_steps: {
    maxSlots: { steps: 5 },
    theme: 'light'
  },
  comparison: {
    maxSlots: { leftPoints: 5, rightPoints: 5 },
    theme: 'light'
  },
  quote: {
    maxSlots: { quote: 1 },
    theme: 'light'
  },
  image_split: {
    maxSlots: { text: 1 },
    theme: 'light'
  },
  image_overlay: {
    maxSlots: { title: 1, subtitle: 1 },
    theme: 'light'
  },
  chart: {
    maxSlots: { dataPoints: 8 },
    theme: 'light'
  },
  diagram: {
    maxSlots: { description: 1 },
    theme: 'light'
  }
} as const;

export type LayoutName = keyof typeof LAYOUT_CATALOG;
