/**
 * Generates the hero's 一 — the first stroke — at poster scale.
 *
 * The mark is not decoration: the hero photograph is masked to this silhouette,
 * so the shape has to behave like real ink. A pressed head where the brush
 * lands, a belly that thins as it travels and rises a few degrees, and a dry
 * tail that breaks into bristle ribbons as the ink runs out. The ribbons are
 * holes punched in the same path with `fill-rule="evenodd"`, so one path
 * carries the whole mark and CSS can use the file directly as a mask-image.
 *
 *   npx tsx scripts/gen-hero-stroke.ts
 *
 * Writes public/brand/hero-stroke.svg (wide, >=768px) and
 * public/brand/hero-stroke-sm.svg (short and thick, phones).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

/* ------------------------------------------------------------------ */
/* A proof sheet. Rasterises the rings with the same even-odd rule the  */
/* browser will use, so the mark can be judged without opening one.     */
/* ------------------------------------------------------------------ */
function crc32(buf: Buffer) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function png(gray: Uint8Array, w: number, h: number) {
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w + 1)] = 0;
    raw.set(gray.subarray(y * w, (y + 1) * w), y * (w + 1) + 1);
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // greyscale
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Even-odd scanline fill with 3x vertical supersampling, ink on paper. */
function proof(rings: { x: number; y: number }[][], vbW: number, vbH: number, w: number, h: number) {
  const SS = 3;
  const acc = new Float32Array(w * h);
  const sx = w / vbW;
  const sy = h / vbH;
  for (let py = 0; py < h * SS; py++) {
    const yy = (py + 0.5) / SS / sy;
    const xs: number[] = [];
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        if (a.y === b.y) continue;
        if (yy >= Math.min(a.y, b.y) && yy < Math.max(a.y, b.y)) {
          xs.push(a.x + ((yy - a.y) / (b.y - a.y)) * (b.x - a.x));
        }
      }
    }
    xs.sort((p, q) => p - q);
    const row = Math.floor(py / SS);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.max(0, Math.round(xs[i] * sx));
      const x1 = Math.min(w, Math.round(xs[i + 1] * sx));
      for (let x = x0; x < x1; x++) acc[row * w + x] += 1 / SS;
    }
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) {
    const ink = Math.min(1, acc[i]);
    out[i] = Math.round(243 * (1 - ink) + 21 * ink); // paper -> ink
  }
  return png(out, w, h);
}

type Pt = { x: number; y: number };
type Knot = [t: number, halfWidth: number];
type Gap = {
  /** Where the split opens and closes along the stroke. */
  t0: number;
  t1: number;
  /** Lateral drift, as a fraction of the local half-width. */
  u0: number;
  u1: number;
  /** Half-thickness of the ribbon of paper, in viewBox units. */
  w: number;
  /** Where along its own span the gap is widest. */
  peak: number;
};

type Config = {
  file: string;
  W: number;
  H: number;
  /** Centreline: from (x0,y0) to (x1,y1); `sag` bows it downward at the middle. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  sag: number;
  wobble: { amp: number; freq: number; phase: number }[];
  widths: Knot[];
  /** Where the ink starts to run dry and the edge goes ragged. */
  dry: number;
  gaps: Gap[];
  /** How far the head bulges back past the start of the centreline. */
  headBulge: number;
  samples: number;
  gapSamples: number;
  seed: number;
  /**
   * Erode every edge by this many units. The eroded silhouette is used to mask
   * the photograph, so the un-eroded mark shows through as a vermilion keyline
   * around the whole gesture — and the bristle traces too thin to survive the
   * erosion stay pure pigment, which is what a brush running dry actually does.
   */
  rim?: number;
  /** Proof-sheet sizes in px, written next to the SVG. */
  proofs?: [number, number][];
};

/* ------------------------------------------------------------------ */
/* Deterministic value noise — the mark must be identical every build. */
/* ------------------------------------------------------------------ */
function makeNoise(seed: number) {
  let s = (seed >>> 0) || 1;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const table = Array.from({ length: 512 }, rnd);
  return (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[((i % 512) + 512) % 512];
    const b = table[(((i + 1) % 512) + 512) % 512];
    const t = f * f * (3 - 2 * f);
    return (a + (b - a) * t) * 2 - 1; // -1..1
  };
}

/* Monotone cubic Hermite (Fritsch–Carlson): smooth, and it never overshoots,
   so the belly can never swell wider than the pressed head. */
