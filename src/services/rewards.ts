import { isDemo, request, type Rewards } from './season';
export async function getRewards(signal: AbortSignal): Promise<Rewards> {
  const value = isDemo ? (await import('./mock')).mockRewards : await request<Rewards>('/public/rewards', signal);
  if (!value || !['planned', 'announced'].includes(value.status) || value.currency !== 'TON' || typeof value.description !== 'string' || (value.pool !== null && (!Number.isFinite(value.pool) || value.pool < 0))) throw new Error('Reward information is temporarily unavailable.');
  return value;
}
