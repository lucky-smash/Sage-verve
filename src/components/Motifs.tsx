/* Small, purposeful SVG visual metaphors. All decorative (aria-hidden); animated in CSS and paused for reduced motion. */

export function Arrow({ className = 'arrow' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10h11m-4-4 4 4-4 4" />
    </svg>
  );
}

export function ArrowUpRight({ className = 'arrow arrow--diag' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M6 14 14 6m-7 0h7v7" />
    </svg>
  );
}

/* ── Problem motifs ─────────────────────────────────────────────── */

export function ProblemMotif({ kind }: { kind: 'overflow' | 'scatter' | 'flatline' }) {
  if (kind === 'overflow') {
    // Seven priorities, a box with room for three.
    return (
      <svg className="motif motif--overflow" viewBox="0 0 120 120" aria-hidden="true">
        <rect className="motif__frame" x="30" y="58" width="60" height="50" rx="4" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={i}
            className="motif__bar"
            x={34 + (i % 2) * 6 - (i > 4 ? 6 : 0)}
            y={96 - i * 12}
            width={46 - (i % 3) * 6}
            height="8"
            rx="2"
            style={{ ['--d' as string]: `${i * 0.18}s` }}
          />
        ))}
      </svg>
    );
  }
  if (kind === 'scatter') {
    const dots = [
      [22, 30], [58, 18], [94, 34], [36, 62], [76, 54], [102, 80], [18, 96], [54, 92], [86, 104], [64, 74], [30, 44], [98, 56],
    ];
    return (
      <svg className="motif motif--scatter" viewBox="0 0 120 120" aria-hidden="true">
        {[30, 60, 90].map((v) => (
          <g key={v} className="motif__grid">
            <line x1={v} y1="8" x2={v} y2="112" />
            <line x1="8" y1={v} x2="112" y2={v} />
          </g>
        ))}
        {dots.map(([x, y], i) => (
          <circle key={i} className="motif__dot" cx={x} cy={y} r="4" style={{ ['--d' as string]: `${(i % 5) * 0.4}s` }} />
        ))}
      </svg>
    );
  }
  return (
    <svg className="motif motif--flatline" viewBox="0 0 120 120" aria-hidden="true">
      <line className="motif__base" x1="8" y1="70" x2="112" y2="70" />
      <polyline
        className="motif__busy"
        points="8,70 16,40 24,92 32,30 40,86 48,46 56,96 64,36 72,82 80,48 88,90 96,52 104,76 112,70"
        pathLength={1}
      />
      <circle className="motif__end" cx="112" cy="70" r="4" />
    </svg>
  );
}

/* ── Approach phase motifs ───────────────────────────────────────── */

export function PhaseMotif({ kind }: { kind: 'scan' | 'grid' | 'flow' | 'rings' }) {
  if (kind === 'scan') {
    return (
      <svg className="pmotif pmotif--scan" viewBox="0 0 160 96" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => {
          const x = 14 + (i % 10) * 14.6;
          const y = 14 + Math.floor(i / 10) * 22;
          return <circle key={i} cx={x} cy={y} r={i === 23 ? 5 : 2.4} className={i === 23 ? 'pmotif__hit' : 'pmotif__dot'} />;
        })}
        <line className="pmotif__scanline" x1="0" y1="4" x2="0" y2="92" />
      </svg>
    );
  }
  if (kind === 'grid') {
    return (
      <svg className="pmotif pmotif--grid" viewBox="0 0 160 96" aria-hidden="true">
        <rect className="pmotif__box" x="8" y="8" width="64" height="36" rx="3" style={{ ['--d' as string]: '0s' }} />
        <rect className="pmotif__box" x="80" y="8" width="72" height="36" rx="3" style={{ ['--d' as string]: '.3s' }} />
        <rect className="pmotif__box" x="8" y="52" width="40" height="36" rx="3" style={{ ['--d' as string]: '.6s' }} />
        <rect className="pmotif__box pmotif__box--accent" x="56" y="52" width="96" height="36" rx="3" style={{ ['--d' as string]: '.9s' }} />
      </svg>
    );
  }
  if (kind === 'flow') {
    return (
      <svg className="pmotif pmotif--flow" viewBox="0 0 160 96" aria-hidden="true">
        <line className="pmotif__track" x1="8" y1="48" x2="152" y2="48" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} className="pmotif__chev" d="M0 34 14 48 0 62" style={{ ['--d' as string]: `${i * 0.45}s` }} />
        ))}
      </svg>
    );
  }
  return (
    <svg className="pmotif pmotif--rings" viewBox="0 0 160 96" aria-hidden="true">
      <circle className="pmotif__ring" cx="80" cy="48" r="40" />
      <circle className="pmotif__ring pmotif__ring--spin" cx="80" cy="48" r="28" />
      <circle className="pmotif__ring" cx="80" cy="48" r="16" />
      <circle className="pmotif__core" cx="80" cy="48" r="6" />
    </svg>
  );
}

/* ── Who it's for: organisation shapes ───────────────────────────── */

type Node = [number, number, number?];
type Shape = { nodes: Node[]; links: [number, number][] };

