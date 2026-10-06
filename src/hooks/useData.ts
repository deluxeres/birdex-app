import { useEffect, useState, useCallback } from 'react';
import { announcedSeason, getSeason, type Season, type Rewards } from '../services/season';
import { getRewards } from '../services/rewards';
export function useData() {
  const [data, setData] = useState<{ season?: Season; rewards?: Rewards; error?: string; loading: boolean }>({ season: announcedSeason, loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { const controller = new AbortController(); let busy = false;
    const refresh = async () => {
      if (busy || controller.signal.aborted) return;
      busy = true;
      const [season, rewards] = await Promise.allSettled([getSeason(controller.signal), getRewards(controller.signal)]);
      if (controller.signal.aborted) return;
      setData(previous => ({ loading: false, season: season.status === 'fulfilled' ? season.value : previous.season, rewards: rewards.status === 'fulfilled' ? rewards.value : previous.rewards, error: season.status === 'rejected' || rewards.status === 'rejected' ? 'Live statistics are temporarily unavailable. We’ll retry automatically.' : undefined }));
      busy = false;
    };
    void refresh();
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 60000);
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [attempt]);
  return { ...data, retry: useCallback(() => setAttempt(a => a + 1), []) };
}
