import { useEffect, useRef, useState } from 'react';
// The butterchurn entrypoint bundles Milkdrop so the visualizer option is available.
import Webamp from 'webamp/butterchurn';
import { getWebampTracks } from '@/config/tracks';

// Every skin in public/skins is offered in Webamp's Options > Skins menu; filenames become display names.
const SKIN_FILES = [
  '2D.wsz',
  'As_Simple_As_It_Gets.wsz',
  'Cold-Pak.wsz',
  'DOSAmp.wsz',
  'Forgive_Me.wsz',
  'kirby_by_ningyotsukai-d60kue9.wsz',
  'Nat-Amp_v01.wsz',
  'NIN_The_Fragile.wsz',
  'obi_wan_rules.wsz',
  'Plain_Skin_2nd_realease.wsz',
  'soundcheck1.wsz',
  'Subaru_Impreza_v1.wsz',
  'The_Ukraine.wsz',
  'We_Are_The_Robots.wsz',
  'Winamp5_Classified_v5.5.wsz',
  'Windamp.wsz',
];

const AVAILABLE_SKINS = SKIN_FILES.map((file) => ({
  url: `/skins/${file}`,
  name: file
    .replace(/\.wsz$/i, '')
    .replace(/-d60kue9$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim(),
}));

// Fisher-Yates - reorders a copy of the array, leaving the original untouched.
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function WebampPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webampRef = useRef<Webamp | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!Webamp.browserIsSupported()) {
      setIsSupported(false);
      return;
    }

    // Guards against React StrictMode's dev-only double-invoke creating two instances.
    if (webampRef.current || !containerRef.current) return;

    const webamp = new Webamp({
      initialTracks: shuffle(getWebampTracks()),
      initialSkin: { url: '/skins/2D.wsz' },
      availableSkins: AVAILABLE_SKINS,
      // Enlarges the Milkdrop visualizer well beyond Webamp's default (extraWidth/Height: 7/12).
      windowLayout: {
        main: { position: { left: 0, top: 0 } },
        equalizer: { position: { left: 0, top: 116 } },
        playlist: {
          position: { left: 0, top: 232 },
          // extraHeight: 18 -> playlist height 116 + 18*29 = 638px, so main+eq+playlist together
          // (232 + 638 = 870px) matches the milkdrop window's height below (116 + 26*29 = 870px).
          size: { extraHeight: 18, extraWidth: 0 },
        },
        milkdrop: {
          position: { left: 275, top: 0 },
          size: { extraHeight: 26, extraWidth: 20 },
        },
      },
    });
    webampRef.current = webamp;
    webamp
      .renderWhenReady(containerRef.current)
      .then(() => webamp.play())
      .catch((err: unknown) => {
        console.error('Webamp failed to render:', err);
        setLoadError(true);
      });

    return () => {
      webamp.dispose();
      webampRef.current = null;
    };
  }, []);

  if (!isSupported) {
    return (
      <p style={{ textAlign: 'center', opacity: 0.7 }}>
        Your browser doesn't support the features Webamp needs to run.
      </p>
    );
  }

  if (loadError) {
    return (
      <p style={{ textAlign: 'center', opacity: 0.7 }}>
        Couldn't load the music player right now. Try refreshing the page.
      </p>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