function monotoneSpline(knots: Knot[]) {
  const xs = knots.map((k) => k[0]);
  const ys = knots.map((k) => k[1]);
  const n = xs.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i]);
    slope.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  }
  const m = new Array<number>(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = n - 2;
    for (let k = 0; k < n - 1; k++) if (x < xs[k + 1]) { i = k; break; }
    const h = dx[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      ys[i] * (2 * t3 - 3 * t2 + 1) +
      m[i] * h * (t3 - 2 * t2 + t) +
      ys[i + 1] * (-2 * t3 + 3 * t2) +
      m[i + 1] * h * (t3 - t2)
    );
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function build(cfg: Config, frame?: { x: number; y: number; w: number; h: number }) {
  const noise = makeNoise(cfg.seed);
  const rim = cfg.rim ?? 0;
  const half = monotoneSpline(cfg.widths);

  /* Centreline. The straight run rises to the right; `sag` bows it downward at
     the middle the way a hand does; the wobbles keep it off a mathematical arc. */
  const centre = (t: number): Pt => {
    let y = cfg.y0 + (cfg.y1 - cfg.y0) * t + cfg.sag * Math.sin(Math.PI * t);
    for (const w of cfg.wobble) y += w.amp * Math.sin(Math.PI * w.freq * t + w.phase);
    return { x: cfg.x0 + (cfg.x1 - cfg.x0) * t, y };
  };

  /* Unit normal, pointing down-page. */
  const normal = (t: number): Pt => {
    const e = 1e-4;
    const a = centre(Math.max(0, t - e));
    const b = centre(Math.min(1, t + e));
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len };
  };

  /* Edge of the ink. `side` -1 is the top, +1 the bottom; each gets its own
     ripple so the stroke is never mirror-symmetric. Past `dry` the edge takes
     sharp notches — the bristles are losing contact with the paper. */
  const edge = (t: number, side: -1 | 1) => {
    const base = half(t);
    const ripple = base * 0.045 * noise(t * 6.3 + (side < 0 ? 0 : 41.7));
    const dryness = smoothstep(cfg.dry, 1, t);
    const notchPhase = t * (side < 0 ? 8.9 : 7.4) + (side < 0 ? 0.31 : 1.77);
    const notch =
      dryness * base * 0.24 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * notchPhase)), 6);
    return Math.max(0.5, base * 0.28, base + ripple - notch - rim);
  };

  const at = (t: number, side: -1 | 1): Pt => {
    const c = centre(t);
    const n = normal(t);
    const d = edge(t, side) * side;
    return { x: c.x + n.x * d, y: c.y + n.y * d };
  };

  /* ---- outer outline: forward along the bottom, back along the top ---- */
  const N = cfg.samples;
  const bottom: Pt[] = [];
  const top: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    bottom.push(at(t, 1));
    top.push(at(t, -1));
  }

  /* Head cap: the brush lands heel first, so the cap bulges back and leans,
     rather than closing as a flat butt. */
  const headCap: Pt[] = [];
  {
    const A = top[0];
    const B = bottom[0];
    const c = centre(0);
    const n = normal(0);
    const e = 1e-4;
    const b = centre(e);
    const tx = (b.x - c.x) / Math.hypot(b.x - c.x, b.y - c.y);
    const ty = (b.y - c.y) / Math.hypot(b.x - c.x, b.y - c.y);
    /* 起筆 — the brush lands travelling down and to the right, so the head is
       not a round cap: the top-left is a short angled facet, the leftmost point
       sits below the centreline, and the bottom-left rolls off. Walk A -> B,
       because the outline arrives along the top edge and has to come back down
       the front of the head before closing on bottom[0]. */
    const back = (d: number, off: number): Pt => ({
      x: c.x - tx * d + n.x * off,
      y: c.y - ty * d + n.y * off,
    });
    const bulge = Math.max(0, cfg.headBulge - rim);
    const h0 = Math.max(1, half(0) - rim);
    const knotsCap: Pt[] = [
      A,
      back(bulge * 0.55, -h0 * 0.86),
      back(bulge * 1.5, -h0 * 0.18),
      back(bulge * 1.42, h0 * 0.55),
      back(bulge * 0.72, h0 * 0.94),
      B,
    ];
    // Catmull-Rom through the facets: organic, but the corners survive
    for (let k = 0; k < knotsCap.length - 1; k++) {
      const p0 = knotsCap[Math.max(0, k - 1)];
      const p1 = knotsCap[k];
      const p2 = knotsCap[k + 1];
      const p3 = knotsCap[Math.min(knotsCap.length - 1, k + 2)];
      for (let i = 1; i <= 4; i++) {
        const s = i / 4;
        const s2 = s * s;
        const s3 = s2 * s;
        const spline = (a: number, b2: number, cc: number, d2: number) =>
          0.5 * (2 * b2 + (cc - a) * s + (2 * a - 5 * b2 + 4 * cc - d2) * s2 + (-a + 3 * b2 - 3 * cc + d2) * s3);
        headCap.push({
          x: spline(p0.x, p1.x, p2.x, p3.x),
          y: spline(p0.y, p1.y, p2.y, p3.y),
        });
      }
    }
    headCap.pop(); // the last point is bottom[0]; the ring closes on it
  }

  const outer = [...bottom, ...top.slice().reverse(), ...headCap];

  /* ---- bristle gaps: spindles of paper inside the ink ----
     Every gap is clamped to stay strictly inside the outline. If a gap were
     allowed to cross it, the even-odd rule would flip the region outside the
     stroke to ink, and the mark would grow a shadow. */
  const gapPaths: Pt[][] = [];
  for (const g of cfg.gaps) {
    const M = cfg.gapSamples;
    const exponent = Math.log(0.5) / Math.log(g.peak);
    const side1: Pt[] = [];
    const side2: Pt[] = [];
    for (let i = 0; i <= M; i++) {
      const s = i / M;
      const t = g.t0 + (g.t1 - g.t0) * s;
      if (t > 1) break;
      const c = centre(t);
      const n = normal(t);
      const h = half(t);
      const spindle = Math.sin(Math.PI * Math.pow(s, exponent));
      // a gap that reaches the very end of the stroke stays open there
      const openEnd = g.t1 >= 0.999 ? smoothstep(0.72, 0.99, s) : 0;
      const w = g.w * Math.max(Math.pow(Math.max(0, spindle), 1.05), openEnd) + (spindle > 0.02 || openEnd > 0 ? rim : 0);
      const u = g.u0 + (g.u1 - g.u0) * s;
      let offset = u * h;
      // Keep the whole ribbon inside the ink. The clamp reads the smooth width
      // profile rather than the notched edge — clamping against the notches
      // would make the gap chatter every time one passed under it.
      const room = h * 0.9 - w - 5;
      if (Math.abs(offset) > room) offset = Math.sign(offset) * Math.max(0, room);
      side1.push({ x: c.x + n.x * (offset - w), y: c.y + n.y * (offset - w) });
      side2.push({ x: c.x + n.x * (offset + w), y: c.y + n.y * (offset + w) });
    }
    if (side1.length > 3) gapPaths.push([...side1, ...side2.reverse()]);
  }

  /* Trim the viewBox to the ink. The mask box and the visible stroke then
     coincide, so the layout can position the band against the ink itself
     instead of against invisible padding. */
  const PAD = 4;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of outer) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const box = frame ?? {
    x: Math.floor(minX - PAD),
    y: Math.floor(minY - PAD),
    w: Math.ceil(maxX - minX + PAD * 2),
    h: Math.ceil(maxY - minY + PAD * 2),
  };

  const fmt = (p: Pt) => `${(p.x - box.x).toFixed(1)},${(p.y - box.y).toFixed(1)}`;
  const ring = (pts: Pt[]) => `M${pts.map(fmt).join(" ")}Z`;
  const d = [ring(outer), ...gapPaths.map(ring)].join("");

  /* Centreline, for anything that wants to animate a pathLength wipe later. */
  const line: Pt[] = [];
  for (let i = 0; i <= 64; i++) line.push(centre(i / 64));
  const centreD = `M${line.map(fmt).join(" ")}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box.w} ${box.h}" preserveAspectRatio="none"><path fill="#fff" fill-rule="evenodd" d="${d}"/></svg>\n`;

  const out = resolve(process.cwd(), cfg.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg, "utf8");

  /* Proof sheets, at the native ratio and at the two extremes the mask will be
     stretched to in the browser. They are never shipped: pass a directory in
     HERO_PROOF_DIR to look at the mark without opening a browser. */
  const proofDir = process.env.HERO_PROOF_DIR;
  if (proofDir) {
    const rings = [outer, ...gapPaths].map((r) => r.map((p) => ({ x: p.x - box.x, y: p.y - box.y })));
    mkdirSync(proofDir, { recursive: true });
    const name = cfg.file.split("/").pop()!.replace(/\.svg$/, "");
    for (const [i, p] of (cfg.proofs ?? []).entries()) {
      writeFileSync(resolve(proofDir, `${name}.proof${i + 1}.png`), proof(rings, box.w, box.h, p[0], p[1]));
    }
  }

  /* Where the top of the ink sits inside the trimmed box, under the stretch of
     stroke the headline crosses. The layout needs this to place the seam: the
     box is trimmed to the mark's extremes, but the top edge at the left of the
     stroke lies some way below the highest point, which is out at the tail. */
  const topInset =
    [0.12, 0.2, 0.28, 0.36].reduce((acc, t) => acc + (at(t, -1).y - box.y) / box.h, 0) / 4;

  return {
    out,
    bytes: svg.length,
    points: outer.length,
    centreD,
    box,
    topInset,
    maxHalf: Math.max(...cfg.widths.map((w) => w[1])),
  };
}

