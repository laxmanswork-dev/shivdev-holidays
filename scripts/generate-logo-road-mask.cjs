/**
 * Generates public/images/brand/logo-road-mask.png — the "road map" used by
 * the first-visit intro (src/components/intro/IntroOverlay.jsx) to animate
 * ONLY the black road inside the logo.
 *
 * The map is 480×480, 8-bit grayscale, the same size as the logo:
 *   0      = not part of the road (blue swooshes, car, background)
 *   1–255  = where that pixel of the road sits along its S-curve, measured
 *            from the end nearest the car (1) to the far tip (255)
 *
 * How it's made:
 *  1. Road pixels = the big connected region of near-black pixels, minus the
 *     car (a hand-traced silhouette, CAR_OUTLINE below, in 2× coordinates —
 *     the car's tyres and windows are also near-black and touch the road),
 *     plus the white lane dashes (holes enclosed by the road), plus a
 *     1-pixel ring for the anti-aliased edge.
 *  2. Each road pixel gets its walking distance from the car-end of the road,
 *     measured through a slightly "closed" copy of the road so the thin cyan
 *     speed streaks under the car can't cut it in two.
 *
 * Re-run this whenever public/images/brand/shivdev-holidays-logo.png
 * changes (and re-check CAR_OUTLINE / the seed rule below):
 *
 *   npm install --no-save ffmpeg-static     # a one-off tool, not a dependency
 *   node scripts/generate-logo-road-mask.cjs
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const FF = require('ffmpeg-static');
const ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(ROOT, 'public/images/brand/shivdev-holidays-logo.png');
const OUT = path.join(ROOT, 'public/images/brand/logo-road-mask.png');
const W = 480;
const H = 480;
const N = W * H;
const CLOSE_RADIUS = 4;

// Hand-traced car silhouette, in 2× logo coordinates (x, y).
const CAR_OUTLINE = [
  [96, 604], [110, 552], [140, 530], [200, 506], [262, 486], [300, 470], [338, 460], [372, 470],
  [410, 480], [470, 489], [520, 501], [548, 510], [570, 525], [588, 543], [600, 557], [610, 569],
  [622, 583], [630, 603], [633, 640], [629, 664], [618, 678], [600, 680], [560, 668], [500, 668],
  [478, 704], [458, 738], [398, 740], [382, 704], [330, 698], [250, 690], [130, 680],
];

const tmp = path.join(require('os').tmpdir(), 'logo-road.rgba');
cp.execFileSync(FF, ['-y', '-v', 'error', '-i', LOGO, '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgba', tmp]);
const d = fs.readFileSync(tmp);
const at = (x, y) => y * W + x;

// 1a. near-black pixels, and their largest connected region
const dark = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], a = d[i * 4 + 3];
  const l = (r * 299 + g * 587 + b * 114) / 1000;
  if (a > 200 && l < 75 && Math.max(r, g, b) - Math.min(r, g, b) < 60) dark[i] = 1;
}
const label = new Int32Array(N).fill(-1);
const sizes = [];
for (let s = 0; s < N; s++) {
  if (!dark[s] || label[s] >= 0) continue;
  const id = sizes.length;
  let n = 0;
  const stack = [s];
  label[s] = id;
  while (stack.length) {
    const p = stack.pop();
    n++;
    const x = p % W, y = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = at(nx, ny);
      if (dark[q] && label[q] < 0) { label[q] = id; stack.push(q); }
    }
  }
  sizes.push(n);
}
const biggest = sizes.indexOf(Math.max(...sizes));

// 1b. car silhouette
const poly = CAR_OUTLINE.map(([x, y]) => [x / 2, y / 2]);
const inPoly = (x, y) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const car = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inPoly(x + 0.5, y + 0.5)) car[at(x, y)] = 1;

// 1c. road, plus the enclosed lane dashes, plus a 1px anti-aliased ring
const road0 = new Uint8Array(N);
for (let i = 0; i < N; i++) if (label[i] === biggest && !car[i]) road0[i] = 1;
const outside = new Uint8Array(N);
const st = [];
const seed = (p) => { if (!road0[p] && !outside[p]) { outside[p] = 1; st.push(p); } };
for (let x = 0; x < W; x++) { seed(at(x, 0)); seed(at(x, H - 1)); }
for (let y = 0; y < H; y++) { seed(at(0, y)); seed(at(W - 1, y)); }
while (st.length) {
  const p = st.pop();
  const x = p % W, y = (p / W) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const q = at(nx, ny);
    if (!road0[q] && !outside[q]) { outside[q] = 1; st.push(q); }
  }
}
const road1 = new Uint8Array(N);
for (let i = 0; i < N; i++) if (road0[i] || (!outside[i] && !car[i])) road1[i] = 1;
const M = new Uint8Array(N);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = at(x, y);
    if (car[p]) continue;
    let hit = road1[p];
    for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && road1[at(nx, ny)]) { hit = 1; break; }
    }
    if (hit && d[p * 4 + 3] > 20) M[p] = 1;
  }
}

// 2. distance along the road, through a closed copy (car still cut out)
const morph = (src, grow) => {
  let cur = src;
  for (let k = 0; k < CLOSE_RADIUS; k++) {
    const next = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = grow ? 0 : 1;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy;
        const o = X < 0 || Y < 0 || X >= W || Y >= H ? 0 : cur[Y * W + X];
        if (grow) { if (o) v = 1; } else if (!o) v = 0;
      }
      next[y * W + x] = v;
    }
    cur = next;
  }
  return cur;
};
const C = morph(morph(M, true), false);
for (let i = 0; i < N; i++) { if (car[i]) C[i] = 0; if (M[i]) C[i] = 1; }

let minX = Infinity;
for (let y = 340; y < H; y++) for (let x = 0; x < W; x++) if (M[at(x, y)] && x < minX) minX = x;
const dist = new Int32Array(N).fill(-1);
const buckets = [];
const push = (p, dd) => (buckets[dd] || (buckets[dd] = [])).push(p);
for (let y = 340; y < H; y++) for (let x = 0; x <= minX + 3; x++) if (M[at(x, y)]) { dist[at(x, y)] = 0; push(at(x, y), 0); }
const done = new Uint8Array(N);
for (let dd = 0; dd < buckets.length; dd++) {
  const b = buckets[dd];
  if (!b) continue;
  for (let k = 0; k < b.length; k++) {
    const p = b[k];
    if (done[p] || dist[p] !== dd) continue;
    done[p] = 1;
    const x = p % W, y = (p / W) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = at(nx, ny);
      if (!C[q]) continue;
      const nd = dd + (dx && dy ? 14 : 10);
      if (dist[q] < 0 || nd < dist[q]) { dist[q] = nd; push(q, nd); }
    }
  }
}
let maxDist = 0;
for (let i = 0; i < N; i++) if (M[i] && dist[i] > maxDist) maxDist = dist[i];

const mask = Buffer.alloc(N);
let kept = 0;
for (let i = 0; i < N; i++) if (M[i] && dist[i] >= 0) { mask[i] = 1 + Math.round((dist[i] / maxDist) * 254); kept++; }

const rawOut = path.join(require('os').tmpdir(), 'logo-road-mask.gray');
fs.writeFileSync(rawOut, mask);
cp.execFileSync(FF, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${W}x${H}`, '-i', rawOut, '-compression_level', '9', OUT]);
console.log(`road pixels: ${kept} of ${N}; wrote ${path.relative(ROOT, OUT)} (${fs.statSync(OUT).size} bytes)`);
