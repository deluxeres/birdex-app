import { useEffect, useRef } from 'react';
import { useMotionEnvironment } from '../../hooks/useMotionEnvironment';
import { cursorIntent, surfaceTone } from './cursorState';
const interactiveSelector = 'a[href],button:not(:disabled),summary,[role="button"],[data-cursor],[data-clickable]';
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null), label = useRef<HTMLSpanElement>(null);
  const enabled = useMotionEnvironment();
  useEffect(() => {
    if (!enabled) return;
    let x = 0, y = 0, rx = 0, ry = 0, frame = 0, previousTime = 0, visible = false, dirty = true, contrastUntil = 0, target: Element | null = null;
    const hide = () => { visible = false; document.body.classList.remove('pointer-active'); cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      // Hit-test the actual surface, including during pointer capture/dragging.
      const hit = document.elementFromPoint(x, y);
      if (hit && hit !== target) { target = hit; dirty = true; contrastUntil = Math.max(contrastUntil, time + 260); }
      const factor = 1 - Math.exp(-Math.min(time - (previousTime || time - 16), 50) / 65); previousTime = time;
      rx += (x - rx) * factor; ry += (y - ry) * factor;
      dot.current!.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.current!.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      if ((dirty || time < contrastUntil) && target) {
        const interactive = target.closest(interactiveSelector), intent = cursorIntent(interactive?.getAttribute('data-cursor'));
        const tone = intent.tone || surfaceTone(target);
        dot.current!.dataset.tone = ring.current!.dataset.tone = tone;
        dot.current!.dataset.button = ring.current!.dataset.button = String(!!interactive?.matches('button,.button,[role="button"]'));
        ring.current!.dataset.interactive = String(!!interactive);
        ring.current!.dataset.label = intent.label;
        dot.current!.dataset.labelled = String(!!intent.label); label.current!.textContent = intent.label; dirty = false;
      }
      if (time < contrastUntil || Math.abs(x - rx) + Math.abs(y - ry) > .08) frame = requestAnimationFrame(draw); else previousTime = 0;
    };
    const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      // Native cursor remains available inside browser top-layer dialogs.
      if (event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) { hide(); return; }
      x = event.clientX; y = event.clientY;
      const nextTarget = event.target instanceof Element ? event.target : null;
      if (target !== nextTarget) { target = nextTarget; dirty = true; contrastUntil = Math.max(contrastUntil, performance.now() + 260); }
      if (!visible) { rx = x; ry = y; dirty = true; visible = true; document.body.classList.add('pointer-active'); }
      schedule();
    };
    const refresh = () => { target = document.elementFromPoint(x, y); dirty = true; schedule(); };
    const visibility = () => { if (document.hidden) hide(); };
    const observer = new MutationObserver(records => { if(records.some(record=>record.attributeName==='data-theme')) contrastUntil=performance.now()+420; if (document.querySelector('dialog[open]')) hide(); else refresh(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('scroll', refresh, { passive: true }); window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide); document.addEventListener('visibilitychange', visibility);
    return () => { hide(); observer.disconnect(); window.removeEventListener('pointermove', move); window.removeEventListener('scroll', refresh); window.removeEventListener('blur', hide); document.removeEventListener('pointerleave', hide); document.removeEventListener('visibilitychange', visibility); };
  }, [enabled]);
  return <><div aria-hidden="true" className="cursor-dot" ref={dot}/><div aria-hidden="true" className="cursor-ring" ref={ring}><span ref={label}/></div></>;
}

