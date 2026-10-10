export function fuzzyIconMatch(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized.includes('search')) return 'Search';
  if (normalized.includes('mail') || normalized.includes('email')) return 'Mail';
  if (normalized.includes('user') || normalized.includes('person')) return 'User';
  if (normalized.includes('server') || normalized.includes('data')) return 'Server';
  if (normalized.includes('chart') || normalized.includes('graph')) return 'BarChart';
  if (normalized.includes('shield') || normalized.includes('secure')) return 'Shield';
  return 'CheckCircle'; // Default fallback
}
