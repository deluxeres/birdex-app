// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { BirdexLogo } from './BirdexLogo';

let root:Root, mount:HTMLDivElement, reduced:boolean, fine:boolean;
let queries:Map<string, Set<()=>void>>, baseline:number;
const children = () => gsap.globalTimeline.getChildren(true,true,true).length;
function Location(){ return <output>{useLocation().pathname}</output>; }
beforeEach(()=>{
  reduced=false; fine=true; queries=new Map(); baseline=children();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  vi.stubGlobal('matchMedia',(query:string)=>{
    const listeners=new Set<()=>void>(); queries.set(query,listeners);
    return {get matches(){return query.includes('reduced-motion')?reduced:fine;},addEventListener:(_event:string,fn:()=>void)=>listeners.add(fn),removeEventListener:(_event:string,fn:()=>void)=>listeners.delete(fn)};
  });
  mount=document.createElement('div'); document.body.append(mount); root=createRoot(mount);
});
afterEach(async()=>{ await act(async()=>root.unmount()); mount.remove(); vi.unstubAllGlobals(); });
const render = async () => act(async()=>root.render(<MemoryRouter initialEntries={['/season']}><BirdexLogo/><Location/></MemoryRouter>));

it('keeps keyboard navigation immediate and exposes one accessible Home link',async()=>{
  reduced=true; await render();
  const logo=mount.querySelector('a')!;
  expect(logo.getAttribute('aria-label')).toBe('BIRDEX — Home');
  expect(mount.querySelectorAll('[data-logo-part]')).toHaveLength(4);
  expect(children()).toBe(baseline);
  await act(async()=>logo.click());
  expect(mount.querySelector('output')!.textContent).toBe('/');
  expect(children()).toBe(baseline);
});
it('cleans animations and listeners when reduced motion changes or the logo unmounts',async()=>{
  await render(); expect(children()).toBeGreaterThan(baseline);
  await act(async()=>{reduced=true; queries.get('(prefers-reduced-motion: reduce)')!.forEach(fn=>fn());});
  expect(children()).toBe(baseline);
  await act(async()=>{reduced=false; queries.get('(prefers-reduced-motion: reduce)')!.forEach(fn=>fn());});
  expect(children()).toBeGreaterThan(baseline);
  await act(async()=>root.unmount());
  expect(children()).toBe(baseline);
  expect([...queries.values()].every(listeners=>listeners.size===0)).toBe(true);
});
it('ignores touch pointer tracking and never animates the wordmark',async()=>{
  await render();
  const logo=mount.querySelector('a')!, track=mount.querySelector('.birdex-mascot>.logo-transform>.logo-transform')!;
  logo.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'touch'}));
  logo.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',clientX:200,clientY:100}));
  expect(gsap.getProperty(track,'x')).toBe(0);
  expect(gsap.getProperty(track,'scaleX')).toBe(1);
  expect(gsap.getTweensOf(mount.querySelector('.birdex-wordmark')!)).toHaveLength(0);
});
it('smoothly follows a mouse within the specified bounds and returns to rest',async()=>{
  await render();
  const logo=mount.querySelector('a')!, track=mount.querySelector('.birdex-mascot>.logo-transform>.logo-transform')!;
  vi.spyOn(logo,'getBoundingClientRect').mockReturnValue(new DOMRect(0,0,150,44));
  logo.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));
  logo.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:150,clientY:44}));
  gsap.getTweensOf(track).forEach(tween=>tween.progress(1));
  expect(Number(gsap.getProperty(track,'x'))).toBeCloseTo(2.5);
  expect(Number(gsap.getProperty(track,'rotation'))).toBeCloseTo(3);
  expect(Number(gsap.getProperty(track,'scaleX'))).toBeCloseTo(1.04);
  logo.dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));
  gsap.getTweensOf(track).forEach(tween=>tween.progress(1));
  expect(Number(gsap.getProperty(track,'x'))).toBe(0);
  expect(Number(gsap.getProperty(track,'rotation'))).toBe(0);
});
it('reacts on a rapid fifth click with a vector egg while navigation stays immediate',async()=>{
  await render();
  const logo=mount.querySelector('a')!, egg=mount.querySelector('.logo-golden-egg')!;
  await act(async()=>{for(let i=0;i<5;i++)logo.click();});
  expect(mount.querySelector('output')!.textContent).toBe('/');
  expect(gsap.getTweensOf(egg).length).toBeGreaterThan(0);
  expect(egg.tagName.toLowerCase()).toBe('svg');
});
