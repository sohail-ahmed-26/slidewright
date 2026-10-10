import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Helper to safely parse JSON strings from SQLite.
 */
export function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.error('Failed to parse JSON from DB', err);
    return null;
  }
}

/**
 * Helper to safely stringify objects for SQLite.
 */
export function stringifyJson(value: any): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}
