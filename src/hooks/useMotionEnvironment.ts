import { useSyncExternalStore } from 'react';
const fineQuery = '(hover: hover) and (pointer: fine) and (min-width: 768px)';
const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribe(callback: () => void) {
  const queries = [matchMedia(fineQuery), matchMedia(reducedQuery)];
  queries.forEach(query => query.addEventListener('change', callback));
  return () => queries.forEach(query => query.removeEventListener('change', callback));
}
const snapshot = () => matchMedia(fineQuery).matches && !matchMedia(reducedQuery).matches;
export function useMotionEnvironment() { return useSyncExternalStore(subscribe, snapshot, () => false); }
