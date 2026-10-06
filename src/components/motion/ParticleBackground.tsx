import { useEffect, useRef } from 'react';
import type { Container } from '@tsparticles/engine';
import { particleOptions } from './particleOptions';
export function ParticleBackground() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mobile = matchMedia('(max-width: 599px)'), tablet = matchMedia('(max-width: 1024px)'), reduced = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(hover: hover) and (pointer: fine)');
    let disposed = false, generation = 0, container: Container | undefined, queue = Promise.resolve();
    const rebuild = async () => {
      const request = ++generation; container?.destroy(); container = undefined;
      if (host.current) { host.current.dataset.particleCount = '0'; host.current.dataset.animation = 'disabled'; }
      if (disposed || mobile.matches || reduced.matches) return;
      queue = queue.then(async () => { try {
        if (disposed || request !== generation) return;
        const { getParticleEngine } = await import('./particleEngine');
        const engine = await getParticleEngine();
        if (disposed || request !== generation) return;
        const result = await engine.load({ element: host.current!, options: particleOptions(document.documentElement.dataset.theme === 'dark', tablet.matches, fine.matches) });
        if (disposed || request !== generation) { result?.destroy(); return; }
        container = result;
        if(host.current && container) { host.current.dataset.particleCount=String(container.particles.count); host.current.dataset.animation=document.hidden?'paused':'running'; }
        if (document.hidden) container?.pause();
      } catch { /* Decorative effects must not prevent the website from working. */ } });
      await queue;
    };
    const visibility = () => { if (document.hidden) container?.pause(); else container?.play(); if(host.current&&container)host.current.dataset.animation=document.hidden?'paused':'running'; };
    const observer = new MutationObserver(() => { void rebuild(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const queries = [mobile, tablet, reduced, fine]; queries.forEach(query => query.addEventListener('change', rebuild));
    document.addEventListener('visibilitychange', visibility); void rebuild();
    return () => { disposed = true; generation++; container?.destroy(); observer.disconnect(); queries.forEach(query => query.removeEventListener('change', rebuild)); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <div ref={host} className="particle-background" aria-hidden="true"/>;
}