/* ------------------------------------------------------------------ */
/* The wide mark — desktop and tablet.                                 */
/* ------------------------------------------------------------------ */
const WIDE: Config = {
  file: "public/brand/hero-stroke.svg",
  W: 2000,
  H: 460,
  x0: 120,
  y0: 252,
  x1: 1998,
  y1: 152,
  sag: 30,
  wobble: [
    { amp: 6.5, freq: 3.1, phase: 0.7 },
    { amp: 3.2, freq: 5.7, phase: 2.1 },
  ],
  widths: [
    [0.0, 104],
    [0.014, 152],
    [0.04, 168],
    [0.1, 160],
    [0.22, 151],
    [0.36, 142],
    [0.5, 132],
    [0.62, 122],
    [0.72, 117],
    [0.84, 101],
    [0.93, 87],
    [1.0, 74],
  ],
  /*
    The dry tail, retuned. Six ribbons opening from t=0.5 rendered on screen as
    six thin horizontal lines across the right third of the sheet — CRT scan
    lines, not a brush lifting off paper. Three splits opening at t=0.72, with
    the ragged edge starting at 0.82 instead of 0.66, read as ink running out.
    The mark no longer carries a photograph, so it does not need the extra
    ribbons to keep the plate from looking like a solid bar.
  */
  dry: 0.82,
  gaps: [
    { t0: 0.72, t1: 1.0, u0: -0.1, u1: -0.52, w: 22, peak: 0.78 },
    { t0: 0.79, t1: 1.0, u0: 0.24, u1: 0.6, w: 17, peak: 0.8 },
    { t0: 0.88, t1: 1.0, u0: -0.5, u1: -0.84, w: 10, peak: 0.82 },
  ],
  headBulge: 44,
  samples: 300,
  gapSamples: 46,
  seed: 19640617, // Kyokushin, June 1964
  proofs: [
    [1400, 250], // near native
    [1400, 180], // squeezed
    [1400, 380], // stretched
  ],
};

