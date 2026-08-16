import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { r2Url } from '@/lib/r2';

/* Six-pointed asterisk mark */
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <line x1="10" y1="1"   x2="10" y2="19"  />
    <line x1="2"  y1="5.5" x2="18" y2="14.5"/>
    <line x1="18" y1="5.5" x2="2"  y2="14.5"/>
  </svg>
);

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

// Left-side text starts at px-8 = 2rem from left edge
const TEXT_INDENT = '2rem';

const NAV_ITEMS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
] as const;

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [topNavHovered, setTopNavHovered] = useState(false);
  const hideNavTimeout = useRef<number | null>(null);

  const showTopNav = () => {
    if (hideNavTimeout.current !== null) {
      window.clearTimeout(hideNavTimeout.current);
      hideNavTimeout.current = null;
    }
    setTopNavHovered(true);
  };

  const hideTopNav = () => {
    if (hideNavTimeout.current !== null) {
      window.clearTimeout(hideNavTimeout.current);
    }
    hideNavTimeout.current = window.setTimeout(() => {
      setTopNavHovered(false);
      hideNavTimeout.current = null;
    }, 150);
  };

  return (
    <div className="w-screen h-screen flex justify-center bg-background overflow-hidden">
    <div
      className="h-full flex flex-col overflow-hidden bg-background text-foreground"
      style={{ width: '100%', maxWidth: 'calc(100vh * 4 / 3)' }}
      data-testid="home-root"
    >

      {/* ══════════════════════════════════════
          HEADER — name + logo/nav above upper line
      ══════════════════════════════════════ */}
      <div className="flex flex-shrink-0" style={{ filter: hovered ? 'blur(4px)' : 'none', transition: 'filter 0.25s ease' }}>
        <div className="flex items-center gap-3 px-8 py-4" style={{ width: '40%' }}>
          {/* Name */}
          <span style={f(500, '1.75rem', { letterSpacing: '-0.02em', lineHeight: 1 })}>
            Seppe Goossens
          </span>

          {/* Logo + nav — group has extended right hit-area so mouse can slide into links */}
          <div
            className="relative flex items-center"
            style={{ lineHeight: 0, paddingRight: '42rem', marginRight: '-42rem' }}
            onMouseEnter={showTopNav}
            onMouseLeave={hideTopNav}
          >
            <div className="hover:text-accent transition-colors" style={{ lineHeight: 0, paddingRight: '0.75rem' }}>
              <LogoMark />
            </div>

            <nav
              aria-label="Primary navigation"
              className="absolute flex items-center gap-4 opacity-0 pointer-events-none transition-opacity duration-150"
              style={{ left: '44px', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', opacity: topNavHovered ? 1 : 0, pointerEvents: topNavHovered ? 'auto' : 'none', paddingRight: '6rem' }}
              onMouseEnter={showTopNav}
              onMouseLeave={hideTopNav}
            >
              {[
                { label: 'Selected Works',       href: '/projects'  },
                { label: 'Music', href: '/music' },
                { label: 'Visualizations', href: '/visualizations' },
                { label: 'Blog', href: '/blog' },
                { label: 'About',          href: '/about'     },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-foreground hover:text-accent transition-colors"
                  style={f(300, '1.15rem', { letterSpacing: '0.01em' })}
                  data-testid={`link-${label.toLowerCase()}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div style={{ width: '60%' }} />
      </div>

      {/* UPPER HORIZON LINE — 2px, inset left & right */}
      <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: TEXT_INDENT, marginRight: TEXT_INDENT, filter: hovered ? 'blur(4px)' : 'none', transition: 'filter 0.25s ease' }} />

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="flex flex-grow overflow-hidden">

        {/* LEFT COLUMN */}
        <div className="flex flex-col" style={{ width: '40%', filter: hovered ? 'blur(4px)' : 'none', transition: 'filter 0.25s ease' }} data-testid="col-left">

          {/* Bio */}
          <div className="px-8 pt-5 pb-4">
            <p className="text-foreground/80" style={f(400, '1.125rem', { lineHeight: 1.5, letterSpacing: '0.01em' })}>
              Urban Planner & Industrial Engineer
            </p>
          </div>

          <div className="flex-grow" />

        </div>

        {/* RIGHT COLUMN: large typographic nav */}
        <div
          className="flex-grow flex flex-col justify-evenly overflow-hidden"
          style={{ paddingLeft: '3rem', paddingRight: TEXT_INDENT }}
          data-testid="col-right"
        >
          {NAV_ITEMS.map(({ label, href }) => {
            const isHovered = hovered === label;
            const isDimmed  = hovered !== null && !isHovered;
            return (
              <Link
                key={label}
                href={href}
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'inline-block',
                  marginLeft: 'auto',
                  fontFamily: "'ABC ROM'",
                  fontWeight: 700,
                  fontSize: 'clamp(3.2rem, 7.5vh, 6.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: 'transparent',
                  WebkitTextStroke: isHovered ? '1.5px #FF0000' : '1px var(--color-foreground)',
                  filter: isDimmed ? 'blur(2px)' : 'none',
                  opacity: isDimmed ? 0.3 : 1,
                  transition: 'opacity 0.2s ease, filter 0.2s ease, -webkit-text-stroke 0.15s ease',
                  cursor: 'pointer',
                  userSelect: 'none',
                  textAlign: 'right',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* LOWER HORIZON LINE — 2px, inset left & right */}
      <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: TEXT_INDENT, marginRight: TEXT_INDENT, filter: hovered ? 'blur(4px)' : 'none', transition: 'filter 0.25s ease' }} />

      {/* FOOTER — email + links + theme toggle */}
      <div className="flex flex-shrink-0 items-center gap-5 px-8 py-2.5" style={{ filter: hovered ? 'blur(4px)' : 'none', transition: 'filter 0.25s ease' }}>
        <a
          href="mailto:seppe.goossens123@gmail.com"
          className="text-foreground/70 hover:text-accent transition-colors"
          style={f(350, '1rem', { letterSpacing: '0.01em' })}
          data-testid="contact-email"
        >
          seppe.goossens123@gmail.com
        </a>
        {[
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/seppe-goossens-75a8671b4/', testId: 'contact-linkedin', internal: false },
          { label: 'CV',       href: r2Url('misc/cv.pdf'),                            testId: 'contact-cv',        internal: false },
          { label: 'About',    href: '/about',                                       testId: 'contact-about',     internal: true },
        ].map(({ label, href, testId, internal }) =>
          internal
            ? <Link key={label} href={href} className="text-foreground/50 hover:text-accent transition-colors" style={f(300, '1rem')} data-testid={testId}>{label}</Link>
            : <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-accent transition-colors" style={f(300, '1rem')} data-testid={testId}>{label}</a>
        )}
        <div style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>
          <ThemeToggleInline />
        </div>
      </div>

    </div>
    </div>
  );
}
