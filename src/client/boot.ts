import { mountHero } from './hero';
import { mountIntro } from './intro';

/** Wires up the page's behaviour on the server-rendered markup. Fully reversible (StrictMode-safe). */
export function boot(): () => void {
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, opts);
    cleanups.push(() => window.removeEventListener(type, fn));
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('is-booted');
  cleanups.push(() => root.classList.remove('is-booted'));

  cleanups.push(mountIntro());

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) cleanups.push(mountHero(hero));

  /* ── Header: solid once the page moves, dark while it sits over a dark section ── */
  const header = document.querySelector<HTMLElement>('[data-header]');
  const darkZones = Array.from(document.querySelectorAll<HTMLElement>('.section--dark'));
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    const probe = header.offsetHeight * 0.5;
    header.classList.toggle(
      'is-dark',
      darkZones.some((z) => {
        const r = z.getBoundingClientRect();
        return r.top <= probe && r.bottom > probe;
      }),
    );
  };
  onScrollHeader();
  on('scroll', onScrollHeader, { passive: true });

  /* ── Active section in the nav ── */
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const sections = links
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href') ?? ''))
    .filter((s): s is HTMLElement => !!s);
  const navIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => {
          if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => navIO.observe(s));
  const clearCurrent = () => {
    if (window.scrollY < window.innerHeight * 0.6) links.forEach((a) => a.removeAttribute('aria-current'));
  };
  on('scroll', clearCurrent, { passive: true });
  cleanups.push(() => navIO.disconnect());

  /* ── Mobile menu ── */
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const setMenu = (open: boolean, focusToggle = false) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    header?.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
    else if (focusToggle) toggle.focus();
  };
  const onToggle = () => setMenu(toggle?.getAttribute('aria-expanded') !== 'true');
  const onMenuClick = (e: Event) => {
    if ((e.target as HTMLElement).closest('[data-menu-link]')) setMenu(false);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  };
  const desktopMQ = window.matchMedia('(min-width: 961px)');
  const onMQ = () => desktopMQ.matches && setMenu(false);
  toggle?.addEventListener('click', onToggle);
  menu?.addEventListener('click', onMenuClick);
  document.addEventListener('keydown', onKey);
  desktopMQ.addEventListener('change', onMQ);
  cleanups.push(() => {
    toggle?.removeEventListener('click', onToggle);
    menu?.removeEventListener('click', onMenuClick);
    document.removeEventListener('keydown', onKey);
    desktopMQ.removeEventListener('change', onMQ);
    setMenu(false);
  });

  /* ── Reveal on scroll, staggered among siblings ── */
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  reveals.forEach((el) => {
    const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal')) : [];
    el.style.setProperty('--reveal-delay', `${Math.min(Math.max(siblings.indexOf(el), 0), 6) * 70}ms`);
  });
  const revealIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  reveals.forEach((el) => revealIO.observe(el));
  cleanups.push(() => {
    revealIO.disconnect();
    reveals.forEach((el) => {
      el.classList.remove('is-in');
      el.style.removeProperty('--reveal-delay');
    });
  });

  /* ── Counters ── */
  const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
  const counterRafs = new Set<number>();
  const countIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        countIO.unobserve(e.target);
        const el = e.target as HTMLElement;
        const to = Number(el.dataset.count);
        if (reduced) continue;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1500);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) counterRafs.add(requestAnimationFrame(tick));
        };
        el.textContent = '0';
        counterRafs.add(requestAnimationFrame(tick));
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => countIO.observe(el));
  cleanups.push(() => {
    countIO.disconnect();
    counterRafs.forEach(cancelAnimationFrame);
    counters.forEach((el) => (el.textContent = el.dataset.count ?? ''));
  });

  /* ── Scroll-linked lines: approach rail and career timeline ── */
  const phases = document.querySelector<HTMLElement>('[data-phases]');
  const phaseItems = Array.from(document.querySelectorAll<HTMLElement>('[data-phase]'));
  const timeline = document.querySelector<HTMLElement>('[data-timeline]');
  const timelineItems = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-item]'));
  const vertical = window.matchMedia('(max-width: 900px)');
  const onScrollLines = () => {
    const vh = window.innerHeight;
    if (phases) {
      const r = phases.getBoundingClientRect();
      const p = vertical.matches
        ? Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height))
        : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      phases.style.setProperty('--p', p.toFixed(3));
      phaseItems.forEach((el, i) => {
        const at = vertical.matches ? el.offsetTop / r.height : i / phaseItems.length;
        el.classList.toggle('is-on', p > at + 0.01);
      });
    }
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      timeline.style.setProperty('--p', t.toFixed(3));
      timelineItems.forEach((item) => item.classList.toggle('is-passed', item.getBoundingClientRect().top < vh * 0.6));
    }
  };
  onScrollLines();
  on('scroll', onScrollLines, { passive: true });
  on('resize', onScrollLines);

  /* ── Tab groups: who it's for, business value ── */
  document.querySelectorAll<HTMLElement>('[data-tabgroup]').forEach((group) => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(group.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    const select = (id: string, focus = false) => {
      tabs.forEach((tab) => {
        const sel = tab.dataset.tab === id;
        tab.setAttribute('aria-selected', String(sel));
        tab.tabIndex = sel ? 0 : -1;
        if (sel && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const sel = panel.dataset.panel === id;
        panel.hidden = !sel;
        if (sel) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
    };
    const onClick = (e: Event) => {
      const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
      if (tab?.dataset.tab) select(tab.dataset.tab);
    };
    const onKeyTabs = (e: KeyboardEvent) => {
      const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(e.key) || !(e.target as HTMLElement).closest('[role="tab"]')) return;
      e.preventDefault();
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      let n = i;
      if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      else n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      if (tabs[n].dataset.tab) select(tabs[n].dataset.tab!, true);
    };
    group.addEventListener('click', onClick);
    group.addEventListener('keydown', onKeyTabs);
    cleanups.push(() => {
      group.removeEventListener('click', onClick);
      group.removeEventListener('keydown', onKeyTabs);
    });
  });

  /* ── Magnetic primary CTAs (fine pointers only) ── */
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      };
      const leave = () => (el.style.transform = '');
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        leave();
      });
    });
  }

  return () => cleanups.reverse().forEach((fn) => fn());
}
