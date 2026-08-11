import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

interface WorkInProgressProps {
  title: string;
}

export default function WorkInProgress({ title }: WorkInProgressProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 'calc(100vh * 4 / 3)',
          minHeight: '100vh',
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
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
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
                {[
                  { label: 'Selected Works', href: '/projects' },
                  { label: 'Music', href: '/music' },
                  { label: 'Visualizations', href: '/visualizations' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'About', href: '/about' },
                ].map(({ label, href }) => (
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

          <div style={f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', {
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1px var(--color-foreground)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          })}>
            {title}
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="flex-grow flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-2xl text-center">
            <p
              style={f(700, 'clamp(2.5rem, 6vw, 4rem)', {
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: 'transparent',
                WebkitTextStroke: '1px var(--color-foreground)',
                marginBottom: '1rem',
              })}
            >
              Work in progress
            </p>
          </div>
        </main>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <div className="flex flex-shrink-0 items-center justify-end px-8 py-2.5">
          <ThemeToggleInline />
        </div>
      </div>
    </div>
  );
}
