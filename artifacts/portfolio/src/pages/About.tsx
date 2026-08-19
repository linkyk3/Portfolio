import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';

interface ChangelogEntry {
  sha: string;
  date: string;
  summary: string;
}

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

import CHANGELOG_RAW from '@/changelog.json?raw';

export default function About() {
  const [hovered, setHovered] = useState(false);
  const changelogData = JSON.parse(CHANGELOG_RAW);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <div
        className="h-full overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 'calc(100vh * 4 / 3)',
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
              Seppe Goossens
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
            About
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="flex-grow min-h-0 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
          <div className="flex min-h-0 flex-col">
            <div className="max-w-3xl text-left">
              <p className="text-foreground/80 text-sm md:text-[15px] leading-7">
                I’ve never felt much urge to share every detail of my life on social media, or in real life, for that matter. Instead, I wanted a quiet space (on the web) that is entirely my own: a digital collection of the things that matter to me, shared only with the people who show interest.
              </p>

              <p className="mt-5 text-foreground/80 text-sm md:text-[15px] leading-7">
                I’ve always been somewhat of a hoarder because I hate letting things go. But unlike real life, a digital space has no physical limits, so I can hoard as much as I want :).
              </p>

              <p className="mt-5 text-foreground/80 text-sm md:text-[15px] leading-7">
                I put off the idea of creating a personal website for years. But with the recent evolvement of AI tools, the barrier to building one got lower and lower. Eventually, as I started my job search, the time was finally right.
              </p>

              <p className="mt-5 text-foreground/80 text-sm md:text-[15px] leading-7">
                This site is a home for both my professional work and personal projects, things I’m proud of, experiments I’m running, and hobbies that keep me curious. It’s a snapshot of what’s going on inside my head and what’s keeping me busy. You’ll find a mix of English and Dutch throughout the site, depending on whichever language felt right at the time.
              </p>

              <p className="mt-5 text-foreground/80 text-sm md:text-[15px] leading-7">
                There is no grand end goal here. It’s a perpetual work in progress, and always will be. Maybe I’ll stop updating it one day if I feel like it, maybe not, who knows?
              </p>

              <p className="mt-5 text-foreground/80 text-sm md:text-[15px] leading-7">
                Thanks for stopping by.
              </p>

              <p className="mt-1 text-foreground/60 text-xs md:text-sm leading-6">
                11/08/2026
              </p>
            </div>

            <div className="mt-auto mb-2 text-left text-foreground/65 text-xs md:text-sm leading-6">
              <p>
                The site was originally made using Replit, but after discovering how quickly the credits burned through, I ported it over to a GitHub repo to work on locally using VS Code and the Gemini plugin. Gemini worked alright, but it took a while to load and struggled to understand the full scope of the webpage and its separate parts. I eventually switched over to GitHub Copilot, which has served me well so far.
              </p>
              <p className="mt-4">
                The site is hosted via Vercel and uses Cloudfare R2 for storage.
              </p>
            </div>
          </div>

          <section aria-label="Project changelog" className="changelog-scroll min-h-0 h-full px-1 md:justify-self-end w-full max-w-2xl" style={{ overflowY: 'auto' }}>
            <p className="text-right text-foreground/75 text-sm md:text-base font-medium tracking-[0.08em]">Changelog</p>
            <div className="mt-3 flex flex-col gap-2.5 pb-2">
              {changelogData.map((entry: ChangelogEntry) => (
                <div key={entry.sha} className="text-right">
                  <p className="text-foreground/70 text-[11px] md:text-xs leading-5">
                    <span className="font-mono">{entry.date}</span>
                    <span className="mx-2 text-foreground/40">/</span>
                    <span className="font-mono text-foreground/60">{entry.sha}</span>
                  </p>
                  <p className="text-foreground/75 text-xs md:text-sm leading-5">{entry.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <div className="flex flex-shrink-0 items-center justify-end px-8 py-2.5">
          <ThemeToggleInline />
        </div>
      </div>
    </div>
  );
}
