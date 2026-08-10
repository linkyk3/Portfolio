import React, { lazy, Suspense, Fragment } from 'react';
import { Link, useRoute } from 'wouter';

import ThesisDetail from './ThesisDetail';
import DesignStudioDetail from './DesignStudioDetail';
import PdfDetail from './PdfDetail';
import { PROJECTS, NAV_LINKS, f, INDENT } from './Projects';
import NotFound from './not-found';
import { ThemeToggleInline } from '@/components/ThemeToggle';

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <line x1="10" y1="1"   x2="10" y2="19" />
    <line x1="2"  y1="5.5" x2="18" y2="14.5" />
    <line x1="18" y1="5.5" x2="2"  y2="14.5" />
  </svg>
);

export const Image = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />
);

export const ImageGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">{children}</div>
);

export const ImageCollage = ({ images }: { images: string[] }) => (
  <div className="grid grid-cols-2 gap-4 my-8">
    {images.map((src, i) => (
      <div key={i} className="w-full">
        <img src={src} alt={`Collage image ${i + 1}`} className="w-full h-auto object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" />
      </div>
    ))}
  </div>
);

const projectComponentMap: { [key: string]: React.LazyExoticComponent<() => React.JSX.Element> | (() => React.JSX.Element) } = {
  'p001': ThesisDetail,
  'p002': DesignStudioDetail,
};

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:id');
  const project = PROJECTS.find((p) => p.id === params?.id);

  if (!project) { 
    return <NotFound />;
  }

  const ProjectComponent = params?.id ? projectComponentMap[params.id] : null;
  const pdfPath = typeof project !== 'undefined' && 'pdf' in project && typeof project.pdf === 'string'
    ? project.pdf
    : '';
  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
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
      >
        {/* Header */}
        <div
          className="mobile-project-detail-header flex items-center flex-shrink-0 flex-col gap-3 px-5 py-4 md:flex-row md:justify-between md:px-8 md:py-4"
          style={{ paddingLeft: INDENT, paddingRight: INDENT, paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <Link href="/" style={f(500, '1.75rem', { letterSpacing: '-0.02em', lineHeight: 1, color: 'inherit', textDecoration: 'none' })}>
              Seppe Goossens
            </Link>
            <div className="mobile-project-detail-nav-group relative group flex flex-col items-start md:flex-row md:items-center" style={{ lineHeight: 0, paddingRight: 0, marginRight: 0 }}>
              <div className="hover:text-accent transition-colors" style={{ lineHeight: 0 }}><LogoMark /></div>
              <nav aria-label="Primary navigation" className="mobile-project-detail-nav absolute flex items-center gap-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 md:opacity-0 md:pointer-events-none" style={{ left: '44px', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={label} href={href} className="text-foreground hover:text-accent transition-colors" style={f(300, '1.15rem', { letterSpacing: '0.01em' })}>{label}</Link>
                ))}
              </nav>
            </div>
          </div>
          <Link href="/projects" style={f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', { letterSpacing: '-0.02em', lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px var(--color-foreground)', textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none', textDecoration: 'none' })}>
            Selected Works
          </Link>
        </div>

        {/* Upper Horizon Line */}
        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: INDENT, marginRight: INDENT }} />

        {/* Main Content */}
        <main className="mobile-project-detail-main flex-grow flex flex-col" style={{ marginLeft: INDENT, marginRight: INDENT, marginTop: '2rem', marginBottom: '2rem' }}>
          <Suspense fallback={<div className="p-8">Loading project...</div>}>
            {ProjectComponent ? <ProjectComponent /> :
             pdfPath ? <PdfDetail pdfPath={pdfPath} downloadPath={pdfPath} /> : <NotFound />}
          </Suspense>
        </main>

        {/* Lower Horizon Line */}
        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: INDENT, marginRight: INDENT }} />

        {/* Footer */}
        <div className="mobile-project-detail-footer flex flex-shrink-0 items-center px-5 py-2.5 md:px-8">
          <div style={{ marginLeft: 'auto', marginRight: '0.5rem' }}>
            <ThemeToggleInline />
          </div>
        </div>
      </div>
    </div>
  );
} 