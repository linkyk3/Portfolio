import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { BLOG_POSTS } from './blogPosts.data';

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

export default function Blog() {
  // No post is selected by default - the reader picks one from the index.
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePost = BLOG_POSTS.find((post) => post.id === activeId) ?? null;

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 'calc(100vh * 4 / 3)',
          height: '100vh',
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
            Blog
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="flex-grow flex" style={{ minHeight: 0, width: '100%' }}>
          <aside className="flex-shrink-0 flex flex-col" style={{ minHeight: 0, padding: '1.5rem 1.5rem 1.5rem 2rem' }}>
            <p style={f(300, '0.95rem', { lineHeight: 1.6, opacity: 0.85, marginBottom: '1.25rem', maxWidth: '260px' })}>
              Notes, write-ups, and whatever else felt worth writng down.
            </p>

            <div className="bg-foreground flex-shrink-0" style={{ height: '2px', marginBottom: '1rem' }} />

            <div style={f(500, '0.85rem', { textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6, marginBottom: '0.75rem' })}>
              Index
            </div>

            <div style={{ overflowY: 'auto', minHeight: 0, flexGrow: 1 }}>
              {BLOG_POSTS.map((post) => {
                const isActive = post.id === activePost?.id;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setActiveId(post.id)}
                    className="relative block hover:text-accent transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.35rem 0', textAlign: 'left' }}
                  >
                    {/* Invisible bold copy reserves the width so the sidebar doesn't shift when a post becomes active. */}
                    <span aria-hidden="true" style={f(700, '0.95rem', { visibility: 'hidden', whiteSpace: 'nowrap', display: 'block' })}>
                      {post.title} &ndash; {post.date}
                    </span>
                    <span
                      style={f(isActive ? 700 : 300, '0.95rem', {
                        position: 'absolute',
                        inset: 0,
                        opacity: isActive ? 1 : 0.7,
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {post.title} &ndash; {post.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="bg-foreground flex-shrink-0" style={{ width: '2px' }} />

          <div className="changelog-scroll" style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '2rem 3rem' }}>
            {activePost ? (
              <>
                <div className="flex items-baseline gap-3" style={{ marginBottom: '1.5rem' }}>
                  <h1
                    style={f(700, 'clamp(1.5rem, 3.5vw, 2.35rem)', {
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                      color: 'inherit',
                    })}
                  >
                    {activePost.title}
                  </h1>
                  <span style={f(300, '0.9rem', { opacity: 0.55, whiteSpace: 'nowrap' })}>{activePost.date}</span>
                </div>
                {/* Post content is authored in blogPosts.data.ts, not user input, so this is safe. */}
                <div style={f(300, '1.2rem', { lineHeight: 1.75, textAlign: 'justify' })} dangerouslySetInnerHTML={{ __html: activePost.content }} />
              </>
            ) : (
              <div className="flex items-center justify-center" style={{ height: '100%' }}>
                <p style={f(300, '1rem', { opacity: 0.55 })}>Choose a note on the left</p>
              </div>
            )}
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
