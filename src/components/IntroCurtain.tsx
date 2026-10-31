import '../styles/intro.css';

/* First-visit intro, in one of two looks (html.loader-dots picks the second):
   - logo: the S mark draws itself on ivory and the wordmark rises under it (pure CSS);
   - dots: dots fly in to form a halftone portrait of Rohit (canvas, src/client/intro.ts).
   Both end the same way: a navy wash sweeps up over the page and peels away to reveal the hero.
   Plays once per session; the head script in app/layout.tsx decides (and skips it for reduced
   motion). The toggle in the corner switches looks and replays it. */

export function IntroCurtain() {
  return (
    <>
      <div className="intro-curtain" aria-hidden="true">
        <div className="intro-curtain__paper" data-intro-paper>
          <canvas className="intro-curtain__dots" data-intro-dots />
          <div className="intro-curtain__lockup">
            <svg className="intro-curtain__mark" viewBox="14 12 40 40" focusable="false">
              <path
                className="intro-curtain__s"
                pathLength={1}
                d="M41.5 22.5c-1.8-3-5-4.6-9.2-4.6-5.6 0-9.4 3-9.4 7.4 0 4.2 3 6 8.6 7.2 4.6 1 6.4 2 6.4 4.4 0 2.4-2.3 4-5.8 4-3.8 0-6.4-1.7-7.6-4.6"
              />
              <circle className="intro-curtain__dot" cx="46" cy="44" r="4.5" />
            </svg>
            <div className="intro-curtain__portrait" data-intro-portrait />
            <p className="intro-curtain__word">
              <span className="intro-curtain__line">
                <span className="brand__mark">SageVerve</span>
              </span>
              <span className="intro-curtain__line">
                <span className="brand__by">with Rohit Johar</span>
              </span>
            </p>
          </div>
        </div>
        <div className="intro-curtain__wash" />
      </div>

      <div className="loader-toggle" role="group" aria-label="Intro animation">
        <span className="loader-toggle__label">Intro</span>
        <button type="button" className="loader-toggle__opt" data-loader-pick="logo">
          Logo draw
        </button>
        <button type="button" className="loader-toggle__opt" data-loader-pick="dots">
          Dot portrait
        </button>
      </div>
    </>
  );
}
