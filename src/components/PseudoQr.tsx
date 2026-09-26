import { useMemo } from "react";
import { prng } from "@/lib/prng";

/** Deterministic, decorative QR-like pattern derived from a string. Not a scannable QR code. */
const N = 25;

function inFinder(x: number, y: number) {
  const zones = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ];
  return zones.some(([zx, zy]) => x >= zx - 1 && x <= zx + 7 && y >= zy - 1 && y <= zy + 7);
}

export function PseudoQr({ value, size = 180, dim = false }: { value: string; size?: number; dim?: boolean }) {
  const cells = useMemo(() => {
    const rand = prng(value);
    const out: [number, number][] = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rand() > 0.52) out.push([x, y]);
    return out;
  }, [value]);

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#0b1220" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#0b1220" />
    </g>
  );

  return (
    <svg
      viewBox={`-2 -2 ${N + 4} ${N + 4}`}
      width={size}
      height={size}
      role="img"
      aria-label="Illustrative ticket credential pattern"
      style={{ opacity: dim ? 0.35 : 1, transition: "opacity 300ms" }}
      shapeRendering="crispEdges"
    >
      <rect x={-2} y={-2} width={N + 4} height={N + 4} rx={1.5} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0b1220" />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}
