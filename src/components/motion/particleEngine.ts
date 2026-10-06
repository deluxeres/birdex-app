import { tsParticles, type Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
// SVG path geometry registered once, without images or additional plugins.
const paths = { 'birdex-plus': 'M-8 0H8M0-8V8', 'birdex-egg': 'M0-11C-4-11-8 0-8 5C-8 13 8 13 8 5C8 0 4-11 0-11Z', 'birdex-crown': 'M-11-7L-8 8H8L11-7L4 0L0-10L-4 0ZM-8 11H8' };
let initialization: Promise<Engine> | undefined;
export function getParticleEngine() {
  initialization ??= (async () => {
    await loadSlim(tsParticles);
    for (const [name, geometry] of Object.entries(paths)) {
      const path = new Path2D(geometry);
      tsParticles.pluginManager.addShape([name], async () => ({ draw: ({ context, radius, pixelRatio }) => {
        context.save(); context.scale(radius / 12, radius / 12); context.strokeStyle = context.fillStyle;
        context.lineWidth = .7 * pixelRatio * 12 / radius; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke(path); context.restore();
      } }));
    }
    return tsParticles;
  })();
  return initialization;
}
