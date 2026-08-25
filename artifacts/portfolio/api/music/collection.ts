type DiscogsArtist = { name?: string };
type DiscogsFormat = { name?: string; descriptions?: string[] };
type DiscogsLabel = { name?: string };

type DiscogsBasicInformation = {
  id?: number;
  title?: string;
  artists?: DiscogsArtist[];
  year?: number;
  formats?: DiscogsFormat[];
  labels?: DiscogsLabel[];
  cover_image?: string;
  thumb?: string;
  uri?: string;
  resource_url?: string;
};

type DiscogsReleaseItem = {
  id?: number;
  instance_id?: number;
  date_added?: string;
  basic_information?: DiscogsBasicInformation;
};

type DiscogsCollectionResponse = {
  pagination?: {
    pages?: number;
  };
  releases?: DiscogsReleaseItem[];
};

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

const DISCOGS_API_BASE = 'https://api.discogs.com';
const USER_AGENT = 'PortfolioMusicApp/1.0 (https://github.com/linkyk3/Portfolio)';
const PAGE_SIZE = 100;
const FALLBACK_COVER_IMAGE = 'https://pub-c0213405e2bb46a699b3f27d6cc98185.r2.dev/misc/favicon.svg';

function stripDiscogsSuffix(value: string): string {
  return value.replace(/\s\(\d+\)$/, '').trim();
}

function cleanArtist(item: DiscogsReleaseItem): string {
  const names = (item.basic_information?.artists ?? [])
    .map((artist) => stripDiscogsSuffix((artist.name ?? '').trim()))
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : 'Unknown Artist';
}

function cleanYear(item: DiscogsReleaseItem): number | null {
  const year = item.basic_information?.year;
  if (!year || year <= 0) {
    return null;
  }

  return year;
}

function cleanFormat(item: DiscogsReleaseItem): string {
  const formats = (item.basic_information?.formats ?? [])
    .flatMap((format) => [format.name ?? '', ...(format.descriptions ?? [])])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (formats.some((value) => value === 'cd' || value.includes('compact disc'))) {
    return 'CD';
  }

  return 'Vinyl';
}

function cleanLabel(item: DiscogsReleaseItem): string {
  const labels = (item.basic_information?.labels ?? [])
    .map((label) => (label.name ?? '').trim())
    .filter(Boolean);

  return labels.length > 0 ? Array.from(new Set(labels)).join(' / ') : 'Unknown Label';
}

function cleanCoverImage(item: DiscogsReleaseItem): string {
  const cover = item.basic_information?.cover_image?.trim();
  if (cover) {
    return cover;
  }

  const thumb = item.basic_information?.thumb?.trim();
  if (thumb) {
    return thumb;
  }

  return FALLBACK_COVER_IMAGE;
}

function cleanTitle(item: DiscogsReleaseItem): string {
  const title = item.basic_information?.title?.trim();
  return title && title.length > 0 ? title : 'Untitled Release';
}

function cleanAddedAt(item: DiscogsReleaseItem): string {
  const dateAdded = item.date_added;
  if (dateAdded) {
    const parsed = new Date(dateAdded);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function buildDiscogsUrl(item: DiscogsReleaseItem): string {
  const uri = item.basic_information?.uri?.trim();
  if (uri) {
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }

    return `https://www.discogs.com${uri.startsWith('/') ? uri : `/${uri}`}`;
  }

  const resourceUrl = item.basic_information?.resource_url?.trim();
  if (resourceUrl) {
    const apiReleaseMatch = resourceUrl.match(/discogs\.com\/releases\/(\d+)/i);
    if (apiReleaseMatch?.[1]) {
      return `https://www.discogs.com/release/${apiReleaseMatch[1]}`;
    }
  }

  const releaseId = item.basic_information?.id;
  if (typeof releaseId === 'number') {
    return `https://www.discogs.com/release/${releaseId}`;
  }

  const query = encodeURIComponent(`${cleanArtist(item)} ${cleanTitle(item)}`.trim());
  return `https://www.discogs.com/search/?q=${query}`;
}

function normalizeRelease(item: DiscogsReleaseItem): MusicCollectionItem {
  const fallbackId = `${item.basic_information?.id ?? 'unknown'}-${item.instance_id ?? item.id ?? '0'}`;

  return {
    id: fallbackId,
    title: cleanTitle(item),
    artist: cleanArtist(item),
    year: cleanYear(item),
    format: cleanFormat(item),
    label: cleanLabel(item),
    coverImage: cleanCoverImage(item),
    addedAt: cleanAddedAt(item),
    discogsUrl: buildDiscogsUrl(item),
  };
}

async function fetchDiscogsPage(url: string, token: string): Promise<DiscogsCollectionResponse> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Authorization: `Discogs token=${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discogs request failed (${response.status}): ${body}`);
  }

  return (await response.json()) as DiscogsCollectionResponse;
}

export default async function handler(req: { method?: string }, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (value: unknown) => void } }) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const username = process.env['DISCOGS_USERNAME'] ?? 'linky2001';
  const token = process.env['DISCOGS_API_TOKEN'];

  if (!token) {
    res.status(500).json({
      code: 'DISCOGS_TOKEN_MISSING',
      message: 'DISCOGS_API_TOKEN is missing in Vercel environment variables.',
    });
    return;
  }

  try {
    const allReleases: DiscogsReleaseItem[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let fetchedPages = 0;

    while (currentPage <= totalPages) {
      const url = `${DISCOGS_API_BASE}/users/${encodeURIComponent(username)}/collection/folders/0/releases?sort=added&sort_order=desc&per_page=${PAGE_SIZE}&page=${currentPage}`;
      const page = await fetchDiscogsPage(url, token);
      allReleases.push(...(page.releases ?? []));
      fetchedPages += 1;
      totalPages = Math.max(totalPages, page.pagination?.pages ?? 1);
      currentPage += 1;
    }

    const normalized = allReleases
      .map(normalizeRelease)
      .sort((a, b) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf());

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({
      recentAdditions: normalized.slice(0, 10),
      fullCollection: normalized,
      total: normalized.length,
      fetchedPages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    res.status(500).json({ code: 'DISCOGS_FETCH_FAILED', message });
  }
}
