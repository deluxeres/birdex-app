// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { CustomCursor } from './CustomCursor';

let root:Root,mount:HTMLDivElement,reduced=false,fine=true,listeners:Set<()=>void>,frames:Map<number,FrameRequestCallback>,id=0;
beforeEach(()=>{
  reduced=false;fine=true;listeners=new Set();frames=new Map();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  vi.stubGlobal('matchMedia',(query:string)=>({get matches(){return query.includes('prefers-reduced-motion')?reduced:fine;},addEventListener:(_event:string,listener:()=>void)=>listeners.add(listener),removeEventListener:(_event:string,listener:()=>void)=>listeners.delete(listener)}));
  vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{frames.set(++id,callback);return id;});vi.stubGlobal('cancelAnimationFrame',(key:number)=>frames.delete(key));
  mount=document.createElement('div');document.body.appendChild(mount);root=createRoot(mount);
});
afterEach(async()=>{await act(async()=>root.unmount());mount.remove();document.body.classList.remove('pointer-active');vi.unstubAllGlobals();});
function move(element:Element,type='mouse'){element.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:type,clientX:120,clientY:60}));let time=performance.now();for(let i=0;i<60&&frames.size;i++){const pending=[...frames.values()];frames.clear();time+=16;pending.forEach(fn=>fn(time));}}
it('contrasts on button surfaces without React mousemove updates and cleans up on unmount',async()=>{
  await act(async()=>root.render(<><CustomCursor/><button style={{backgroundColor:'rgb(17,18,20)'}} data-cursor="open"><span>Open</span></button></>));
  const span=mount.querySelector('button span')!,button=mount.querySelector('button')!,ring=mount.querySelector('.cursor-ring')!;
  move(span);expect(ring.getAttribute('data-tone')).toBe('light');expect(ring.getAttribute('data-interactive')).toBe('true');expect(ring.textContent).toBe('↗');
  button.style.backgroundColor='rgb(249,213,72)';move(button);expect(ring.getAttribute('data-tone')).toBe('dark');
  await act(async()=>root.unmount());expect(frames.size).toBe(0);expect(listeners.size).toBe(0);expect(document.body.classList.contains('pointer-active')).toBe(false);
  move(document.body);expect(frames.size).toBe(0);expect(document.body.classList.contains('pointer-active')).toBe(false);
});
it('turns off immediately for touch and dynamic reduced-motion preferences',async()=>{
  await act(async()=>root.render(<><CustomCursor/><button>Action</button></>));
  const button=mount.querySelector('button')!;move(button);expect(document.body.classList.contains('pointer-active')).toBe(true);
  move(button,'touch');expect(document.body.classList.contains('pointer-active')).toBe(false);
  move(button);await act(async()=>{reduced=true;listeners.forEach(listener=>listener());});expect(frames.size).toBe(0);expect(document.body.classList.contains('pointer-active')).toBe(false);
  move(button);expect(document.body.classList.contains('pointer-active')).toBe(false);
});
