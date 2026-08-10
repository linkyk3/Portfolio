import { useState } from 'react';
import { Link, useLocation } from 'wouter';

export function GlobalNav() {
  const [isHovered, setIsHovered] = useState(false);
  const [location] = useLocation();

  // Pages with their own header handle navigation inline
  if (location === '/' || location === '/projects' || location === '/music') return null;

  const links = [
    { href: '/', label: 'HOME' },
    { href: '/cv', label: 'CV' },
    { href: '/projects', label: 'PROJECTS' },
    { href: '/creations', label: 'CREATIONS' },
  ];

  return (
    <>
      {/* Site-wide blur overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 pointer-events-none
          ${isHovered ? 'backdrop-blur-[12px] bg-white/10 dark:bg-black/10' : 'backdrop-blur-none bg-transparent'}
        `}
      />

      {/* Nav Container */}
      <div 
        className="fixed top-8 left-8 z-50 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid="nav-container"
      >
        {/* Expanding Links */}
        <div 
          className="overflow-hidden transition-[max-width] duration-200 ease-linear flex items-center h-8"
          style={{ maxWidth: isHovered ? '400px' : '0px' }}
        >
          <div className="flex items-center px-4 gap-6 whitespace-nowrap font-sans font-normal text-xs tracking-widest uppercase bg-background border border-l-0 border-foreground h-full min-w-max">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`transition-colors duration-200 hover:text-accent cursor-pointer ${
                  location === link.href ? 'text-accent' : 'text-foreground'
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
