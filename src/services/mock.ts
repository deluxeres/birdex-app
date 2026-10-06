import type { Season, Rewards } from './season';
// Fixed development fixtures; never imported in production mode.
export const mockSeason: Season = { id: 'season_01', name: 'Season 01', status: 'live', startsAt: '2026-09-01T00:00:00Z', endsAt: '2026-11-27T18:00:00Z', totalBirdPoints: 842158420, network: 'TON' };
export const mockRewards: Rewards = { pool: null, currency: 'TON', status: 'planned', description: 'Season rewards are planned in TON. The pool, eligibility and distribution details will be announced separately.' };
