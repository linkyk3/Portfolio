// Dedicated base for audio playback: the R2 bucket's public r2.dev domain doesn't return
// CORS headers, which silently mutes Webamp's Web Audio graph. This Worker proxies the same
// bucket and adds `Access-Control-Allow-Origin: *`, so audio must go through it instead of r2Url().
// Uses its own env var (not VITE_PUBLIC_ASSETS_URL) - that one is already set to the r2.dev
// domain for images, and would otherwise silently shadow this fallback.
const MUSIC_PROXY_BASE_URL =
  import.meta.env.VITE_MUSIC_PROXY_URL || 'https://media-proxy.seppe-goossens123.workers.dev';

const MUSIC_PLAYER_PREFIX = 'music/music-player';

/** Encodes the filename so spaces/quotes/parens don't break playback. */
export const buildTrackUrl = (filename: string) =>
  `${MUSIC_PROXY_BASE_URL}/${MUSIC_PLAYER_PREFIX}/${encodeURIComponent(filename)}`;

// Every filename currently in the R2 bucket's music/music-player/ folder. To add a track,
// upload it to the bucket and add its exact filename here - artist/title are derived
// automatically (see parseTrackName below), no manual metadata entry needed.
export const TRACKS: string[] = [
  '(03) [Young American Primitive] Sunrise.mp3',
  '01 - Babyxsosa - Southside to South Pasadena.mp3',
  '01 - Before Today.mp3',
  '01 - David Holmes - Gone (K&D Session).mp3',
  '01 - Earth Volume Two - Rollercone - Fictions.mp3',
  '01 - Ef.mp3',
  "01 - Heaven's Gonna Burn Your Eyes.mp3",
  '01 - Journey Inwards.mp3',
  '01 - Lamb - Lusty.mp3',
  '01 - Marching the Hate Machines (Into the Sun).mp3',
  '01 - Massive Attack - Protection - Protection.mp3',
  "01 - Roni Size  Reprazent - Heroes (Kruder's Long Loose Bossa).mp3",
  "01 - T'Raenon (Original Mix).mp3",
  '01 - There Are No Right Angles Found In Nature.mp3',
  '01 Fez the Kid - Some Feeling.mp3',
  '01 Future Bound - The Ephemeris.mp3',
  '01 Secret Liaisons.mp3',
  '01-jonny_l-2_of_us.mp3',
  '01. Big Bud - Source of Inspiration.mp3',
  '01. Big Bud - Temptation.mp3',
  '01. DJ Jedi - Close Your Eyes.mp3',
  '01. DJ Trace - Miles High.mp3',
  '01. JMJ & Richie - Montana.mp3',
  '01. King Kooba - Fooling Myself (Gabriel Rene Mix)-1.mp3',
  '01. Same People - Dangerous.mp3',
  '01. Sundress.mp3',
  '01. The Starseeds - Parallel Life.mp3',
  '01•01 - DJ Peshay - Psychosis.mp3',
  '02 - Forme - New Element.mp3',
  '02 - Media.mp3',
  '02 - Meu Nêgo.mp3',
  '02 - Sparkling Beauty.mp3',
  '02 Complexities.mp3',
  '02 I Need (Speed).mp3',
  "02 Ingrid Schroeder - Paint You Blue (Peshay's After Hours Mix).mp3",
  '02. Doc Scott - Blue Skies (2015 Remaster).mp3',
  '02. Fugitive - Substance.mp3',
  '02. Omni Trio - Together (VIP Mix).mp3',
  '02. Subjects - Summer is Gone.mp3',
  '02. Trinity (19) - Lost Cities.mp3',
  '02. UKO - Do Yourself Some Good.mp3',
  '03 - Dirt And Grime.mp3',
  '03 - Distant Space.mp3',
  '03 - In My Heart.mp3',
  '03 - Revolution Solution.mp3',
  '03. DJ Sofa - Skatta.mp3',
  '04 - 4hero - Universal Love (Nookie mix).mp3',
  '04 - Nookie & Larry Heard - Mystical People.mp3',
  "04 - Rain Down (Purelink's Say Less Mix).mp3",
  '04 - Sola Sistim.mp3',
  '04. Cavestar & Moore - Say The Word.mp3',
  '05 - Big Bud - High Times.mp3',
  '05 - Catch Her Flame.mp3',
  '05 - Walking Wounded.mp3',
  "05 Feel Like Makin' Love.mp3",
  '05-merker_-_hecitate_gone_mad-tr.mp3',
  '05.Modemellow-Plasma Surface.mp3',
  '0523 - Aquasky - Opaque (Remaster).mp3',
  '05_Bjork - I Miss You (Dobie Rub Part One) (Sunshine Mix).mp3',
  '06 - Amerimacka.mp3',
  '06 - Jazzed Out (Remix).mp3',
  '06 - Little Brother.mp3',
  "06_longers_and_forces_of_nature_-_natures_way.mp3",
  '07 - Another Woman.mp3',
  '07 - Depeche Mode - Useless (K&D Session).mp3',
  '07 - Just Intelligence - Play the Music.mp3',
  '07 - The Tree Knows Everything (Clean Edit).mp3',
  '07 Photek-T’Raenon.mp3',
  '07. A Way of Life.mp3',
  '07. So Com Voce.mp3',
  '07. omni trio - twin town karaoke.mp3',
  '07_nookie_-_the_world_is_a_ghetto_(nookie_remix).mp3',
  '08 - A Guy Called Gerald Feat. Louise Rhodes - Humanity.mp3',
  "08 - Big Bud - Ellen's Song.mp3",
  '08 Hunch - Visible From Space (Aquasky remix).mp3',
  '08 Lost Her (2011 Re-Mastered Mix).mp3',
  '08. Samba Tranquille.mp3',
  '09 - Big Bud - Stone Groove.mp3',
  '09 - Elak - Remember Me.mp3',
  '09 - Mc Conrad - Words 2b Heard Meets Planetary Funk Alert.mp3',
  '09.Tayla, Aquarious - Soul Searching (Original Mix).mp3',
  '1-03. Peshay - The Real Thing (90 BPM version).mp3',
  '1.10 - Till the End.mp3',
  "10 - Earl Grey - My Soul's on Ice.mp3",
  '10 - Furney - Escape To Freedom.mp3',
  '10 Project 23 - Pleasure & The Pain (Peshay Remix).mp3',
  '10. La Femme Parallel.mp3',
  '10. Maximum Style & JB Rose - Admit to Love.mp3',
  '10. My Life.mp3',
  '10. PFM - The Western.mp3',
  '101-bliss__n__tumble-the_journey.mp3',
  '103 Mastermind - The Essence.mp3',
  "104. Letta Mbulu - What's Wrong With Groovin'.mp3",
  '108. Big Bud - Persian Blues.mp3',
  '11 - surrey canal road.mp3',
  '11. Cloud Nine aka Nookie - Distant Affairs (Nookie Remix).mp3',
  '12. The Mirror Conspiracy.mp3',
  '13 - Wires and Watchtowers.mp3',
  '13. Barrington Levy - Here I Come (G Funk Remix).mp3',
  '14 - Winter Pageant.mp3',
  '14. Joakuim - 8am Roller.mp3',
  '15 Sweet Tides.mp3',
  '159 - Khromi - Lost in Space.mp3',
  '15_-_tosca_-_annanas_g-corporation_dub-1.mp3',
  '16 - Nookie - Only You (Original Edit).mp3',
  '17 - Jonny L - This Time.mp3',
  '19 PFM - The Rough With The Smooth.mp3',
  '2-02 - #11.mp3',
  '201_jmj_and_richie_-_free_la_funk_(pfm_remix).mp3',
  '202 Dr. S. Gachet - Remember the Roller (The Meaningful Mix).mp3',
  '202_big_ang_-_angel_of_mine.mp3',
  '22 - Skee Mask - Untitled 279 (Mixed).mp3',
  "6 - brown sugar (pfm's cosmic journey mix) - akasha.mp3",
  '6. 4 Hero - Star Chasers (Photek remix).mp3',
  '6. Sixtyten.mp3',
  '601 - Dobie; Nine - Cloud 98 3_4 (Radio Edit).mp3',
  '9 - Voyager - Desire (Dave Wallace remix).mp3',
  'A - Back In The Days (Sexy Ladys Mix).mp3',
  'A - Unknown Artist - Sexy Body Girl.mp3',
  'Air - 01. Modular Mix.mp3',
  'B - The Chameleon - Just Close Your Eyes & Listen.mp3',
  'B2. wishing on a star (urban shakedown dub).mp3',
  'BENKINS - Moodswings v2 [CM].mp3',
  'Beyond Frequency - Stand By Me.mp3',
  'Bonobo - Dial ‘M’ for Monkey - 02 - Flutter.mp3',
  'DJ LOOKBOOK - Out Dere.mp3',
  'Dingo Junction - CLOUDS001 - 04 Stargazing.mp3',
  'Donna Dee - Hooked (Original Mix).mp3',
  'Enrico Mantini, X Woman - What U Want (Chris Stussy & Djoko a.k.a Kolter Remix).mp3',
  'I-Cube - 05 - Tropiq.mp3',
  'IZCO, Reek0 - Wun 2 - 05 Mountain.mp3',
  "Jodeci - Feenin' (LTJ Bukem Remix) (MCA 1995).mp3",
  'LTJ Bukem_Producer 01_02_Constellation.mp3',
  "M-Beat - Do You Know Where You're Coming From (feat. Jamiroquai)-1.mp3",
  'Mance - Ethereal Pulses EP -TENTEN01- - 01 Ethereal Pulses.mp3',
  'Miss Peppermint  Let Me Hear The DJ - Dance Club Style Single - Let Me Hear The DJ.mp3',
  'Morcheeba - Charango - 07. Undress Me Now.mp3',
  'Nightmares on Wax_Carboot Soul_01_Les Nuits.mp3',
  'ODF - Underground.mp3',
  'Obsession 2 - Inga Copeland.mp3',
  'Sempra - CLOUDS001 - 02 Lonely.mp3',
  'Soulboy Remix.mp3',
  'Unknown Artist - Take It Easy.mp3',
  'Voyager - Possessions - orig DAT rip.mp3',
  'mandalay - flowers bloom (pfm remix).mp3',
];

