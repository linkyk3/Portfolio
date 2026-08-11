import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music',          href: '/creations' },
  { label: 'Visualizations', href: '/creations' },
  { label: 'Blog',           href: '/creations' },
  { label: 'About',          href: '/about'     },
];

const LogoMark = () => (
  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <line x1="10" y1="1" x2="10" y2="19" />
    <line x1="2" y1="5.5" x2="18" y2="14.5" />
    <line x1="18" y1="5.5" x2="2" y2="14.5" />
  </svg>
);

const ArrowUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleScroll() {
      // Show buttons when user has scrolled down a bit
      setIsVisible(window.scrollY > 200);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buttonClass = `fixed z-50 p-2 rounded-full text-foreground/80 hover:text-accent transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`;

  return (
    <>
      <div
        className={`fixed top-6 left-6 z-50 group transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ paddingRight: '320px', marginRight: '-320px' }}
      >
        {/* Navigation Button */}
        <button
          className="p-2 rounded-full text-foreground/80 hover:text-accent transition-colors"
          onClick={() => setLocation('/')}
          aria-label="Go to home page"
          data-testid="floating-nav-toggle"
        >
          <LogoMark />
        </button>

        {/* Navigation Menu */}
        <nav
          className="absolute top-[8px] left-[40px] flex flex-col gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3 py-1 text-foreground hover:text-accent transition-colors text-sm whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Scroll to Top Button */}
      <button
        className={`${buttonClass} bottom-16 left-6`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        data-testid="scroll-to-top"
      >
        <ArrowUp />
      </button>
    </>
  );
}