const shapes: Record<'hub' | 'tree' | 'network', Shape> = {
  hub: {
    nodes: [[200, 160, 22], [110, 90], [290, 90], [90, 210], [310, 210], [200, 270]],
    links: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
  },
  tree: (() => {
    const nodes: Node[] = [[200, 50, 16], [100, 145, 10], [200, 145, 10], [300, 145, 10]];
    const links: [number, number][] = [[0, 1], [0, 2], [0, 3]];
    [100, 200, 300].forEach((px, p) => {
      [-34, 0, 34].forEach((dx) => {
        nodes.push([px + dx, 250]);
        links.push([p + 1, nodes.length - 1]);
      });
    });
    return { nodes, links };
  })(),
  network: (() => {
    const nodes: Node[] = [[200, 160, 16]];
    const links: [number, number][] = [];
    const hubs: [number, number][] = [[95, 80], [305, 80], [95, 240], [305, 240]];
    hubs.forEach(([hx, hy]) => {
      nodes.push([hx, hy, 10]);
      const h = nodes.length - 1;
      links.push([0, h]);
      [[-44, -22], [-44, 22], [0, -42], [0, 42], [44, -22], [44, 22]].forEach(([dx, dy]) => {
        nodes.push([hx + dx * (hx < 200 ? 1 : -1), hy + dy]);
        links.push([h, nodes.length - 1]);
      });
    });
    links.push([1, 2], [3, 4], [1, 3], [2, 4]);
    return { nodes, links };
  })(),
};

export function OrgShape({ kind }: { kind: 'hub' | 'tree' | 'network' }) {
  const { nodes, links } = shapes[kind];
  return (
    <svg className={`orgshape orgshape--${kind}`} viewBox="0 0 400 320" aria-hidden="true">
      {links.map(([a, b], i) => (
        <line
          key={`l${i}`}
          className="orgshape__link"
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          pathLength={1}
          style={{ ['--i' as string]: i }}
        />
      ))}
      {nodes.map(([x, y, r], i) => (
        <circle
          key={`n${i}`}
          className={r && r >= 16 ? 'orgshape__node orgshape__node--lead' : r ? 'orgshape__node orgshape__node--mid' : 'orgshape__node'}
          cx={x}
          cy={y}
          r={r ?? 6}
          style={{ ['--i' as string]: i }}
        />
      ))}
    </svg>
  );
}

/* ── Final CTA: the connected organisation, echoing the hero ─────── */

export function ConnectedOrg() {
  const clusters: [number, number][] = [[150, 110], [650, 110], [150, 330], [650, 330]];
  const center: [number, number] = [400, 220];
  const people: { x: number; y: number; c: number }[] = [];
  clusters.forEach(([cx, cy], c) => {
    for (let r = 0; r < 3; r++)
      for (let k = 0; k < 4; k++) people.push({ x: cx - 54 + k * 36, y: cy - 30 + r * 30, c });
  });
  return (
    <svg className="connected" viewBox="0 0 800 440" aria-hidden="true">
      {clusters.map(([cx, cy], i) => (
        <path
          key={`p${i}`}
          className="connected__path"
          d={`M${cx} ${cy} Q ${(cx + center[0]) / 2} ${cy < center[1] ? cy - 60 : cy + 60} ${center[0]} ${center[1]}`}
          pathLength={1}
          style={{ ['--i' as string]: i }}
        />
      ))}
      {clusters.map(([cx, cy], i) => (
        <rect key={`z${i}`} className="connected__zone" x={cx - 80} y={cy - 52} width="160" height="104" rx="10" />
      ))}
      {people.map((p, i) => (
        <circle key={i} className="connected__person" cx={p.x} cy={p.y} r="5" style={{ ['--i' as string]: i }} />
      ))}
      <circle className="connected__hub-ring" cx={center[0]} cy={center[1]} r="34" />
      <circle className="connected__hub" cx={center[0]} cy={center[1]} r="14" />
      {clusters.map(([cx, cy], i) => (
        <circle key={`d${i}`} className="connected__pulse" r="4" style={{ ['--i' as string]: i }}>
          <animateMotion
            dur="3.2s"
            begin={`${i * 0.8}s`}
            repeatCount="indefinite"
            path={`M${cx} ${cy} Q ${(cx + center[0]) / 2} ${cy < center[1] ? cy - 60 : cy + 60} ${center[0]} ${center[1]}`}
          />
        </circle>
      ))}
    </svg>
  );
}

/* Static stand-in for the 3D hero when WebGL is unavailable. */
export function HeroFallback() {
  const tiles: [number, number, string][] = [
    [0, 0, 'a'], [1, 0, 'b'], [0, 1, 'c'], [1, 1, 'd'],
  ];
  return (
    <svg className="hero-fallback" viewBox="0 0 600 460" aria-hidden="true">
      <g transform="translate(300 90)">
        {tiles.map(([gx, gy, k]) => {
          const x = (gx - gy) * 130;
          const y = (gx + gy) * 75;
          return (
            <g key={k} transform={`translate(${x} ${y})`}>
              <path className="hf__side" d="M-120 70 0 140 0 156 -120 86Z" />
              <path className="hf__side hf__side--r" d="M0 140 120 70 120 86 0 156Z" />
              <path className={`hf__top hf__top--${k}`} d="M0 0 120 70 0 140 -120 70Z" />
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${-40 + i * 40} ${60 + (i % 2) * 18})`}>
                  <ellipse className="hf__shadow" cx="0" cy="14" rx="9" ry="4" />
                  <rect className="hf__body" x="-6" y="-14" width="12" height="26" rx="6" />
                  <circle className="hf__head" cx="0" cy="-20" r="6" />
                </g>
              ))}
            </g>
          );
        })}
        <path className="hf__link" d="M0 70 0 220M-130 145 130 145" />
      </g>
    </svg>
  );
}
