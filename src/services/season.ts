export interface Season { id: string; name: string; status: 'live' | 'upcoming' | 'ended'; startsAt: string; endsAt: string; totalBirdPoints: number | null; network: 'TON'; }
export interface Rewards { pool: number | null; currency: 'TON'; status: 'planned' | 'announced'; description: string; }
export const isDemo = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';
// Official dates remain visible if the statistics server is temporarily unavailable.
export const announcedSeason: Season = { id: 'season_01', name: 'Season 01', status: 'live', startsAt: '2026-09-25T21:00:00Z', endsAt: '2027-01-23T21:00:00Z', totalBirdPoints: null, network: 'TON' };
export async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) throw new Error('Season information is not available yet. Check back soon.');
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]), credentials: 'omit' });
  if (!response.ok) throw new Error('We couldn’t load the latest information. Please try again.');
  return response.json();
}
export function validateSeason(value: Season): Season {
  if (!value || typeof value.id !== 'string' || typeof value.name !== 'string' || !['live','upcoming','ended'].includes(value.status) || (value.totalBirdPoints !== null && (typeof value.totalBirdPoints !== 'number' || !Number.isFinite(value.totalBirdPoints) || value.totalBirdPoints < 0)) || !Number.isFinite(Date.parse(value.startsAt)) || !Number.isFinite(Date.parse(value.endsAt)) || Date.parse(value.endsAt) <= Date.parse(value.startsAt) || value.network !== 'TON') throw new Error('Season information is temporarily unavailable.');
  return value;
}
export async function getSeason(signal: AbortSignal): Promise<Season> {
  const value = isDemo ? (await import('./mock')).mockSeason : await request<Season>('/public/season', signal);
  return validateSeason(value);
}
