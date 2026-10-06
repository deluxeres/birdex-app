import { describe, it, expect, vi } from 'vitest';
import { contrastTone, parseColor, cursorIntent, surfaceTone } from './cursorState';
import { particleOptions } from './particleOptions';
describe('cursor contrast',()=>{
  it('uses light on black and dark on white and BIRDEX yellow',()=>{expect(contrastTone({r:17,g:18,b:20})).toBe('light');expect(contrastTone({r:249,g:213,b:72})).toBe('dark');expect(contrastTone({r:247,g:247,b:244})).toBe('dark');});
  it('supports explicit tone and action labels',()=>{expect(cursorIntent('dark').tone).toBe('dark');expect(cursorIntent('light').tone).toBe('light');expect(cursorIntent('open').label).toBe('↗');expect(cursorIntent('view').label).toBe('VIEW');expect(cursorIntent('invalid').label).toBe('');});
  it('parses computed transparent and color-mix backgrounds',()=>{expect(parseColor('rgba(255, 255, 255, 0.5)').a).toBe(.5);expect(parseColor('color(srgb 0.1 0.2 0.3 / 0.8)')).toEqual({r:25.5,g:51,b:76.5,a:.8});});
  it('resolves transparent children over a dark button',()=>{const button={parentElement:null,color:'color(srgb 0.125882 0.121569 0.0956863)'},span={parentElement:button,color:'rgba(0, 0, 0, 0)'};vi.stubGlobal('getComputedStyle',(element:{color:string})=>({backgroundColor:element.color}));expect(surfaceTone(span as unknown as Element)).toBe('light');vi.unstubAllGlobals();});
});
describe('bounded particle budgets',()=>{
  it('limits count and gold proportion on desktop and tablet',()=>{for(const tablet of [false,true]){const options=particleOptions(false,tablet,true);const groups=options.particles!.groups!;const counts=Object.values(groups).map(g=>g!.number!.value as number);const total=counts.reduce((a,b)=>a+b,0);expect(total).toBe(tablet?17:33);expect(((groups.gold!.number!.value as number)+1)/total).toBeLessThanOrEqual(.15);}});
  it('disables repulsion on touch input',()=>{const options=particleOptions(true,true,false);expect((options.interactivity as {events:{onHover:{enable:boolean}}}).events.onHover.enable).toBe(false);});
});
