import type { OfficeScene } from './office/scene';

const LABELS = ['Fragmented', 'Aligned', 'Leadership', 'Performance'];

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The hero's scroll story. Stage text blocks scroll past a sticky 3D scene; the scene's state s ∈ [0, 3]
 * is interpolated between the centres of the four stage blocks, so text and scene are always in step.
 * On phones the scene pins full screen instead, the stage captions stack in a panel under it, and s follows
 * the scroll through that pinned stretch (each stage holds, then morphs into the next).
 * Three.js is loaded lazily, paused when the hero is off screen, and replaced by a static SVG without WebGL.
 */
export function mountHero(section: HTMLElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stacked = window.matchMedia('(max-width: 900px)');
  const compact = stacked.matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sceneEl = section.querySelector<HTMLElement>('[data-scene]');
  const mountEl = section.querySelector<HTMLElement>('[data-scene-mount]');
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-hero-step]'));
  const hudNum = section.querySelector<HTMLElement>('[data-hud-num]');
  const hudName = section.querySelector<HTMLElement>('[data-hud-name]');
  const hudSteps = Array.from(section.querySelectorAll<HTMLElement>('[data-hud-step]'));
  const cursor = section.querySelector<HTMLElement>('[data-scene-cursor]');
  if (!sceneEl || !mountEl) return () => {};

  let office: OfficeScene | null = null;
  let disposed = false;
  let visible = true;
  let sv = 0;
  let anchors: number[] = [];
  let pin = [0, 1];
  let lastStage = -1;
  let lastActive = -1;

  const measure = () => {
    if (stacked.matches) {
      const top = parseFloat(getComputedStyle(sceneEl).top) || 0;
      const introBottom = steps[0].getBoundingClientRect().bottom + window.scrollY;
      const sectionBottom = section.getBoundingClientRect().bottom + window.scrollY;
      pin = [introBottom - top, Math.max(introBottom - top + 1, sectionBottom - top - sceneEl.offsetHeight)];
      return;
    }
    anchors = steps.slice(1).map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  };

  const update = () => {
    const pinned = stacked.matches;
    if (!pinned && anchors.length < 4) return;
    const focus = window.innerHeight * 0.5; // the reading line
    sv = 0;
    if (pinned) {
      const u = Math.min(1, Math.max(0, (window.scrollY - pin[0]) / (pin[1] - pin[0]))) * 4;
      const i = Math.min(3, Math.floor(u));
      const f = Math.min(1, Math.max(0, (u - i - 0.3) / 0.7));
      sv = i === 3 ? 3 : i + f * f * (3 - 2 * f);
    } else {
      const y = window.scrollY + focus;
      if (y >= anchors[3]) sv = 3;
      else if (y > anchors[0]) {
        for (let i = 0; i < 3; i++) {
          if (y < anchors[i + 1]) {
            sv = i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
            break;
          }
        }
      }
    }
    office?.setStage(sv);
    section.style.setProperty('--hero-s', sv.toFixed(3));

    const stage = Math.min(3, Math.round(sv));
    if (stage !== lastStage) {
      lastStage = stage;
      if (hudNum) hudNum.textContent = `0${stage + 1}`;
      if (hudName) hudName.textContent = LABELS[stage];
      hudSteps.forEach((el, i) => el.classList.toggle('is-on', i <= stage));
      sceneEl.classList.toggle('is-moving', sv > 0.35);
    }

    // The text block nearest the viewport centre is the active one (pinned: the caption for the current stage).
    let active = pinned ? stage + 1 : 0;
    let best = Infinity;
    if (!pinned) steps.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - focus);
      if (d < best) {
        best = d;
        active = i;
      }
    });
    if (active !== lastActive) {
      lastActive = active;
      steps.forEach((el, i) => el.classList.toggle('is-active', i === active));
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };
  const onResize = () => {
    measure();
    update();
  };

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  // Fonts and images can shift the layout after first paint.
  const ro = new ResizeObserver(onResize);
  ro.observe(section);

  /* Load the scene once the main thread is free. */
  const fail = () => sceneEl.classList.add('is-fallback');
  const load = () => {
    if (disposed) return;
    if (!hasWebGL()) return fail();
    import('./office/scene')
      .then(({ createOffice }) => {
        if (disposed) return;
        try {
          office = createOffice(mountEl, {
            reduced,
            compact,
            onReady: () => sceneEl.classList.add('is-ready'),
          });
          office.setStage(sv);
          office.setActive(visible && !document.hidden);
        } catch {
          fail();
        }
      })
      .catch(fail);
  };
  let cancelLoad: () => void;
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(load, { timeout: 600 });
    cancelLoad = () => window.cancelIdleCallback(id);
  } else {
    const id = setTimeout(load, 120);
    cancelLoad = () => clearTimeout(id);
  }

  /* Pause when off screen or in a background tab. */
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    office?.setActive(visible && !document.hidden);
  });
  io.observe(section);
  const onVisibility = () => office?.setActive(visible && !document.hidden);
  document.addEventListener('visibilitychange', onVisibility);

  /* Gentle parallax, and a cursor label that invites the scroll. */
  const onPointer = (e: PointerEvent) => {
    const r = sceneEl.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    office?.setPointer(nx, ny);
    if (cursor && fine && !reduced) {
      cursor.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
    }
  };
  const onEnter = () => fine && !reduced && sceneEl.classList.add('has-cursor');
  const onLeave = () => {
    sceneEl.classList.remove('has-cursor');
    office?.setPointer(0, 0);
  };
  sceneEl.addEventListener('pointermove', onPointer);
  sceneEl.addEventListener('pointerenter', onEnter);
  sceneEl.addEventListener('pointerleave', onLeave);

  return () => {
    disposed = true;
    cancelLoad();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    sceneEl.removeEventListener('pointermove', onPointer);
    sceneEl.removeEventListener('pointerenter', onEnter);
    sceneEl.removeEventListener('pointerleave', onLeave);
    sceneEl.classList.remove('is-ready', 'is-fallback', 'has-cursor', 'is-moving');
    office?.dispose();
    office = null;
  };
}
