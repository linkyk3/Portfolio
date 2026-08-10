import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import mixtapesJewel from '@assets/mixtapes_jewel.png';
import mixtapesCD from '@assets/mixtapes_CD.png';
import inspirationJewel from '@assets/inspiration_jewel.png';
import inspirationCD from '@assets/inspiration_CD.png';

import './Music.css';

type MusicChoice = 'mixtapes' | 'inspiration';

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

function SpinningCD({ src, spinning }: { src: string; spinning: boolean }) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateReducedMotion = () => {
      reducedMotionRef.current = media.matches;
    };

    updateReducedMotion();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateReducedMotion);
      return () => media.removeEventListener('change', updateReducedMotion);
    }

    media.addListener(updateReducedMotion);
    return () => media.removeListener(updateReducedMotion);
  }, []);

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const targetSpeed = reducedMotionRef.current ? 0 : (spinning ? 230 : 0);
      const response = spinning ? 7.5 : 2.1;

      speedRef.current += (targetSpeed - speedRef.current) * Math.min(1, response * dt);
      angleRef.current = (angleRef.current + speedRef.current * dt) % 360;

      if (imageRef.current) {
        imageRef.current.style.transform = `rotate(${angleRef.current.toFixed(3)}deg)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [spinning]);

  return <img ref={imageRef} className="music-cd-image" src={src} alt="" loading="lazy" aria-hidden="true" />;
}

export default function Music() {
  const [, setLocation] = useLocation();
  const [activeSpin, setActiveSpin] = useState<MusicChoice | null>(null);

  const handleSelect = (choice: MusicChoice) => {
    setActiveSpin(null);
    setLocation(choice === 'mixtapes' ? '/music/mixtapes' : '/music/inspiration');
  };

  return (
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', background: 'var(--background)' }}>
      <div
        className="music-page-shell"
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
          className="music-header-row flex items-center flex-shrink-0"
          style={{ justifyContent: 'space-between', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}
        >
          <Link href="/" style={f(500, '1.75rem', { letterSpacing: '-0.02em', lineHeight: 1, color: 'inherit', textDecoration: 'none' })}>
            Seppe Goossens
          </Link>

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
            Music
          </div>
        </div>

        <div className="flex-shrink-0 bg-foreground" style={{ height: '2px', marginLeft: '2rem', marginRight: '2rem' }} />

        <main className="music-main-area flex-grow" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <section className="music-selection-area" aria-label="Select music category">
            <button
              className="music-unit"
              onClick={() => handleSelect('mixtapes')}
              onMouseEnter={() => setActiveSpin('mixtapes')}
              onMouseLeave={() => setActiveSpin((prev) => (prev === 'mixtapes' ? null : prev))}
              onFocus={() => setActiveSpin('mixtapes')}
              onBlur={() => setActiveSpin((prev) => (prev === 'mixtapes' ? null : prev))}
              aria-label="Open Mixtapes"
            >
              <img className="music-jewel-image" src={mixtapesJewel} alt="Mixtapes jewel case" loading="lazy" />
              <div className="cd-wrapper">
                <SpinningCD src={mixtapesCD} spinning={activeSpin === 'mixtapes'} />
              </div>
            </button>
            <button
              className="music-unit"
              onClick={() => handleSelect('inspiration')}
              onMouseEnter={() => setActiveSpin('inspiration')}
              onMouseLeave={() => setActiveSpin((prev) => (prev === 'inspiration' ? null : prev))}
              onFocus={() => setActiveSpin('inspiration')}
              onBlur={() => setActiveSpin((prev) => (prev === 'inspiration' ? null : prev))}
              aria-label="Open Inspiration"
            >
              <img className="music-jewel-image" src={inspirationJewel} alt="Inspiration jewel case" loading="lazy" />
              <div className="cd-wrapper">
                <SpinningCD src={inspirationCD} spinning={activeSpin === 'inspiration'} />
              </div>
            </button>
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
