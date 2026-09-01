import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { FloatingNav } from '@/components/FloatingNav';
import jewelcaseClubbyGrooves from '@assets/5_clubbygrooves_jewelcase.png';
import cdClubbyGrooves from '@assets/5_clubbygrooves_cd.png';
import jewelcaseAmbientGrooves from '@assets/4_ambientgrooves_jewel.png';
import cdAmbientGrooves from '@assets/4_ambientgrooves_cd.png';
import jewelcaseOutboundSignal from '@assets/3_outboundsignal_jewel.png';
import cdOutboundSignal from '@assets/3_outboundsignal_cd.png';
import jewelcaseTwo from '@assets/2_jewel.png';
import cdTwo from '@assets/2_cd.png';
import jewelcaseOne from '@assets/1_jewel.png';
import cdOne from '@assets/1_cd.png';

import './Mixtapes.css';

type Track = {
  number: string;
  artist: string;
  track: string;
};

type Mixtape = {
  id: string;
  title: string;
  youtubeUrl: string;
  jewelcaseImg: string;
  cdImg: string;
  tracklist: Track[];
};

const FIVE_CLUBBY_GROOVES_TRACKLIST: Track[] = [
  { number: '01', artist: 'DJ Phenix', track: 'Do U Luv Me (Original)' },
  { number: '02', artist: 'Hush Hush', track: 'Groove Down!' },
  { number: '03', artist: 'Garrett David', track: 'Emergency feat. Simone Green' },
  { number: '04', artist: 'Dxnby', track: 'Skyline' },
  { number: '05', artist: 'OZZIE GUVEN', track: 'Bassline Pumping' },
  { number: '06', artist: 'Mance', track: 'Beat 93' },
  { number: '07', artist: 'DJ Cosworth', track: 'That Funk (Mellow Mix)' },
  { number: '08', artist: 'Jamback', track: 'FEEL THE MUSIC' },
  { number: '09', artist: 'The Trip', track: 'A Bit Spooky' },
  { number: '10', artist: 'Garrett David', track: 'Mi Casa feat. Maudi' },
  { number: '11', artist: 'Noah Peters', track: "Our Love (Donny's Dub)" },
  { number: '12', artist: 'Sulphur', track: 'Inna Feelin' },
  { number: '13', artist: 'Mance', track: 'Open Your Mind (Original Mix)' },
  { number: '14', artist: 'Frazer Ray', track: 'Groove Groove (Extended Mix)' },
  { number: '15', artist: 'Human Movement & Soul Wun', track: 'Phone Line Crew' },
  { number: '16', artist: 'LUCA X', track: 'Serious dubwise' },
  { number: '17', artist: 'Lennie De Ice', track: "We Are I.E. (Horsepower's Return To E Remix)" },
];

const FOUR_AMBIENT_GROOVES_TRACKLIST: Track[] = [
  { number: '01', artist: 'Kruder & Dorfmeister', track: 'Boogie Woogie' },
  { number: '02', artist: 'Sian', track: 'Palmera' },
  { number: '03', artist: 'King Kooba', track: 'Fooling Myself' },
  { number: '04', artist: 'Thunderball', track: 'The Moon, The Sky' },
  { number: '05', artist: 'Roni Size & Reprazent', track: "Heroes (Kruder's Long Loose Bossa - Edit)" },
  { number: '06', artist: 'Sub System Crew', track: 'Conscious' },
  { number: '07', artist: 'Thievery Corporation', track: 'La Femme Parallel' },
  { number: '08', artist: 'Pig&Dan', track: 'Friday Freaks' },
  { number: '09', artist: 'Trio Eletrico', track: 'Mansad' },
  { number: '10', artist: 'Aromabar', track: 'Space Patrol' },
  { number: '11', artist: 'Eighty Mile Beach', track: 'There Are No Right Angles Found in Nature (Thievery Corporation Remix)' },
  { number: '12', artist: 'Thievery Corporation', track: 'It Takes A Thief' },
  { number: '13', artist: 'Depeche Mode', track: 'Useless (The Kruder + Dorfmeister Session)' },
];

