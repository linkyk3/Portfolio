import { Link } from 'wouter';
import { getGetMusicCollectionQueryKey, useGetMusicCollection } from '@workspace/api-client-react';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { FloatingNav } from '@/components/FloatingNav';

import './MusicCollection.css';

type MusicCollectionItem = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  format: string;
  label: string;
  coverImage: string;
  addedAt: string;
  discogsUrl: string;
};

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

function CollectionCard({ item }: { item: MusicCollectionItem }) {
  const compactFormat = item.format.toLowerCase().includes('cd') ? 'CD' : 'Vinyl';
  const fallbackQuery = encodeURIComponent(`${item.artist} ${item.title}`);
  const rawDiscogsUrl = (item.discogsUrl ?? '').trim();
  const discogsUrl = rawDiscogsUrl
    ? (rawDiscogsUrl.startsWith('http') ? rawDiscogsUrl : `https://www.discogs.com${rawDiscogsUrl.startsWith('/') ? rawDiscogsUrl : `/${rawDiscogsUrl}`}`)
    : `https://www.discogs.com/search/?q=${fallbackQuery}`;

  return (
    <article className="music-collection-card">
      <a
        className="music-collection-cover-wrap"
        href={discogsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${item.title} on Discogs`}
      >
        <img
          className="music-collection-cover"
          src={item.coverImage}
          alt={`${item.title} album cover`}
          loading="lazy"
        />
      </a>
      <div className="music-collection-body">
        <div className="music-collection-head-row">
          <div className="music-collection-copy">
            <h3 className="music-collection-title">{item.title}</h3>
            <p className="music-collection-artist">{item.artist}</p>
          </div>
          <div className="music-collection-side-meta" aria-label="Release metadata">
            <span className="music-collection-side-item">{item.year ?? 'Unknown Year'}</span>
            <span className="music-collection-side-item">{compactFormat}</span>
          </div>
        </div>
        <p className="music-collection-label">{item.label}</p>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="music-collection-card music-collection-skeleton" aria-hidden="true">
      <div className="music-collection-cover-wrap" />
      <div className="music-collection-body">
        <div className="music-collection-skeleton-line music-collection-skeleton-title" />
        <div className="music-collection-skeleton-line" />
        <div className="music-collection-skeleton-tags">
          <div className="music-collection-skeleton-tag" />
          <div className="music-collection-skeleton-tag" />
          <div className="music-collection-skeleton-tag" />
        </div>
      </div>
    </div>
  );
}

export default function MusicCollection() {
  const { data, isPending, isError, error, refetch } = useGetMusicCollection({
    query: {
      queryKey: getGetMusicCollectionQueryKey(),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const recentAdditions = data?.recentAdditions ?? [];
  const fullCollection = data?.fullCollection ?? [];
  const fullCollectionWithoutRecent = fullCollection.slice(Math.min(10, fullCollection.length));

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <FloatingNav />
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

            <div className="relative group flex items-center" style={{ lineHeight: 0, paddingRight: '220px', marginRight: '-220px' }}>
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
            Collection
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="music-collection-main">
          <section className="music-collection-section" aria-labelledby="recent-additions-title">
            <div className="music-collection-section-head">
              <h2 id="recent-additions-title" className="music-collection-section-title">
                Recent Additions
              </h2>
              {!isPending && !isError && (
                <p className="music-collection-count">{recentAdditions.length} releases</p>
              )}
            </div>

            <div className="music-collection-grid" role="list">
              {isPending && Array.from({ length: 10 }).map((_, index) => <CardSkeleton key={`recent-skeleton-${index}`} />)}
              {isError && (
                <div className="music-collection-error music-collection-error-inline" role="alert">
                  <p>
                    {error instanceof Error
                      ? error.message
                      : 'Could not load recent additions right now.'}
                  </p>
                </div>
              )}
              {!isPending && !isError && recentAdditions.map((item) => <CollectionCard key={`recent-${item.id}`} item={item} />)}
            </div>
          </section>

          <section className="music-collection-section" aria-labelledby="full-collection-title">
            <div className="music-collection-section-head">
              <h2 id="full-collection-title" className="music-collection-section-title">
                Full Collection
              </h2>
              {!isPending && !isError && (
                <p className="music-collection-count">{fullCollectionWithoutRecent.length} releases</p>
              )}
            </div>

            {isError ? (
              <div className="music-collection-error" role="alert">
                <p>
                  {error instanceof Error
                    ? error.message
                    : 'Could not load your Discogs collection right now.'}
                </p>
                <button type="button" onClick={() => refetch()} className="music-collection-retry">
                  Try again
                </button>
              </div>
            ) : (
              <div className="music-collection-grid" role="list">
                {isPending && Array.from({ length: 20 }).map((_, index) => <CardSkeleton key={`full-skeleton-${index}`} />)}
                {!isPending && fullCollectionWithoutRecent.map((item) => <CollectionCard key={item.id} item={item} />)}
              </div>
            )}
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
