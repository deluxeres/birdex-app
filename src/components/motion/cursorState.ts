export type CursorTone = 'dark' | 'light';
type Color = { r: number; g: number; b: number; a: number };
export function parseColor(value: string): Color {
  const values = value.match(/[\d.]+/g)?.map(Number) || [];
  if (value.startsWith('color(srgb')) return { r: values[0] * 255, g: values[1] * 255, b: values[2] * 255, a: values[3] ?? 1 };
  if (value.startsWith('rgb')) return { r: values[0], g: values[1], b: values[2], a: values[3] ?? 1 };
  return { r: 0, g: 0, b: 0, a: 0 };
}
export function contrastTone(color: Pick<Color, 'r' | 'g' | 'b'>): CursorTone {
  const linear = [color.r, color.g, color.b].map(channel => { const s = channel / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? 'dark' : 'light';
}
export function cursorIntent(value?: string | null) {
  const normalized = value?.toLowerCase();
  return { tone: normalized === 'dark' || normalized === 'light' ? normalized as CursorTone : undefined, label: normalized === 'open' || normalized === '↗' ? '↗' : normalized === 'view' ? 'VIEW' : '' };
}
export function surfaceTone(element: Element): CursorTone {
  let result: Color = { r: 0, g: 0, b: 0, a: 0 }, current: Element | null = element;
  while (current && result.a < .99) {
    const color = parseColor(getComputedStyle(current).backgroundColor), contribution = color.a * (1 - result.a);
    result = { r: result.r + color.r * contribution, g: result.g + color.g * contribution, b: result.b + color.b * contribution, a: result.a + contribution };
    current = current.parentElement;
  }
  return contrastTone(result.a ? { r: result.r / result.a, g: result.g / result.a, b: result.b / result.a } : { r: 247, g: 247, b: 244 });
}
