/* First-visit intro curtain (markup + CSS in src/components/IntroCurtain.tsx and src/styles/intro.css).
   Two looks, picked with the on-page toggle and remembered in localStorage:
   - "dots" (default): every dot is a person; they fly in and settle into a halftone portrait of Rohit, then
     this module cues the shared navy-wash exit (`intro-exit`), which the CSS holds paused until then.
   - "logo": the S mark draws itself; pure CSS, nothing to do here but release the scroll lock. */

const PORTRAIT_SRC = '/img/rohit-johar.png';
/* Head-and-shoulders crop of the photo (fractions of the image), so the face fills the frame. */
const CROP = { x: 0.147, y: 0.013, w: 0.707, h: 0.933 };
const FLY_MS = 2000;
const HOLD_MS = 550;
const COLORS = ['#111d32', '#4a5d80', '#aab5c8']; // ink navy, soft navy (fine dots), mist (in flight)

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Halftone portrait on a hex grid inside `rect`: one dot per cell, radius from the photo's darkness. */
function portrait(img: HTMLImageElement, rect: DOMRect, cols: number) {
  const sw = img.naturalWidth * CROP.w;
  const sh = img.naturalHeight * CROP.h;
  const rows = Math.round((cols * (sh / sw)) / 0.866);
  const off = document.createElement('canvas');
  off.width = cols;
  off.height = rows;
  const octx = off.getContext('2d', { willReadFrequently: true })!;
  octx.imageSmoothingQuality = 'high';
  octx.fillStyle = '#fff';
  octx.fillRect(0, 0, cols, rows);
  octx.drawImage(img, img.naturalWidth * CROP.x, img.naturalHeight * CROP.y, sw, sh, 0, 0, cols, rows);
  const data = octx.getImageData(0, 0, cols, rows).data;

  const cell = Math.min(rect.width / (cols + 0.5), rect.height / (rows * 0.866));
  const ox = rect.left + (rect.width - (cols + 0.5) * cell) / 2;
  const oy = rect.top + (rect.height - rows * cell * 0.866) / 2;

  const x: number[] = [];
  const y: number[] = [];
  const r: number[] = [];
  const c: number[] = [];
  for (let row = 0, i = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++, i++) {
      const p = i * 4;
      const lum = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
      // Contrast curve: skin and shirt fall to fine dots, hair, brows and eyes stay bold.
      const d = Math.pow(clamp((1 - lum - 0.1) / 0.62), 1.35);
      if (d < 0.03) continue;
      x.push(ox + (col + 0.5 + (row % 2) * 0.5) * cell);
      y.push(oy + (row + 0.5) * cell * 0.866);
      r.push(cell * 0.56 * Math.sqrt(d));
      c.push(d > 0.55 ? 0 : 1);
    }
  }
  return { x, y, r, c };
}

function mountDots(root: HTMLElement): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-intro-dots]');
  const frameEl = document.querySelector<HTMLElement>('[data-intro-portrait]');
  const ctx = canvas?.getContext('2d');
  const cue = (...cls: string[]) => root.classList.add(...cls);
  if (!canvas || !frameEl || !ctx || root.classList.contains('intro-exit')) {
    cue('intro-formed', 'intro-exit');
    return () => {};
  }

  let disposed = false;
  let raf = 0;
  const timers: number[] = [];
  const image = new Image();
  image.decoding = 'async';
  image.src = PORTRAIT_SRC;

  const start = () => {
    if (disposed) return;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const rect = frameEl.getBoundingClientRect();
    const face = portrait(image, rect, W >= 700 ? 54 : 42);
    const n = face.x.length;

    // Each person starts somewhere loose around the frame and lands on their cell.
    const rand = mulberry32(7);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const fx = new Float32Array(n);
    const fy = new Float32Array(n);
    const delay = new Float32Array(n);
    const bend = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const dist = Math.max(W, H) * (0.3 + rand() * 0.55);
      fx[i] = cx + Math.cos(a) * dist;
      fy[i] = cy + Math.sin(a) * dist * 0.75;
      delay[i] = rand() * 0.45;
      bend[i] = (rand() - 0.5) * 0.5;
    }

    const t0 = performance.now();
    const draw = (now: number) => {
      raf = 0;
      if (disposed) return;
      const t = clamp((now - t0) / FLY_MS);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let ci = 0; ci < COLORS.length; ci++) {
        ctx.fillStyle = COLORS[ci];
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const li = easeOut(clamp((t - delay[i]) / 0.55));
          if ((li < 0.6 ? 2 : face.c[i]) !== ci) continue;
          const r = face.r[i] * li;
          if (r < 0.35) continue;
          const dx = face.x[i] - fx[i];
          const dy = face.y[i] - fy[i];
          // Curve the path so people swirl in rather than slide.
          const off = Math.sin(Math.PI * li) * bend[i];
          const x = fx[i] + dx * li - dy * off;
          const y = fy[i] + dy * li + dx * off;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (t < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    timers.push(
      window.setTimeout(() => cue('intro-formed'), FLY_MS * 0.6),
      window.setTimeout(() => cue('intro-formed', 'intro-exit'), FLY_MS + HOLD_MS),
    );
  };

  image.decode().then(start, () => !disposed && cue('intro-formed', 'intro-exit'));

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
  };
}

/** Runs the intro (if the head script started one) and wires the loader toggle. Returns a cleanup function. */
export function mountIntro(): () => void {
  const root = document.documentElement;
  const cleanups: (() => void)[] = [];

  if (root.classList.contains('intro')) {
    if (root.classList.contains('loader-dots')) cleanups.push(mountDots(root));

    // Release the scroll lock the moment the paper drops behind the wash.
    let live = true;
    const unlock = () => live && root.classList.remove('intro-lock');
    const drop = document.querySelector<HTMLElement>('[data-intro-paper]')?.getAnimations?.()[0];
    if (drop) drop.finished.then(unlock, unlock);
    else unlock();
    cleanups.push(() => (live = false));
  }

  /* ── Loader toggle: remember the pick, then replay the intro from the top ── */
  const picks = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-loader-pick]'));
  const current = root.classList.contains('loader-dots') ? 'dots' : 'logo';
  picks.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.loaderPick === current)));
  const onPick = (e: Event) => {
    const pick = (e.currentTarget as HTMLButtonElement).dataset.loaderPick;
    try {
      localStorage.setItem('sv-look', pick === 'logo' ? 'logo' : 'dots');
      sessionStorage.removeItem('sv-intro');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.location.reload();
  };
  picks.forEach((b) => b.addEventListener('click', onPick));
  cleanups.push(() => picks.forEach((b) => b.removeEventListener('click', onPick)));

  return () => cleanups.reverse().forEach((fn) => fn());
}
