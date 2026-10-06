import type { ISourceOptions } from '@tsparticles/engine';
export function particleOptions(dark: boolean, tablet: boolean, finePointer: boolean): ISourceOptions {
  const neutral = dark ? '#deded7' : '#393b39', gold = '#c6a647';
  const group = (count: number, shape = 'circle', color = neutral, size: number | { min: number; max: number } = { min: .55, max: 1 }) => ({
    number: { value: count, density: { enable: false } }, shape: { type: shape }, paint: { color: { value: color } }, size: { value: size },
  });
  return {
    fullScreen: { enable: false }, fpsLimit: 60, detectRetina: true, pauseOnBlur: true, pauseOnOutsideViewport: true, resize: { enable: true, delay: .2 },
    particles: {
      number: { value: tablet ? 17 : 33, density: { enable: false } }, paint: { color: { value: neutral } },
      opacity: { value: { min: .08, max: .18 } }, size: { value: { min: .55, max: 1 } },
      move: { enable: true, speed: { min: .025, max: .075 }, direction: 'none', outModes: 'out' },
      groups: { neutral: group(tablet ? 13 : 26), gold: group(tablet ? 1 : 3, 'circle', gold), plus: group(tablet ? 1 : 2, 'birdex-plus', neutral, 2.5), egg: group(1, 'birdex-egg', neutral, 3.5), crown: group(1, 'birdex-crown', gold, 4) },
    },
    interactivity: {
      detectsOn: 'window', events: { onHover: { enable: finePointer, mode: 'repulse' }, onClick: { enable: false } },
      modes: { repulse: { distance: 150, speed: .12, factor: 1, maxSpeed: .18, easing: 'ease-out-quad', restore: { enable: true, delay: .15, speed: .018, follow: true } } },
    },
  };
}