// Manual overrides for tracks where the automatic filename parsing below gets it wrong -
// keyed by the exact filename from TRACKS above. Add entries here as needed.
const MANUAL_OVERRIDES: Record<string, { artist: string; title: string }> = {};

// Strips leading track-number-ish prefixes like "01 - ", "01. ", "(03) ", "1-03. ", "01•01 - ".
const TRACK_NUMBER_PREFIX = /^\(?\d{1,4}(?:[.\-•_]\d{1,3})?\)?[\s.\-•_]*/;

function parseTrackName(filename: string): { artist: string; title: string } {
  const override = MANUAL_OVERRIDES[filename];
  if (override) return override;

  const withoutExtension = filename.replace(/\.mp3$/i, '');
  const remainder = withoutExtension.replace(TRACK_NUMBER_PREFIX, '').trim();
  const separatorIndex = remainder.indexOf(' - ');

  if (separatorIndex === -1) {
    // No clean "Artist - Title" split available - fall back to the whole remainder as the title.
    const title = remainder.includes(' ') ? remainder : remainder.replace(/_+/g, ' ');
    return { artist: '', title: title || withoutExtension };
  }

  return {
    artist: remainder.slice(0, separatorIndex).trim(),
    title: remainder.slice(separatorIndex + 3).trim(),
  };
}

export interface WebampTrack {
  metaData: { artist: string; title: string };
  url: string;
  duration?: number;
}

export const getWebampTracks = (): WebampTrack[] =>
  TRACKS.map((filename) => ({
    metaData: parseTrackName(filename),
    url: buildTrackUrl(filename),
  }));

