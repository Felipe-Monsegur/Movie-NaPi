/** Tono HSL: 1 → rojo (~0°), 10 → verde (~120°) */
function scoreToHue(score: number): number {
  const n = Number(score);
  if (!Number.isFinite(n)) return 0;
  const clamped = Math.max(1, Math.min(10, n));
  return ((clamped - 1) / 9) * 120;
}

/** Color del dígito (nota o promedio) según tema */
export function scoreToDisplayColor(score: number, theme: 'dark' | 'light'): string {
  const hue = scoreToHue(score);
  if (theme === 'dark') {
    return `hsl(${hue}, 78%, 58%)`;
  }
  return `hsl(${hue}, 82%, 32%)`;
}

/** Fondo suave del badge alineado con la misma escala */
export function scoreToBadgeStyle(
  score: number,
  theme: 'dark' | 'light'
): { color: string; backgroundColor: string } {
  const hue = scoreToHue(score);
  const color = theme === 'dark' ? `hsl(${hue}, 78%, 58%)` : `hsl(${hue}, 82%, 32%)`;
  const backgroundColor =
    theme === 'dark' ? `hsla(${hue}, 55%, 52%, 0.22)` : `hsla(${hue}, 70%, 42%, 0.14)`;
  return { color, backgroundColor };
}
