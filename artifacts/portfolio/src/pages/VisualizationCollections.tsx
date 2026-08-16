import React, { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { FloatingNav } from '@/components/FloatingNav';

// --- Shared Layout Primitives from Visualizations.tsx ---

const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <line x1="10" y1="1" x2="10" y2="19" />
    <line x1="2" y1="5.5" x2="18" y2="14.5" />
    <line x1="18" y1="5.5" x2="2" y2="14.5" />
  </svg>
);

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

const INDENT = '2rem';

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const COLLECTIONS = [
  'Het Bos',
  'Belgian Landscapes',
  'Churches',
  'Streetviews',
  'Japan 2025',
  'Zwarte Woud 2025',
  'Noord-Frankrijk 2025',
];

const styles: { [key: string]: React.CSSProperties } = {
  pageShell: {
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--background)',
  },
  visPageContainer: {
    width: '100%',
    maxWidth: 'calc(100vh * 4 / 3)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'var(--background)',
    color: 'var(--color-foreground)',
  },
  visHeader: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    paddingTop: '1rem',
    paddingBottom: '1rem',
  },
  visHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoNavGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 0,
  },
  logoNavMenu: {
    position: 'absolute',
    left: '44px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease',
  },
  headerTitle: {
    ...f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', {
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color: 'transparent',
      WebkitTextStroke: '1px var(--color-foreground)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }),
  },
  dividerLine: {
    flexShrink: 0,
    height: '2px',
    backgroundColor: 'var(--color-foreground)',
    marginLeft: INDENT,
    marginRight: INDENT,
    position: 'relative',
    zIndex: 3,
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    justifyContent: 'center',
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    paddingTop: '0.65rem',
    paddingBottom: '0.65rem',
  },
};

const VisualizationCollections = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [topNavHovered, setTopNavHovered] = useState(false);
  const hideNavTimeout = React.useRef<number | null>(null);

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
  const blurStyle: React.CSSProperties = hovered ? { filter: 'blur(4px)', transition: 'filter 0.25s ease' } : { transition: 'filter 0.25s ease' };

  return (
    <div style={styles.pageShell}>
      <FloatingNav />
      <div style={styles.visPageContainer}>
        <header style={{ ...styles.visHeader, ...blurStyle }}>
          <div style={styles.visHeaderLeft}>
            <Link
              href="/"
              style={f(500, '1.75rem', {
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'inherit',
                textDecoration: 'none',
              })}
            >
              linky2001
            </Link>

            <div
              style={{ ...styles.logoNavGroup, paddingRight: '42rem', marginRight: '-42rem' }}
              onMouseEnter={showTopNav}
              onMouseLeave={hideTopNav}
            >
              <div className="hover:text-accent transition-colors" style={{ lineHeight: 0, paddingRight: '0.75rem' }}>
                <LogoMark />
              </div>
              <nav 
                aria-label="Primary navigation" 
                style={{ ...styles.logoNavMenu, opacity: topNavHovered ? 1 : 0, pointerEvents: topNavHovered ? 'auto' : 'none' }}
                onMouseEnter={showTopNav}
                onMouseLeave={hideTopNav}
              >
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-foreground hover:text-accent transition-colors"
                    style={f(300, '1.15rem', { letterSpacing: '0.01em' })}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div style={styles.headerTitle}>Collections</div>
        </header>

        <div style={{...styles.dividerLine, ...blurStyle}} />

        <main style={styles.main}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            {COLLECTIONS.map((label) => {
              const isHovered = hovered === label;
              const isDimmed = hovered !== null && !isHovered;
              return (
                <Link
                  key={label}
                  href={`/work-in-progress/${label.toLowerCase().replace(/ /g, '-')}`}
                  onMouseEnter={() => setHovered(label)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    fontFamily: "'ABC ROM'",
                    fontWeight: 700,
                    fontSize: 'clamp(2.2rem, 5.5vh, 4.5rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    color: 'transparent',
                    WebkitTextStroke: isHovered ? '1.5px #FF0000' : '1px var(--color-foreground)',
                    filter: isDimmed ? 'blur(2px)' : 'none',
                    opacity: isDimmed ? 0.3 : 1,
                    transition: 'opacity 0.2s ease, filter 0.2s ease, -webkit-text-stroke 0.15s ease',
                    cursor: 'pointer',
                    userSelect: 'none',
                    textAlign: 'left',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </main>

        <div style={{...styles.dividerLine, ...blurStyle}} />

        <footer style={{...styles.footer, ...blurStyle}}>
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <ThemeToggleInline />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VisualizationCollections;