const THREE_OUTBOUND_SIGNAL_TRACKLIST: Track[] = [
  { number: '01', artist: 'Special Request & Tim Reaper', track: 'Elysian Fields (Tim Reaper Remix)' },
  { number: '02', artist: 'Da Intalex', track: 'Nice & Slow' },
  { number: '03', artist: 'Harmony', track: 'Who Are You' },
  { number: '04', artist: 'Janaway', track: 'Till Dawn' },
  { number: '05', artist: 'Response & Tim Reaper', track: 'For The Headstrong' },
  { number: '06', artist: 'Cheetah', track: 'Romeo' },
  { number: '07', artist: 'DJ Crystl', track: 'Experience' },
  { number: '08', artist: 'Harmony', track: 'Boo' },
  { number: '09', artist: 'Fez The Kid', track: 'The Curse' },
  { number: '10', artist: 'Cheff The Boy', track: 'Is That U' },
  { number: '11', artist: 'Worsleyy', track: 'Start To Prey' },
  { number: '12', artist: 'Conrad Subs', track: 'Leave Dem' },
  { number: '13', artist: 'Orwell', track: 'To Shape The Future (Cheetah Remix)' },
  { number: '14', artist: 'Dwarde, Tim Reaper', track: 'Realisation' },
  { number: '15', artist: 'Cheetah', track: 'Freaks' },
  { number: '16', artist: 'Janaway', track: 'City Lights' },
  { number: '17', artist: 'Tom Oakley', track: "You're Not Alone" },
];

const TWO_TRACKLIST: Track[] = [
  { number: '01', artist: 'Orca', track: 'Intalect (Promised Land VIP Mix)' },
  { number: '02', artist: 'NCA Experience', track: 'Spread Luv (Intelligent Dub Remix)' },
  { number: '03', artist: '88.3', track: 'Wishing On a Star (Rogue Unit Dub Mix)' },
  { number: '04', artist: 'Atlas', track: 'Drifting Thru The Galaxy' },
  { number: '05', artist: 'City Connection', track: 'Impact' },
  { number: '06', artist: 'Koda', track: 'Crisis' },
  { number: '07', artist: 'Harmony', track: 'Burn it Down' },
  { number: '08', artist: 'Dr. S. Gachet', track: 'Calling' },
  { number: '09', artist: 'Double T.', track: 'Nightwave' },
];

const ONE_TRACKLIST: Track[] = [
  { number: '01', artist: 'Photek', track: "T'Raenon (Original Mix)" },
  { number: '02', artist: 'Organic', track: 'Procedural Blends' },
  { number: '03', artist: 'Hidden Agenda', track: 'The Sun' },
  { number: '04', artist: '4 Hero', track: 'Universal Love (Nookie Mix)' },
  { number: '05', artist: 'Gangster Sound', track: 'Whats Going On (Jazz Mix)' },
  { number: '06', artist: 'Lemon D', track: 'Going Gets Tough' },
  { number: '07', artist: 'DJ Trace', track: 'Miles High' },
  { number: '08', artist: 'Personèlle', track: 'Rebound (Nookie Mix)' },
  { number: '09', artist: 'Voyager', track: 'Possessions (Original Vocal Mix)' },
];

