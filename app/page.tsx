import type { ReactNode } from 'react';
import {
  career,
  contact,
  employers,
  engagements,
  expertise,
  heroStages,
  levers,
  linkedinRecommendations,
  moments,
  nav,
  painPoints,
  phases,
  plLines,
  press,
  proof,
  segments,
  testimonials,
  tickerLines,
} from '../src/content';
import { SiteClient } from '../src/client/SiteClient';
import { SiteFooter } from '../src/components/SiteFooter';
import { IntroCurtain } from '../src/components/IntroCurtain';
import { Arrow, ArrowUpRight, ConnectedOrg, HeroFallback, OrgShape, PhaseMotif, ProblemMotif } from '../src/components/Motifs';

function Brand() {
  return (
    <span className="brand__text">
      <span className="brand__mark">SageVerve</span>
      <span className="brand__by">with Rohit Johar</span>
    </span>
  );
}

function Label({ children, tone }: { children: ReactNode; tone?: 'light' }) {
  return <p className={`label${tone ? ` label--${tone}` : ''}`}>{children}</p>;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function Home() {
  return (
    <>
      <IntroCurtain />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* ── Navigation ── */}
      <header className="site-header" data-header>
        <div className="site-header__inner">
          <a className="brand" href="#top" aria-label="SageVerve with Rohit Johar, back to top">
            <Brand />
          </a>
          <nav className="site-nav" aria-label="Primary">
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} data-nav-link>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a className="btn btn--primary btn--sm site-header__cta" href="#contact">
            Book a conversation
            <Arrow />
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            data-menu-toggle
          >
            <span className="menu-toggle__bars" aria-hidden="true" />
            <span className="sr-only">Menu</span>
          </button>
        </div>
        <div className="mobile-menu" id="mobile-menu" data-menu hidden>
          <ul>
            {nav.map((n, i) => (
              <li key={n.href}>
                <a href={n.href} data-menu-link>
                  <span className="mobile-menu__num">{pad(i + 1)}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn--primary" href="#contact" data-menu-link>
            Book a conversation
            <Arrow />
          </a>
        </div>
      </header>

      <main id="main">
        {/* ── 01 Hero: People make performance ── */}
        <section className="hero" id="top" data-hero aria-labelledby="hero-title">
          <div className="hero__grid">
            <div className="hero__scene" data-scene>
              <div
                className="hero__canvas"
                data-scene-mount
                role="img"
                aria-label="A miniature 3D office. As you scroll, separate teams connect, leaders gather at one table and growth indicators rise above the organisation."
              />
              <div className="hero__loader" data-scene-loader aria-hidden="true">
                <span className="hero__loader-dots">
                  <i />
                  <i />
                  <i />
                </span>
                Assembling the organisation
              </div>
              <HeroFallback />
              <div className="hud" aria-hidden="true">
                <p className="hud__label">
                  <span className="hud__num" data-hud-num>
                    01
                  </span>
                  <span className="hud__of">/ 04</span>
                  <span className="hud__name" data-hud-name>
                    Fragmented
                  </span>
                </p>
                <ol className="hud__steps">
                  {heroStages.map((s) => (
                    <li key={s.key} data-hud-step>
                      <span />
                    </li>
                  ))}
                </ol>
              </div>
              <div className="scene-cursor" data-scene-cursor aria-hidden="true">
                Scroll to connect the organisation
              </div>
            </div>

            <div className="hero__intro" data-hero-step="0">
              <a className="byline" href="#rohit" data-intro aria-label="Rohit Johar, Fractional CHRO. Read more about Rohit">
                <span className="byline__photo">
                  <img
                    src="/img/rohit-johar.png"
                    alt=""
                    width={750}
                    height={750}
                    fetchPriority="high"
                    decoding="async"
                  />
                </span>
                <span className="byline__plate">
                  <span className="byline__name">Rohit Johar</span>
                  <span className="byline__role">Fractional CHRO &amp; Transformation Advisor</span>
                  <span className="byline__creds">
                    <span className="dot" aria-hidden="true" />
                    27+ years · Amazon India · Genpact · Syneos Health
                  </span>
                </span>
              </a>
              <h1 id="hero-title" className="hero__title">
                <span className="line" data-intro>
                  <span>Your people</span>
                </span>
                <span className="line" data-intro>
                  <span>
                    strategy <b>should</b>
                  </span>
                </span>
                <span className="line" data-intro>
                  <span>
                    <b>move your business</b>
                  </span>
                </span>
                <span className="line line--accent" data-intro>
                  <span>
                    forward.
                    <span className="hero__chip" aria-hidden="true">
                      <ArrowUpRight className="arrow" />
                    </span>
                  </span>
                </span>
              </h1>
              <p className="hero__sub" data-intro>
                Strategic people leadership that helps founders, CEOs and leadership teams turn people strategy into
                measurable business outcomes.
              </p>
              <div className="actions" data-intro>
                <a className="btn btn--primary btn--lg" href="#contact" data-magnetic>
                  Let’s talk business
                  <Arrow />
                </a>
                <a className="btn btn--ghost btn--lg" href="#approach">
                  Explore the approach
                </a>
              </div>
              <p className="scroll-cue" data-intro aria-hidden="true">
                <span className="scroll-cue__line" />
                Scroll: watch the organisation connect
              </p>
            </div>

            {heroStages.map((s, i) => (
              <article className="hero__step" key={s.key} data-hero-step={i + 1} aria-labelledby={`stage-${s.key}`}>
                <p className="hero__step-num">
                  <span>{pad(i + 1)}</span>
                  {s.label}
                </p>
                <h2 id={`stage-${s.key}`} className="hero__step-title">
                  {s.title}
                </h2>
                <p className="hero__step-body">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── 02 Credibility ── */}
        <section className="cred section" aria-labelledby="cred-title">
          <div className="container">
            <div className="cred__head">
              <Label>
                <span data-reveal>Track record</span>
              </Label>
              <h2 id="cred-title" className="h2 cred__title" data-reveal>
                Experience across complex, <span className="soft">global organisations.</span>
              </h2>
              <ul className="cred__employers" aria-label="Organisations Rohit has led HR in" data-reveal>
                {employers.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <ul className="stats">
              {proof.map((p) => (
                <li key={p.label} className="stat" data-reveal>
                  <span className="stat__value">
                    {p.prefix}
                    <span data-count={p.value}>{p.value}</span>
                    <span className="stat__suffix">{p.suffix}</span>
                  </span>
                  <span className="stat__label">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 03 The real problem ── */}
        <section className="problem section section--dark" aria-labelledby="problem-title">
          <div className="container">
            <div className="problem__head">
              <Label tone="light">
                <span data-reveal>The real problem</span>
              </Label>
              <h2 id="problem-title" className="h2" data-reveal>
                HR is busy.
                <br />
                <span className="soft">The business still can’t see the value.</span>
              </h2>
            </div>
            <ol className="problem__list">
              {painPoints.map((p, i) => (
                <li key={p.title} className="problem__row" data-reveal>
                  <span className="problem__num">{pad(i + 1)}</span>
                  <h3 className="problem__title">{p.title}</h3>
                  <ProblemMotif kind={p.motif} />
                  <p className="problem__body">{p.body}</p>
                </li>
              ))}
            </ol>
            <p className="problem__answer" data-reveal>
              <span className="pill pill--lime">Not another HR initiative</span>
              Run HR as an <strong>enterprise value office</strong>: workforce strategy, operating model, leadership
              accountability and business outcomes, managed as one system.
            </p>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            {[0, 1].map((k) => (
              <span key={k} className="ticker__group">
                {tickerLines.map((t) => (
                  <span key={t} className="ticker__item">
                    {t}
                    <span className="ticker__star">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── 04 Approach ── */}
        <section className="approach section" id="approach" aria-labelledby="approach-title">
          <div className="container">
            <div className="split-head">
              <div>
                <Label>
                  <span data-reveal>The SageVerve approach</span>
                </Label>
                <h2 id="approach-title" className="h2" data-reveal>
                  Four phases.
                  <br />
                  <span className="soft">One operating rhythm.</span>
                </h2>
              </div>
              <p className="lede" data-reveal>
                Strategic diagnosis, future-state design, implementation governance and capability transfer, so the change
                becomes part of how you run, not a one-off programme.
              </p>
            </div>
            <ol className="phases" data-phases>
              <span className="phases__rail" aria-hidden="true">
                <span className="phases__fill" data-phases-fill />
              </span>
              {phases.map((p, i) => (
                <li key={p.name} className={`phase phase--${p.motif}`} data-phase>
                  <span className="phase__node" aria-hidden="true" />
                  <p className="phase__num">{pad(i + 1)}</p>
                  <div className="phase__motif">
                    <PhaseMotif kind={p.motif} />
                  </div>
                  <h3 className="phase__name">{p.name}</h3>
                  <p className="phase__tag">{p.tag}</p>
                  <p className="phase__body">{p.body}</p>
                </li>
              ))}
            </ol>
            <p className="approach__note" data-reveal>
              <span className="dot" aria-hidden="true" /> Structure creates momentum.
            </p>
          </div>
        </section>

        {/* ── 05 Who it's for ── */}
        <section className="who section section--tint" id="who" aria-labelledby="who-title">
          <div className="container">
            <div className="split-head">
              <div>
                <Label>
                  <span data-reveal>Who it’s for</span>
                </Label>
                <h2 id="who-title" className="h2" data-reveal>
                  Different stages.
                  <br />
                  <span className="soft">Different people challenges.</span>
                </h2>
              </div>
            </div>
            <div className="who__grid" data-tabgroup>
              <div className="who__tabs" role="tablist" aria-label="Organisation stage" aria-orientation="vertical">
                {segments.map((s, i) => (
                  <button
                    key={s.id}
                    role="tab"
                    type="button"
                    id={`tab-${s.id}`}
                    aria-controls={`panel-${s.id}`}
                    aria-selected={i === 0}
                    tabIndex={i === 0 ? 0 : -1}
                    className="who__tab"
                    data-tab={s.id}
                  >
                    <span className="who__tab-num">{pad(i + 1)}</span>
                    <span className="who__tab-label">{s.label}</span>
                    <Arrow className="arrow who__tab-arrow" />
                  </button>
                ))}
              </div>
              <div className="who__stage">
                {segments.map((s, i) => (
                  <div
                    key={s.id}
                    role="tabpanel"
                    id={`panel-${s.id}`}
                    aria-labelledby={`tab-${s.id}`}
                    className="who__panel"
                    data-panel={s.id}
                    hidden={i !== 0}
                    tabIndex={0}
                  >
                    <div className="who__visual">
                      <OrgShape kind={s.shape} />
                      <span className="who__visual-tag">{s.short}</span>
                    </div>
                    <div className="who__copy">
                      <p className="who__lede">{s.lede}</p>
                      <ul className="who__points">
                        {s.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 06 Where Rohit makes the biggest difference ── */}
        <section className="moments section" aria-labelledby="moments-title">
          <div className="container">
            <div className="split-head">
              <div>
                <Label>
                  <span data-reveal>Moments that matter</span>
                </Label>
                <h2 id="moments-title" className="h2" data-reveal>
                  Where Rohit makes
                  <br />
                  <span className="soft">the biggest difference.</span>
                </h2>
              </div>
              <p className="lede" data-reveal>
                Four situations where senior people leadership changes the trajectory of the business, and where waiting
                usually costs the most.
              </p>
            </div>
            <ol className="moments__list">
              {moments.map((m, i) => (
                <li key={m.title} className="moment" data-reveal>
                  <span className="moment__num">{pad(i + 1)}</span>
                  <h3 className="moment__title">{m.title}</h3>
                  <div className="moment__detail">
                    <p>{m.body}</p>
                    <ul className="moment__tags">
                      {m.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 07 Meet Rohit ── */}
        <section className="rohit section section--paper" id="rohit" aria-labelledby="rohit-title">
          <div className="container rohit__grid">
            <div className="rohit__media" data-reveal>
              <figure className="rohit__portrait">
                <img
                  src="/img/rohit-johar.png"
                  alt="Portrait of Rohit Johar, Fractional CHRO and Transformation Advisor"
                  width={750}
                  height={750}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="rohit__caption">
                  <span className="rohit__caption-name">Rohit Johar</span>
                  <span>Fractional CHRO · SageVerve</span>
                </figcaption>
              </figure>
              <span className="rohit__sticker" aria-hidden="true">
                People first.
                <br />
                Performance always.
              </span>
            </div>

            <div className="rohit__story">
              <Label>
                <span data-reveal>Meet Rohit Johar</span>
              </Label>
              <h2 id="rohit-title" className="h2 rohit__title" data-reveal>
                An operator who has run people strategy at scale, <span className="soft">not just advised on it.</span>
              </h2>
              <div className="rohit__bio" data-reveal>
                <p>
                  Rohit started on the plantation and retail floors of the Goodricke Group in Kolkata. He went on to lead HR
                  for 20,000 people across 11 countries at Genpact, support around 30,000 at Amazon India, and head HR for
                  APAC and strategic growth hubs at Syneos Health.
                </p>
                <p>
                  Along the way he integrated four global acquisitions and led more than $50M in transformation programmes.
                  Through SageVerve, he now brings that enterprise experience to founders, CEOs and boards, at the stage
                  they need it.
                </p>
              </div>
              <div className="rohit__belief" data-reveal>
                <p className="rohit__belief-label">How Rohit sees HR</p>
                <p className="rohit__belief-text">
                  The challenge is rarely effort. It’s alignment. HR should run as an <strong>enterprise value office</strong>,
                  accountable for the outcomes the business actually measures.
                </p>
              </div>
              <ul className="tags" aria-label="Areas of expertise" data-reveal>
                {expertise.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="career">
              <h3 className="career__title" data-reveal>
                Career highlights
              </h3>
              <ol className="career__list" data-timeline>
                <span className="career__rail" aria-hidden="true">
                  <span className="career__fill" data-timeline-fill />
                </span>
                {career.map((c) => (
                  <li key={c.org} className="career__item" data-timeline-item>
                    <span className="career__dot" aria-hidden="true" />
                    <div className="career__meta">
                      <h4 className="career__org">{c.org}</h4>
                      {c.years && <p className="career__years">{c.years}</p>}
                    </div>
                    <div className="career__body">
                      <p className="career__role">{c.role}</p>
                      <p className="career__detail">{c.detail}</p>
                      {c.scale && <p className="career__scale">{c.scale}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="footnote">
                Education: MBA (Marketing & HR), Faculty of Management Studies, Jabalpur · BA (Industrial Relations,
                Economics & Sociology), St Joseph’s College of Arts & Science, Bangalore.
              </p>
            </div>
          </div>
        </section>

        {/* ── 08 Business value ── */}
        <section className="value section section--dark" aria-labelledby="value-title">
          <div className="container">
            <div className="split-head">
              <div>
                <Label tone="light">
                  <span data-reveal>Business value</span>
                </Label>
                <h2 id="value-title" className="h2" data-reveal>
                  People decisions
                  <br />
                  <span className="soft">show up on the P&amp;L.</span>
                </h2>
              </div>
              <p className="lede" data-reveal>
                Pick a people lever to see which lines of the business it moves. Better decisions, stronger organisations.
              </p>
            </div>

            <div className="value__grid" data-tabgroup>
              <div className="value__levers" role="tablist" aria-label="People levers" aria-orientation="vertical">
                {levers.map((l, i) => (
                  <button
                    key={l.id}
                    role="tab"
                    type="button"
                    id={`lever-${l.id}`}
                    aria-controls={`lever-panel-${l.id}`}
                    aria-selected={i === 0}
                    tabIndex={i === 0 ? 0 : -1}
                    className="lever"
                    data-tab={l.id}
                  >
                    <span className="lever__num">{pad(i + 1)}</span>
                    {l.name}
                  </button>
                ))}
              </div>

              <div className="value__panels">
                {levers.map((l, i) => (
                  <div
                    key={l.id}
                    role="tabpanel"
                    id={`lever-panel-${l.id}`}
                    aria-labelledby={`lever-${l.id}`}
                    className="value__panel"
                    data-panel={l.id}
                    hidden={i !== 0}
                    tabIndex={0}
                  >
                    <p className="value__body">{l.body}</p>
                    <div className="pl" role="group" aria-label={`Where ${l.name.toLowerCase()} shows up`}>
                      <p className="pl__head">
                        <span>Where it shows up</span>
                        <span className="pl__note">Illustrative direction, not a forecast</span>
                      </p>
                      <ul className="pl__lines">
                        {plLines.map((line) => {
                          const dir = l.lines[line.key];
                          const word =
                            dir === 0
                              ? 'Indirect'
                              : line.key === 'cost' || line.key === 'risk'
                                ? 'Lower'
                                : 'Higher';
                          return (
                            <li key={line.key} className={`pl__line${dir !== 0 ? ' is-moved' : ''}`}>
                              <span className="pl__name">{line.label}</span>
                              <span className="pl__bar" aria-hidden="true">
                                <span style={{ ['--w' as string]: dir === 0 ? 0.18 : 0.86 }} />
                              </span>
                              <span className="pl__dir">
                                {dir !== 0 && (
                                  <svg viewBox="0 0 12 12" aria-hidden="true" className={dir > 0 ? 'up' : 'down'}>
                                    <path d="M6 2v8M2.5 5.5 6 2l3.5 3.5" />
                                  </svg>
                                )}
                                {word}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {l.stat && (
                      <div className={`evidence${l.stat.indicative ? ' evidence--indicative' : ''}`}>
                        <span className="evidence__value">{l.stat.value}</span>
                        <p className="evidence__label">{l.stat.label}</p>
                        <p className="evidence__source">
                          {l.stat.indicative && <span className="pill pill--outline">Indicative</span>}
                          {l.stat.source}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 09 Ways to work with Rohit ── */}
        <section className="engage section" id="engage" aria-labelledby="engage-title">
          <div className="container">
            <div className="split-head">
              <div>
                <Label>
                  <span data-reveal>Ways to work with Rohit</span>
                </Label>
                <h2 id="engage-title" className="h2" data-reveal>
                  Start with clarity.
                  <br />
                  <span className="soft">Stay for the results.</span>
                </h2>
              </div>
              <p className="lede" data-reveal>
                Project-based, retainer, board advisory or transition support. Every engagement is shaped around your stage,
                your leadership team and the outcomes you need.
              </p>
            </div>
            <ol className="offers">
              {engagements.map((e, i) => (
                <li key={e.name} className={`offer${e.featured ? ' offer--featured' : ''}`} data-reveal>
                  <a
                    className="offer__link"
                    href={`mailto:${contact.email}?subject=${encodeURIComponent(`${e.name} · SageVerve`)}`}
                  >
                    <span className="offer__num">{pad(i + 1)}</span>
                    <span className="offer__main">
                      <span className="offer__name">
                        {e.name}
                        {e.featured && <span className="pill pill--lime">Where most start</span>}
                      </span>
                      <span className="offer__solves">
                        <span className="offer__solves-label">Solves</span>
                        {e.solves}
                      </span>
                    </span>
                    <span className="offer__includes">
                      {e.includes.map((x) => (
                        <span key={x}>{x}</span>
                      ))}
                    </span>
                    <span className="offer__cta">
                      Enquire
                      <ArrowUpRight />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 10 In their words ── */}
        <section className="voices section section--tint" aria-labelledby="voices-title">
          <div className="container voices__grid">
            <div>
              <Label>
                <span data-reveal>In their words</span>
              </Label>
              <h2 id="voices-title" className="h2" data-reveal>
                Trusted by the people
                <br />
                <span className="soft">he has led.</span>
              </h2>
            </div>
            <figure className="press" data-reveal>
              <blockquote>
                <p>{press.quote}</p>
              </blockquote>
              <figcaption>
                <strong>{press.source}</strong> · {press.date}
              </figcaption>
            </figure>
            <a className="recs" href={contact.linkedin} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="recs__num">{linkedinRecommendations}</span>
              <span className="recs__text">
                LinkedIn recommendations from colleagues and team members
                <span className="recs__link">
                  Read them on LinkedIn
                  <ArrowUpRight />
                </span>
              </span>
            </a>
            {testimonials.length > 0 && (
              <ul className="quotes">
                {testimonials.map((t) => (
                  <li key={t.name} className="quote" data-reveal>
                    <blockquote>
                      <p>“{t.quote}”</p>
                    </blockquote>
                    <p className="quote__who">
                      <strong>{t.name}</strong>
                      <span>
                        {t.role} · {t.relation}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── 11 Contact ── */}
        <section className="contact section section--dark" id="contact" aria-labelledby="contact-title">
          <div className="contact__art" aria-hidden="true">
            <ConnectedOrg />
          </div>
          <div className="container contact__grid">
            <div className="contact__main">
              <Label tone="light">
                <span data-reveal>Let’s talk</span>
              </Label>
              <h2 id="contact-title" className="contact__title" data-reveal>
                Your people agenda.
                <br />
                <span className="accent">Your next stage of growth.</span>
              </h2>
              <p className="lede" data-reveal>
                Let’s explore how stronger people leadership can move your organisation forward.
              </p>
              <div className="actions" data-reveal>
                <a className="btn btn--lime btn--lg" href={contact.mailto} data-magnetic>
                  Start a conversation
                  <Arrow />
                </a>
                <a className="btn btn--ghost-light btn--lg" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                  Connect on LinkedIn
                  <ArrowUpRight />
                </a>
              </div>
            </div>
            <dl className="contact__details" data-reveal>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={contact.mailto}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={contact.phoneHref}>{contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    {contact.linkedinLabel}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{contact.location}</dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      {/* ── 12 Footer ── */}
      <SiteFooter />

      <SiteClient />
    </>
  );
}
