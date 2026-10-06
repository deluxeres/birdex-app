import { useLayoutEffect, useState, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'motion/react';
export function NavigationIndicator({nav,menu}:{nav:RefObject<HTMLElement|null>;menu:boolean}) {
  const location = useLocation(), reduced = useReducedMotion();
  const [position, setPosition] = useState<number | null>(null);
  useLayoutEffect(() => {
    const measure = () => { const link = nav.current?.querySelector<HTMLElement>('.active'); setPosition(link && nav.current?.offsetWidth ? link.offsetLeft + link.offsetWidth / 2 : null); };
    let disposed = false; measure(); const observer = new ResizeObserver(measure); if (nav.current) observer.observe(nav.current);
    document.fonts.ready.then(()=>{if(!disposed)measure();}); return () => {disposed=true;observer.disconnect();};
  }, [nav, location.pathname, menu]);
  return <span aria-hidden="true" className="navigation-indicator" style={{opacity:position===null?0:1,transform:`translateX(${position||0}px)`,transition:reduced?'none':undefined}}/>;
}
