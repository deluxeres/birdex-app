import { useEffect, type RefObject } from 'react';
import { useMotionEnvironment } from './useMotionEnvironment';
export function useHeroParallax(ref: RefObject<HTMLElement | null>) {
  const enabled = useMotionEnvironment();
  useEffect(() => {
    const scene = ref.current?.querySelector<HTMLElement>('.hero-art');
    if (!scene || !enabled) return;
    const layers = [...scene.querySelectorAll<HTMLElement>('[data-depth]')];
    let bounds = scene.getBoundingClientRect(), frame = 0, time = 0, x = 0, y = 0, tx = 0, ty = 0;
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const factor = 1 - Math.exp(-Math.min(now - (time || now - 16), 50) / 120); time = now;
      x += (tx - x) * factor; y += (ty - y) * factor;
      layers.forEach(layer => { const depth = Number(layer.dataset.depth); layer.style.setProperty('--parallax-x', `${x * depth}px`); layer.style.setProperty('--parallax-y', `${y * depth}px`); });
      if (Math.abs(tx - x) + Math.abs(ty - y) > .001) frame = requestAnimationFrame(draw); else time = 0;
    };
    const schedule = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      tx = inside ? (event.clientX - bounds.left) / bounds.width * 2 - 1 : 0;
      ty = inside ? (event.clientY - bounds.top) / bounds.height * 2 - 1 : 0; schedule();
    };
    const measure = () => { bounds = scene.getBoundingClientRect(); };
    const reset = () => { tx = ty = 0; schedule(); };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; time = 0; } else reset(); };
    const observer = new ResizeObserver(measure); observer.observe(scene);
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('scroll', measure, { passive: true }); window.addEventListener('resize', measure);
    window.addEventListener('blur', reset); document.addEventListener('pointerleave', reset); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('pointermove', move); window.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); window.removeEventListener('blur', reset); document.removeEventListener('pointerleave', reset); document.removeEventListener('visibilitychange', visibility); layers.forEach(layer => { layer.style.removeProperty('--parallax-x'); layer.style.removeProperty('--parallax-y'); }); };
  }, [enabled, ref]);
}
