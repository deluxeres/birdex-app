// @vitest-environment happy-dom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { ParticleBackground } from './ParticleBackground';

const engine = vi.hoisted(()=>({load:vi.fn(),getEngine:vi.fn()}));
vi.mock('./particleEngine',()=>({getParticleEngine:engine.getEngine}));
type Query = { matches:boolean; listeners:Set<()=>void> };
let root:Root, mount:HTMLDivElement;
let queries:Map<string,Query>;
let containers:{destroy:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>;play:ReturnType<typeof vi.fn>}[];
function change(query:string,matches:boolean){const item=queries.get(query)!;item.matches=matches;item.listeners.forEach(listener=>listener());}
beforeEach(()=>{
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true); queries=new Map();containers=[];
  vi.stubGlobal('matchMedia',(query:string)=>{if(!queries.has(query))queries.set(query,{matches:query.includes('pointer: fine'),listeners:new Set()});const item=queries.get(query)!;return {get matches(){return item.matches;},addEventListener:(_event:string,fn:()=>void)=>item.listeners.add(fn),removeEventListener:(_event:string,fn:()=>void)=>item.listeners.delete(fn)};});
  engine.load.mockReset().mockImplementation(async({element,options})=>{
    const canvas=document.createElement('canvas');element.appendChild(canvas);
    const container={particles:{count:options.particles.number.value},destroy:vi.fn(()=>canvas.remove()),pause:vi.fn(),play:vi.fn()};containers.push(container);return container;
  });
  engine.getEngine.mockReset().mockResolvedValue(engine);
  document.documentElement.dataset.theme='light';mount=document.createElement('div');document.body.appendChild(mount);root=createRoot(mount);
});
afterEach(async()=>{await act(async()=>root.unmount());mount.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function render(){await act(async()=>root.render(<StrictMode><ParticleBackground/></StrictMode>));}
const count=()=>mount.querySelector('.particle-background')?.getAttribute('data-particle-count');
describe('particle lifecycle',()=>{
  it('keeps one canvas through theme changes and destroys all containers on unmount',async()=>{
    await render();await vi.waitFor(()=>expect(count()).toBe('33'));
    await act(async()=>{document.documentElement.dataset.theme='dark';});
    await vi.waitFor(()=>expect(engine.load).toHaveBeenCalledTimes(2));expect(mount.querySelectorAll('canvas')).toHaveLength(1);
    expect(engine.load.mock.calls.at(-1)![0].options.particles.paint.color.value).toBe('#deded7');
    await act(async()=>root.unmount());expect(mount.querySelectorAll('canvas')).toHaveLength(0);expect(containers.every(c=>c.destroy.mock.calls.length===1)).toBe(true);
    expect([...queries.values()].every(q=>q.listeners.size===0)).toBe(true);
  });
  it('disables canvas on mobile and reduced motion, and restores a bounded tablet count',async()=>{
    await render();await vi.waitFor(()=>expect(count()).toBe('33'));
    await act(async()=>change('(max-width: 599px)',true));expect(count()).toBe('0');expect(mount.querySelector('canvas')).toBeNull();
    await act(async()=>{change('(max-width: 1024px)',true);change('(max-width: 599px)',false);});await vi.waitFor(()=>expect(count()).toBe('17'));
    await act(async()=>change('(prefers-reduced-motion: reduce)',true));expect(count()).toBe('0');expect(mount.querySelector('canvas')).toBeNull();
  });
  it('pauses on document visibility changes',async()=>{
    await render();await vi.waitFor(()=>expect(count()).toBe('33'));const hidden=vi.spyOn(document,'hidden','get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));expect(containers.at(-1)!.pause).toHaveBeenCalled();
    hidden.mockReturnValue(false);document.dispatchEvent(new Event('visibilitychange'));expect(containers.at(-1)!.play).toHaveBeenCalled();
  });
  it('does not create a canvas when delayed initialization completes after unmount',async()=>{
    let resolve!:(value:typeof engine)=>void;engine.getEngine.mockImplementation(()=>new Promise(r=>{resolve=r;}));
    await render();await vi.waitFor(()=>expect(engine.getEngine).toHaveBeenCalled());await act(async()=>root.unmount());
    resolve(engine);await act(async()=>{await Promise.resolve();});expect(engine.load).not.toHaveBeenCalled();
  });
});
