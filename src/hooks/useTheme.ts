import { useState } from 'react';
export function useTheme() { const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light');
  return { theme, toggle: () => setTheme(previous => { const next = previous === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = next; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0b0c0d' : '#f7f7f4'); try { localStorage.setItem('birdex-theme', next); } catch {} return next; }) };
}
