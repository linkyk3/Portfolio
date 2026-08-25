import { Router, type IRouter } from "express";

type DiscogsArtist = {
  name?: string;
};

type DiscogsFormat = {
  name?: string;
  descriptions?: string[];
};

type DiscogsLabel = {
  name?: string;
};

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
    page?: number;
  };
  releases?: DiscogsReleaseItem[];
};

type NormalizedCollectionItem = {
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

type CachedCollectionPayload = {
  recentAdditions: NormalizedCollectionItem[];
  fullCollection: NormalizedCollectionItem[];
  total: number;
  fetchedPages: number;
};

const router: IRouter = Router();

const DISCOGS_API_BASE = "https://api.discogs.com";
const DEFAULT_USERNAME = "linky2001";
const USER_AGENT = "PortfolioMusicApp/1.0 (https://github.com/linkyk3/Portfolio)";
const PAGE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FALLBACK_COVER_IMAGE = "https://pub-c0213405e2bb46a699b3f27d6cc98185.r2.dev/misc/favicon.svg";

let collectionCache:
  | {
      expiresAt: number;
      payload: CachedCollectionPayload;
    }
  | null = null;

function stripDiscogsSuffix(value: string): string {
  return value.replace(/\s\(\d+\)$/, "").trim();
}

function cleanArtist(item: DiscogsReleaseItem): string {
  const artists = item.basic_information?.artists ?? [];
  const cleaned = artists
    .map((artist) => stripDiscogsSuffix((artist.name ?? "").trim()))
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned.join(", ") : "Unknown Artist";
}

function cleanYear(item: DiscogsReleaseItem): number | null {
  const year = item.basic_information?.year;
  if (!year || year <= 0) {
    return null;
  }

  return year;
}

function cleanFormat(item: DiscogsReleaseItem): string {
  const formats = item.basic_information?.formats ?? [];
  const names = formats
    .flatMap((format) => [format.name ?? "", ...(format.descriptions ?? [])])
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  if (names.some((value) => value === "cd" || value.includes("compact disc"))) {
    return "CD";
  }

  if (
    names.some(
      (value) =>
        value === "vinyl" ||
        value.includes("lp") ||
        value.includes('12"') ||
        value.includes('7"'),
    )
  ) {
    return "Vinyl";
  }

  return "Vinyl";
}

function cleanLabel(item: DiscogsReleaseItem): string {
  const labels = item.basic_information?.labels ?? [];
  const names = labels.map((label) => (label.name ?? "").trim()).filter(Boolean);

  return names.length > 0 ? Array.from(new Set(names)).join(" / ") : "Unknown Label";
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
  return title && title.length > 0 ? title : "Untitled Release";
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
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      return uri;
    }

    return `https://www.discogs.com${uri.startsWith("/") ? uri : `/${uri}`}`;
  }

  const resourceUrl = item.basic_information?.resource_url?.trim();
  if (resourceUrl) {
    const apiReleaseMatch = resourceUrl.match(/discogs\.com\/releases\/(\d+)/i);
    if (apiReleaseMatch && apiReleaseMatch[1]) {
      return `https://www.discogs.com/release/${apiReleaseMatch[1]}`;
    }
  }

  const releaseId = item.basic_information?.id;
  if (typeof releaseId === "number") {
    return `https://www.discogs.com/release/${releaseId}`;
  }

  const title = item.basic_information?.title?.trim() ?? "";
  const primaryArtist = item.basic_information?.artists?.[0]?.name?.trim() ?? "";
  const query = encodeURIComponent(`${primaryArtist} ${title}`.trim());
  return query.length > 0
    ? `https://www.discogs.com/search/?q=${query}`
    : "https://www.discogs.com/";
}

function normalizeRelease(item: DiscogsReleaseItem): NormalizedCollectionItem {
  const fallbackId = `${item.basic_information?.id ?? "unknown"}-${item.instance_id ?? item.id ?? "0"}`;

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
      "User-Agent": USER_AGENT,
      Authorization: `Discogs token=${token}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    const error = new Error("Discogs rate limit exceeded");
    Object.assign(error, { status: 429, retryAfter });
    throw error;
  }

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Discogs request failed with status ${response.status}: ${body}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return (await response.json()) as DiscogsCollectionResponse;
}

async function fetchFullCollection(username: string, token: string): Promise<CachedCollectionPayload> {
  const allReleases: DiscogsReleaseItem[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let fetchedPages = 0;

  while (currentPage <= totalPages) {
    const url = `${DISCOGS_API_BASE}/users/${encodeURIComponent(username)}/collection/folders/0/releases?sort=added&sort_order=desc&per_page=${PAGE_SIZE}&page=${currentPage}`;
    const pageResult = await fetchDiscogsPage(url, token);
    fetchedPages += 1;

    allReleases.push(...(pageResult.releases ?? []));

    totalPages = Math.max(totalPages, pageResult.pagination?.pages ?? 1);
    currentPage += 1;
  }

  const normalized = allReleases
    .map(normalizeRelease)
    .sort((a, b) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf());

  return {
    recentAdditions: normalized.slice(0, 10),
    fullCollection: normalized,
    total: normalized.length,
    fetchedPages,
  };
}

router.get("/music/collection", async (_req, res) => {
  const username = process.env["DISCOGS_USERNAME"] ?? DEFAULT_USERNAME;
  const token = process.env["DISCOGS_API_TOKEN"];

  if (!token) {
    res.status(500).json({
      code: "DISCOGS_TOKEN_MISSING",
      message: "DISCOGS_API_TOKEN is not configured on the server runtime environment.",
      hint: "Set DISCOGS_API_TOKEN in the root .env.local and restart the api-server process.",
    });
    return;
  }

  const now = Date.now();
  if (collectionCache && collectionCache.expiresAt > now) {
    res.json(collectionCache.payload);
    return;
  }

  try {
    const payload = await fetchFullCollection(username, token);

    collectionCache = {
      payload,
      expiresAt: now + CACHE_TTL_MS,
    };

    res.json(payload);
  } catch (error: unknown) {
    if (collectionCache) {
      res.setHeader("X-Data-Stale", "true");
      res.json(collectionCache.payload);
      return;
    }

    const status =
      typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;

    if (status === 429) {
      const retryAfter =
        typeof error === "object" && error !== null && "retryAfter" in error && typeof error.retryAfter === "string"
          ? error.retryAfter
          : undefined;

      if (retryAfter) {
        res.setHeader("Retry-After", retryAfter);
      }

      res.status(429).json({
        message: "Discogs rate limit reached. Please try again shortly.",
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    res.status(500).json({ message });
  }
});

export default router;