/* ------------------------------------------------------------------ */
/* The narrow mark — phones. Shorter, so it has to be proportionally    */
/* thicker or it reads as a rule rather than a stroke.                  */
/* ------------------------------------------------------------------ */
const NARROW: Config = {
  ...WIDE,
  file: "public/brand/hero-stroke-sm.svg",
  W: 1000,
  H: 460,
  x0: 74,
  y0: 258,
  x1: 999,
  y1: 168,
  sag: 24,
  wobble: [
    { amp: 5, freq: 3.1, phase: 0.7 },
    { amp: 2.4, freq: 5.7, phase: 2.1 },
  ],
  widths: [
    [0.0, 116],
    [0.016, 164],
    [0.045, 180],
    [0.12, 174],
    [0.3, 166],
    [0.5, 154],
    [0.66, 141],
    [0.78, 127],
    [0.88, 111],
    [1.0, 92],
  ],
  dry: 0.84,
  gaps: [
    { t0: 0.76, t1: 1.0, u0: -0.08, u1: -0.5, w: 22, peak: 0.8 },
    { t0: 0.85, t1: 1.0, u0: 0.28, u1: 0.62, w: 14, peak: 0.82 },
  ],
  headBulge: 40,
  samples: 220,
  gapSamples: 40,
  proofs: [
    [780, 290], // near native
    [780, 200], // squeezed
  ],
};

for (const cfg of [WIDE, NARROW]) {
  const outer = build(cfg);
  /* The inner silhouette has to be cut inside the outer one's frame, or the two
     masks would not sit over the same box in CSS. */
  const inner = build(
    { ...cfg, file: cfg.file.replace(/\.svg$/, "-in.svg"), rim: cfg.rim ?? 2.2, proofs: undefined },
    outer.box,
  );
  console.log(
    `${outer.out}\n  ${(outer.bytes / 1024).toFixed(1)} kB · ${outer.points} outline points · ` +
      `viewBox ${outer.box.w}x${outer.box.h} (${(outer.box.w / outer.box.h).toFixed(2)}:1) · ` +
      `max ink ${outer.maxHalf * 2} units\n` +
      `  ink top edge sits ${(outer.topInset * 100).toFixed(1)}% down the box where the headline crosses\n` +
      `${inner.out}\n  ${(inner.bytes / 1024).toFixed(1)} kB · eroded by ${cfg.rim ?? 2.2} units`,
  );
}
