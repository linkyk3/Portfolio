import { useState } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { BookScene } from '@/components/Book3D';
import thesisPdfUrl from '@assets/thesisboek_omslag.pdf';
import thesisFront from '@assets/thesisboek_front.png';
import thesisBack from '@assets/thesisboek_back.png';
import thesisSide from '@assets/thesisboek_side.png';

/* ── Shared primitives ── */
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <line x1="10" y1="1"   x2="10" y2="19" />
    <line x1="2"  y1="5.5" x2="18" y2="14.5" />
    <line x1="18" y1="5.5" x2="2"  y2="14.5" />
  </svg>
);

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

const INDENT = '2rem';
const BASE   = import.meta.env.BASE_URL;

/* ── Project data ─────────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    id:    'p001',
    title: 'De buurtspoorwegen in Brabant',
    desc:  'Een historisch-morfologische lezing van het diffuse verstedelijkingsproces.',
    img:   'thesisboek.png',
    ratio: '4157 / 5906',
    date:  '2025–2026',
  },
  {
    id:    'p002',
    title: 'Design Studio',
    desc:  'Positive Energy Districts in Intermediate Territories: the Case of Pajottenland.',
    img:   'pen-network.jpeg',
    ratio: '4000 / 3000',
    date:  '2026',
  },
  {
    id:    'p004',
    title: 'Ruimtelijk Ontwerp',
    desc:  'Masterplan Ossegem Station.',
    img:   'ruimtelijk-ontwerp.png',
    ratio: '9921 / 7016',
    date:  '2025',
    externalUrl: 'https://github.com/linkyk3/MyWebsite/releases/download/alpha/ruimtelijk-ontwerp.pdf',
  },
  {
    id:    'p003',
    title: 'The Landscape as a Unifying Model?',
    desc:  'The Fietssnelwegen Network and the Friction Between Landscape Urbanism and Engineering.',
    img:   'lu-paper.png',
    ratio: '4157 / 5906',
    date:  '2026',
    externalUrl: 'https://github.com/linkyk3/MyWebsite/releases/download/alpha/lu-paper.pdf',
  },
  {
    id:    'p005',
    title: 'Excursion 2026 MILAN',
    desc:  'VUB MA STeR* – Video by Nette Sneyers and Seppe Goossens.',
    img:   'excursie.png',
    ratio: '2560 / 1440',
    date:  '2026',
    externalUrl: 'https://youtu.be/NPc29MOOhgc?si=uw_RoZn2H2unnMWN',
  },
  {
    id:    'p008',
    title: 'Is Homeownership Reaching its Limits?',
    desc:  "A Historical and Contemporary Review of Path Dependency in Belgium's Housing Landscape.",
    img:   'housing-paper.png',
    ratio: '4961 / 7016',
    date:  '2025',
    externalUrl: 'https://github.com/linkyk3/MyWebsite/releases/download/alpha/housing-paper.pdf',
  },
  {
    id:    'p006',
    title: 'Methoden en Technieken: Ruimtelijke en Morfologische Analyse',
    desc:  'Mahatma Gandhi – Master Stedenbouw en Ruimtelijke Planning.',
    img:   'mt-rm.png',
    ratio: '5906 / 4157',
    date:  '2024',
    externalUrl: 'https://github.com/linkyk3/MyWebsite/releases/download/alpha/mt-rm.pdf',
  },
  {
    id:    'p007',
    title: 'Frictie tussen beleid en beleving',
    desc:  'Over parkeren en het ruimtelijke spanningsveld op de grens tussen Molenbeek en Koekelberg.',
    img:   'mt-sr.png',
    ratio: '4961 / 7016',
    date:  '2024–2025',
    externalUrl: 'https://github.com/linkyk3/MyWebsite/releases/download/alpha/mt-sr.pdf',
  },
] as const;

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/cv' },
];

const PROJECTS_WITH_DETAIL_PAGE = [
  'p001', // ThesisDetail
  'p002', // DesignStudioDetail
];

/* ── Fixed image height (px).  Width is driven by aspect-ratio per card. ── */
const DEFAULT_IMG_H = 420; // px for standard images
const BOOK_IMG_H = 680;    // A larger height specifically for the 3D book
/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function Projects() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* dimStyle — called with the row's own id */
  const dimStyle = (id: string): React.CSSProperties =>
    hoveredId !== null && hoveredId !== id
      ? { filter: 'blur(3px)', opacity: 0.14, transition: 'filter 0.25s ease, opacity 0.25s ease' }
      : { filter: 'none',      opacity: 1,    transition: 'filter 0.25s ease, opacity 0.25s ease' };

  /* globalBlur — header, lines, footer */
  const globalBlur: React.CSSProperties = hoveredId
    ? { filter: 'blur(4px)', opacity: 0.35, transition: 'filter 0.25s ease, opacity 0.25s ease' }
    : { filter: 'none',      opacity: 1,    transition: 'filter 0.25s ease, opacity 0.25s ease' };

  return (
    /* Centering shell */
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      {/* 4:3 column, naturally scrollable */}
      <div
        style={{
          width: '100%',
          maxWidth: 'calc(100vh * 4 / 3)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)',
          color: 'var(--foreground)',
          minHeight: '100vh',
        }}
        data-testid="projects-root"
      >

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        {/*
          Left: name + logo flyout (same as always).
          Right: "SELECTED WORKS" in outlined text — mirrors the
          homepage typographic nav style (transparent fill, stroke outline).
        */}
        <div
          className="mobile-projects-header flex items-center flex-shrink-0 flex-col gap-3 px-5 py-4 md:flex-row md:justify-between md:px-8 md:py-4"
          style={{ ...globalBlur, paddingLeft: INDENT, paddingRight: INDENT, paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          {/* Name + logo */}
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <Link href="/" style={f(500, '1.75rem', { letterSpacing: '-0.02em', lineHeight: 1, color: 'inherit', textDecoration: 'none' })}>
              Seppe Goossens
            </Link>

            <div className="mobile-projects-nav-group relative group flex flex-col items-start md:flex-row md:items-center"
                 style={{ lineHeight: 0, paddingRight: 0, marginRight: 0 }}>
              <div className="hover:text-accent transition-colors" style={{ lineHeight: 0 }}>
                <LogoMark />
              </div>
              <nav
                aria-label="Primary navigation"
                className="mobile-projects-nav absolute flex items-center gap-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 md:opacity-0 md:pointer-events-none"
                style={{ left: '44px', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}
              >
                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={label} href={href} className="text-foreground hover:text-accent transition-colors"
                        style={f(300, '1.15rem', { letterSpacing: '0.01em' })}>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* "SELECTED WORKS" — outlined, right side of header.
              Use CSS var for stroke so it works in both light + dark mode.
              color:transparent + WebkitTextStroke with an explicit var() avoids
              the currentColor-is-transparent trap. */}
          <div className="mobile-projects-title" style={f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', {
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1px var(--color-foreground)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          })}>
            Selected Works
          </div>
        </div>

        {/* ── UPPER HORIZON LINE ──────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-foreground"
             style={{ height: '2px', marginLeft: INDENT, marginRight: INDENT, ...globalBlur }} />

        {/* ── PROJECT LIST ────────────────────────────────────────────── */}
        {/*
          One row per project.
          Left: image (fixed height IMG_H px, width from aspect-ratio).
          Right: title, description, date.
          Divider lines between rows get their own dimStyle so the
          active row's top and bottom lines stay crisp (mirrors previous logic).
        */}
        <div
          className="mobile-projects-list flex flex-col flex-grow"
          style={{ paddingLeft: INDENT, paddingRight: INDENT }}
        >
          {/* Framing border above first row */}

          {PROJECTS.map((p, i) => (
            <div key={p.id}>
              <div
                className="mobile-project-row"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '5rem 0',
                  justifyContent: 'space-between', // Push image left and text right
                  cursor: 'default',
                  ...dimStyle(p.id),
                }}
              >
                {/* Image — fixed height, width from aspect-ratio */}
                <div
                  className="mobile-project-media"
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    // Give the book a wider container (60%) to prevent clipping during rotation
                    flex: p.id === 'p001' ? '0 0 60%' : '0 0 50%',
                    height: p.id === 'p001' ? `${BOOK_IMG_H}px` : `${DEFAULT_IMG_H}px`,
                    aspectRatio: p.id === 'p001' ? undefined : p.ratio,
                  }}
                >
                  {(() => {
                    const hasDetailPage = PROJECTS_WITH_DETAIL_PAGE.includes(p.id);
                    const pdfPath = 'pdf' in p ? `${BASE}${(p as {pdf: string}).pdf}` : undefined;
                    const externalUrl = 'externalUrl' in p ? (p as {externalUrl: string}).externalUrl : undefined;
                    const linkHref = hasDetailPage ? `/projects/${p.id}` : (pdfPath || externalUrl);
                    const isExternal = !hasDetailPage && !!linkHref;

                    const content = p.id === 'p001' ? (
                      <div style={{ transform: hoveredId === p.id ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.3s ease', width: '100%', height: '100%' }}>
                        <BookScene frontImg={thesisFront} backImg={thesisBack} spineImg={thesisSide} />
                      </div>
                    ) : (
                      <img src={`${BASE}works/${p.img}`} alt={p.title} className="project-thumbnail" style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          transition: 'filter 0.3s ease, transform 0.3s ease',
                          transform: hoveredId === p.id ? 'scale(1.03)' : 'scale(1)',
                          filter: hoveredId === p.id ? 'var(--project-drop-shadow-hover)' : 'var(--project-drop-shadow)',
                      }} loading="lazy" />
                    );

                    if (!linkHref) {
                      return <div style={{ width: '100%', height: '100%' }}>{content}</div>;
                    }

                    if (isExternal) {
                      return (
                        <a href={linkHref} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link href={linkHref} style={{ display: 'block', width: '100%', height: '100%' }}>{content}</Link>
                    );
                  })()}
                </div>

                {/* Text block */}
                <div className="mobile-project-text" style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={f(500, 'clamp(1.08rem, 2.6vh, 1.55rem)', { letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: '0.3rem' })}>
                    {p.title}
                  </div>
                  <div style={f(300, 'clamp(0.9rem, 2vh, 1.08rem)', { opacity: 0.6, lineHeight: 1.5, letterSpacing: '0.004em', marginBottom: '0.5rem' })}>
                    {p.desc}
                  </div>
                  <div style={f(300, 'clamp(0.82rem, 1.6vh, 0.95rem)', { opacity: 0.3, letterSpacing: '0.04em', lineHeight: 1 })}>
                    {p.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── LOWER HORIZON LINE ──────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-foreground"
             style={{ height: '2px', marginLeft: INDENT, marginRight: INDENT, ...globalBlur }} />

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <div className="mobile-projects-footer flex flex-shrink-0 items-center px-5 py-2.5 md:px-8" style={globalBlur}>
          <div style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>
            <ThemeToggleInline />
          </div>
        </div>

      </div>
    </div>
  );
}

// Exporting shared constants for the detail page
export { PROJECTS, NAV_LINKS, f, INDENT };
