/** Nota entre 1 y 10 alineada a medios puntos (1, 1.5, …, 10). */
export function clampScoreToHalfSteps(score: number): number {
  const n = Number(score);
  if (!Number.isFinite(n)) return 7;
  const c = Math.max(1, Math.min(10, n));
  return Math.round(c * 2) / 2;
}

/** Texto para mostrar una nota o promedio (una decimal si hace falta). */
export function formatScoreDisplay(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
