import { contact, engagements, expertise, nav } from '../content';
import { Arrow, ArrowUpRight } from './Motifs';
import '../styles/footer.css';

/* Lime footer: logo tile, closing pitch, link columns and an oversized wordmark,
   over a faint repeating SV monogram. Follows the navy contact section. */

const explore = [...nav, { href: '#contact', label: 'Contact' }];

function Monogram() {
  return (
    <svg className="sv-footer__pattern" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sv-monogram" width="210" height="92" patternUnits="userSpaceOnUse">
          <text x="18" y="34">SV</text>
          <text x="123" y="80">SV</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sv-monogram)" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="sv-footer">
      <Monogram />
      <div className="container sv-footer__inner">
        <div className="sv-footer__top">
          <div className="sv-footer__pitch">
            <span className="sv-footer__logo" aria-hidden="true">
              SV
            </span>
            <p className="sv-footer__title">Your partner in strategic people leadership.</p>
            <p className="sv-footer__lede">
              Discuss a growth plan, a transformation or a leadership gap directly with Rohit.
            </p>
            <div className="sv-footer__actions">
              <a className="sv-footer__cta" href={contact.mailto}>
                Book a conversation
                <span className="sv-footer__cta-icon">
                  <Arrow />
                </span>
              </a>
              <a className="sv-footer__mail" href={contact.mailto}>
                {contact.email}
              </a>
            </div>
          </div>

          <nav className="sv-footer__cols" aria-label="Footer">
            <div className="sv-footer__col">
              <p className="sv-footer__head">Explore</p>
              <ul>
                {explore.map((n) => (
                  <li key={n.href}>
                    <a href={n.href}>{n.label}</a>
                  </li>
                ))}
              </ul>
              <p className="sv-footer__head sv-footer__head--gap">Based in</p>
              <address>
                <strong>{contact.location}</strong>
              </address>
            </div>

            <div className="sv-footer__col">
              <p className="sv-footer__head">Engagements</p>
              <ul>
                {engagements.map((e) => (
                  <li key={e.name}>
                    <a href="#engage">{e.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sv-footer__col">
              <p className="sv-footer__head">Expertise</p>
              <ul>
                {expertise.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="sv-footer__head sv-footer__head--gap">Connect</p>
              <ul>
                <li>
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                    <ArrowUpRight />
                  </a>
                </li>
                <li>
                  <a href={contact.phoneHref}>{contact.phone}</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="sv-footer__bottom">
          <span>© 2026 SageVerve. All rights reserved. Gurugram, India.</span>
          <span className="sv-footer__bottom-links">
            <span>People first. Performance always.</span>
            <a href="#top">Back to top ↑</a>
          </span>
        </div>

        <p className="sv-footer__wordmark" aria-hidden="true">
          <span>Sage</span>
          <span>Verve</span>
        </p>
      </div>

    </footer>
  );
}
