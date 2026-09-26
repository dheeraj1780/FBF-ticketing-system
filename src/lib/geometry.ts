export interface Pt {
  x: number;
  y: number;
}

export function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

export interface Box {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export interface RoutedEdge {
  d: string;
  mid: Pt;
}

/**
 * Routes a smooth cubic edge between two boxes laid out on a grid.
 * - different columns → horizontal exit/entry
 * - same column, adjacent rows → vertical exit/entry
 * - same column, distant rows → loops out to the right to avoid overlapping intermediate nodes
 */
export function routeEdge(a: Box, b: Box, sameCol: boolean, rowGap: number): RoutedEdge {
  let p0: Pt, p1: Pt, p2: Pt, p3: Pt;

  if (!sameCol) {
    const dir = b.cx >= a.cx ? 1 : -1;
    p0 = { x: a.cx + (dir * a.w) / 2, y: a.cy };
    p3 = { x: b.cx - (dir * b.w) / 2, y: b.cy };
    const k = Math.max(28, Math.abs(p3.x - p0.x) / 2);
    p1 = { x: p0.x + dir * k, y: p0.y };
    p2 = { x: p3.x - dir * k, y: p3.y };
  } else if (Math.abs(rowGap) <= 1) {
    const dir = b.cy >= a.cy ? 1 : -1;
    p0 = { x: a.cx, y: a.cy + (dir * a.h) / 2 };
    p3 = { x: b.cx, y: b.cy - (dir * b.h) / 2 };
    const k = Math.max(16, Math.abs(p3.y - p0.y) / 2);
    p1 = { x: p0.x, y: p0.y + dir * k };
    p2 = { x: p3.x, y: p3.y - dir * k };
  } else {
    p0 = { x: a.cx + a.w / 2, y: a.cy };
    p3 = { x: b.cx + b.w / 2, y: b.cy };
    const bulge = 46 + Math.abs(rowGap) * 6;
    p1 = { x: p0.x + bulge, y: p0.y };
    p2 = { x: p3.x + bulge, y: p3.y };
  }

  return {
    d: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`,
    mid: cubicPoint(p0, p1, p2, p3, 0.5),
  };
}