// Mixes #1-#4 are placeholders that reuse #5's assets/tracklist/link until real content is ready.
const MIXTAPES: Mixtape[] = [
  {
    id: '1',
    title: '#5 Clubby Grooves',
    youtubeUrl: 'https://youtu.be/DbkLQaUJmiw',
    jewelcaseImg: jewelcaseClubbyGrooves,
    cdImg: cdClubbyGrooves,
    tracklist: FIVE_CLUBBY_GROOVES_TRACKLIST,
  },
  {
    id: '2',
    title: '#4 Ambient Grooves',
    youtubeUrl: 'https://youtu.be/uNR0soWBLJ4',
    jewelcaseImg: jewelcaseAmbientGrooves,
    cdImg: cdAmbientGrooves,
    tracklist: FOUR_AMBIENT_GROOVES_TRACKLIST,
  },
  {
    id: '3',
    title: '#3 Outbound Signal',
    youtubeUrl: 'https://youtu.be/K72oL-gBAM0',
    jewelcaseImg: jewelcaseOutboundSignal,
    cdImg: cdOutboundSignal,
    tracklist: THREE_OUTBOUND_SIGNAL_TRACKLIST,
  },
  {
    id: '4',
    title: '#2 ',
    youtubeUrl: 'https://youtu.be/us58YQIjdQc',
    jewelcaseImg: jewelcaseTwo,
    cdImg: cdTwo,
    tracklist: TWO_TRACKLIST,
  },
  {
    id: '5',
    title: '#1 ',
    youtubeUrl: 'https://youtu.be/1olhlBdnka4',
    jewelcaseImg: jewelcaseOne,
    cdImg: cdOne,
    tracklist: ONE_TRACKLIST,
  },
];

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

function MixtapeCard({ item, isActive, isBlurred, onHoverStart, onHoverEnd, onFocusStart }: {
  item: Mixtape;
  isActive: boolean;
  isBlurred: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onFocusStart: () => void;
}) {
  return (
    <section className="mixtape-row">
      <a
        className={`mixtape-card${isActive ? ' is-active' : ''}${isBlurred ? ' is-blurred' : ''}`}
        href={item.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Play ${item.title} on YouTube`}
        onFocus={onFocusStart}
        onBlur={onHoverEnd}
      >
        <div className="mixtape-tracklist">
          <h3 className="mixtape-title">{item.title}</h3>
          <ol className="mixtape-track-list">
            {item.tracklist.map((entry) => (
              <li className="mixtape-track" key={`${item.id}-${entry.number}`}>
                <span className="mixtape-track-num">{entry.number}</span>
                <span className="mixtape-track-text">
                  <span className="mixtape-track-artist">{entry.artist}</span>
                  <span className="mixtape-track-title">{entry.track}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mixtape-art-box">
          {/* Hover trigger is the exact footprint of the jewelcase, nothing wider or taller */}
          <div className="mixtape-hover-zone" onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
            <div className="mixtape-jewel-wrap">
              <img className="mixtape-jewel-image" src={item.jewelcaseImg} alt={`${item.title} jewel case`} loading="lazy" />
            </div>
          </div>
          <div className="mixtape-cd-wrap">
            <img className="mixtape-cd-image" src={item.cdImg} alt="" aria-hidden="true" loading="lazy" />
          </div>
        </div>
      </a>
    </section>
  );
}

export default function Mixtapes() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Ignore the "phantom" mouseenter fired on mount when the cursor already sits over a card
  // (carried over from the previous page) - only arm hover once the mouse actually moves here.
  const hasMouseMovedRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = () => {
      hasMouseMovedRef.current = true;
      window.removeEventListener('mousemove', handleMouseMove);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHoverStart = (id: string) => {
    if (!hasMouseMovedRef.current) return;
    setHoveredId(id);
  };

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <FloatingNav />
      <div
        className="mixtapes-page-shell"
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
            Mixtapes
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="mixtapes-main flex-grow">
          {MIXTAPES.map((item) => (
            <MixtapeCard
              key={item.id}
              item={item}
              isActive={hoveredId === item.id}
              isBlurred={hoveredId !== null && hoveredId !== item.id}
              onHoverStart={() => handleHoverStart(item.id)}
              onHoverEnd={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
              onFocusStart={() => setHoveredId(item.id)}
            />
          ))}
        </main>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <div className="flex flex-shrink-0 items-center justify-end px-8 py-2.5">
          <ThemeToggleInline />
        </div>
      </div>
    </div>
  );
}
