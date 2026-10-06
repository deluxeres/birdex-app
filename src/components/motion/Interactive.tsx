import type { ReactNode, PointerEvent, CSSProperties } from 'react';
import { useRef, useEffect } from 'react';
import { useMotionEnvironment } from '../../hooks/useMotionEnvironment';
export function Interactive({ children, className = '', mode = 'magnet' }: { children: ReactNode; className?: string; mode?: 'magnet' | 'parallax' | 'tilt' }) {
 const ref=useRef<HTMLDivElement>(null);const enabled=useMotionEnvironment();const frame=useRef(0);const point=useRef({x:0,y:0});
 useEffect(()=>{if(!enabled&&ref.current)ref.current.style.transform='';return()=>{cancelAnimationFrame(frame.current);frame.current=0;};},[enabled]);
 const move=(e:PointerEvent<HTMLDivElement>)=>{if(!enabled||e.pointerType!=='mouse')return;const bounds=e.currentTarget.getBoundingClientRect();point.current={x:(e.clientX-bounds.left)/bounds.width-.5,y:(e.clientY-bounds.top)/bounds.height-.5};if(frame.current)return;
 frame.current=requestAnimationFrame(()=>{frame.current=0;const element=ref.current;if(!element)return;const {x,y}=point.current;element.style.transform=mode==='tilt'?`perspective(1000px) rotateX(${-y*1.5}deg) rotateY(${x*1.5}deg)`: `translate3d(${x*(mode==='parallax'?12:6)}px,${y*(mode==='parallax'?12:6)}px,0)`;element.style.setProperty('--pointer-x',`${(x+.5)*100}%`);element.style.setProperty('--pointer-y',`${(y+.5)*100}%`);});};
 return <div className={className} ref={ref} onPointerMove={move} onPointerLeave={()=>{cancelAnimationFrame(frame.current);frame.current=0;if(ref.current)ref.current.style.transform='';}} style={{'--pointer-x':'50%','--pointer-y':'50%'} as CSSProperties}>{children}</div>;
}
