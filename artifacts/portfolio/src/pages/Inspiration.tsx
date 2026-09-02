import { Link } from 'wouter';
import { Fragment } from 'react';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { STAGE_HEIGHT, STAGE_WIDTH, WebampPlayer } from '@/components/WebampPlayer';

import './Inspiration.css';

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

// From https://docs.webamp.org/docs/features/hotkeys/ (enabled via `enableHotkeys` in WebampPlayer.tsx).
const HOTKEYS = [
  { key: 'X', action: 'Play' },
  { key: 'C', action: 'Pause' },
  { key: 'V', action: 'Stop' },
  { key: 'B', action: 'Next track' },
  { key: 'Z', action: 'Previous track' },
  { key: 'R', action: 'Toggle repeat' },
  { key: 'S', action: 'Toggle shuffle' },
  { key: 'L', action: 'Open file dialog' },
  { key: '\u2190 / \u2192', action: 'Seek backward / forward (5s)' },
  { key: '\u2191 / \u2193', action: 'Volume up / down' },
  { key: 'Ctrl+D', action: 'Toggle double size' },
  { key: 'Ctrl+R', action: 'Reverse playlist' },
  { key: 'Ctrl+T', action: 'Toggle time mode' },
  { key: 'Alt+W', action: 'Toggle main window' },
  { key: 'Alt+E', action: 'Toggle playlist window' },
  { key: 'Alt+G', action: 'Toggle equalizer window' },
  { key: 'Space', action: 'Milkdrop: next preset' },
  { key: 'Backspace', action: 'Milkdrop: previous preset' },
];

export default function Inspiration() {
  return (
    <div style={{ width: '100vw', minWidth: `${STAGE_WIDTH}px`, display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 'calc(100vh * 4 / 3)',
          minHeight: `max(100vh, ${STAGE_HEIGHT}px)`,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <div
          className="flex items-center flex-shrink-0"
          style={{ justifyContent: 'space-between', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          <div className="flex items-center gap-3">
            <Link href="/" style={f(500, '1.75rem', { letterSpacing: '-0.02em', lineHeight: 1, color: 'inherit', textDecoration: 'none' })}>
              linky2001
            </Link>

            <div
              className="relative group flex items-center"
              style={{ lineHeight: 0, paddingRight: '220px', marginRight: '-220px' }}
            >
              <div className="hover:text-accent transition-colors" style={{ lineHeight: 0 }}>
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <line x1="10" y1="1" x2="10" y2="19" />
                  <line x1="2" y1="5.5" x2="18" y2="14.5" />
                  <line x1="18" y1="5.5" x2="2" y2="14.5" />
                </svg>
              </div>

              <nav
                aria-label="Primary navigation"
                className="absolute flex items-center gap-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150"
                style={{ left: '44px', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
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

          <div
            style={f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', {
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px var(--color-foreground)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            })}
          >
            Music Player
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="flex-grow" style={{ position: 'relative', minHeight: '85vh', width: '100%' }}>
          <div className="group" style={{ position: 'absolute', top: '0.85rem', left: '2rem', zIndex: 30 }}>
            <button
              type="button"
              aria-label="Keyboard shortcuts"
              className="flex items-center justify-center rounded-full border border-foreground/40 hover:border-foreground focus-visible:border-foreground transition-colors"
              style={{ width: '20px', height: '20px', background: 'none', color: 'inherit', cursor: 'default', ...f(500, '0.75rem') }}
            >
              i
            </button>

            {/* Semi-transparent + backdrop-blur so only the panel's own area blurs what's behind it. */}
            <div
              className="absolute opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-none"
              style={{
                top: '28px',
                left: 0,
                width: '260px',
                background: 'hsl(var(--background) / 0.72)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '0.9rem 1.1rem',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={f(500, '0.85rem', { marginBottom: '0.6rem' })}>Keyboard Shortcuts</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '0.75rem', rowGap: '0.3rem' }}>
                {HOTKEYS.map(({ key, action }) => (
                  <Fragment key={key}>
                    <span style={f(500, '0.75rem', { opacity: 0.85, whiteSpace: 'nowrap' })}>{key}</span>
                    <span style={f(300, '0.75rem', { opacity: 0.7, whiteSpace: 'nowrap' })}>{action}</span>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <WebampPlayer />
        </main>

        <p
          className="flex-shrink-0"
          style={f(300, '0.85rem', { opacity: 0.65, letterSpacing: '0.01em', padding: '0 2rem 0.75rem', lineHeight: 1.5 })}
        >
          Tip: Right-click on the music player to choose a custom skin or upload your own! Check out{' '}
          <a href="https://skins.webamp.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
            skins.webamp.org
          </a>{' '}
          for more skins. Webamp is a browser reimplementation of the legendary Winamp application. Visit{' '}
          <a href="https://github.com/captbaritone/webamp" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
            github.com/captbaritone/webamp
          </a>{' '}
          for more information.
        </p>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <div className="flex flex-shrink-0 items-center justify-end px-8 py-2.5">
          <ThemeToggleInline />
        </div>
      </div>
    </div>
  );
}
