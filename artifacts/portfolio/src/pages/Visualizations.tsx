import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { FloatingNav } from '@/components/FloatingNav';
import { r2Url } from '@/lib/r2';

// --- Shared Layout Primitives ---

const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <line x1="10" y1="1" x2="10" y2="19" />
    <line x1="2" y1="5.5" x2="18" y2="14.5" />
    <line x1="18" y1="5.5" x2="2" y2="14.5" />
  </svg>
);

const f = (weight: number, size: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: "'ABC ROM'",
  fontWeight: weight,
  fontSize: size,
  ...extra,
});

const INDENT = '2rem';

const NAV_LINKS = [
  { label: 'Selected Works', href: '/projects' },
  { label: 'Music', href: '/music' },
  { label: 'Visualizations', href: '/visualizations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const VISUALIZATION_SUBNAV = [{ label: 'Collections', href: '/visualizations/collections' }];

// --- Helper Functions ---

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const noise = (value: string, salt: number) => (hashString(`${value}:${salt}`) % 1000) / 999;

const getLaneCount = (canvasWidth: number) => {
  if (canvasWidth >= 980) return 3;
  if (canvasWidth >= 640) return 2;
  return 1;
};

const getDisplaySize = (asset: GalleryAsset, baseSquare: number) => {
  const ratio = asset.width / asset.height;

  if (ratio >= 1.12) {
    const height = baseSquare;
    return {
      width: height * ratio,
      height,
    };
  }

  if (ratio <= 0.88) {
    const width = baseSquare;
    return {
      width,
      height: width / ratio,
    };
  }

  return {
    width: baseSquare,
    height: baseSquare,
  };
};

const styles: { [key: string]: React.CSSProperties } = {
  pageShell: {
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--background)',
  },
  visPageContainer: {
    width: '100%',
    maxWidth: 'calc(100vh * 4 / 3)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'var(--background)',
    color: 'var(--color-foreground)',
  },
  visHeader: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    paddingTop: '1rem',
    paddingBottom: '1rem',
  },
  visHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoNavGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 0,
  },
  logoNavMenu: {
    position: 'absolute',
    left: '44px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease',
  },
  headerTitle: {
    ...f(500, 'clamp(1.4rem, 3.2vh, 2.2rem)', {
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color: 'transparent',
      WebkitTextStroke: '1px var(--color-foreground)',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }),
  },
  dividerLine: {
    flexShrink: 0,
    height: '2px',
    backgroundColor: 'var(--color-foreground)',
    marginLeft: INDENT,
    marginRight: INDENT,
    position: 'relative',
    zIndex: 3,
  },
  main: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: INDENT,
    paddingRight: INDENT,
  },
  subnavRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.35rem',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    paddingTop: '0.5rem',
    paddingBottom: '0.55rem',
    background: 'var(--background)',
    position: 'relative',
    zIndex: 2,
  },
  scatterStage: {
    width: '100%',
    padding: '1.75rem clamp(0.4rem, 1.4vw, 1rem) 2.75rem',
    boxSizing: 'border-box',
  },
  galleryViewport: {
    position: 'relative',
    width: '100%',
  },
  galleryContainer: {
    position: 'relative',
    width: '100%',
    minHeight: 'clamp(32rem, 90vh, 52rem)',
  },
  imageWrapper: {
    position: 'absolute',
    cursor: 'pointer',
    transition: 'transform 0.24s ease-out, opacity 0.24s ease-out',
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
  },
  image: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    backgroundColor: '#eee',
    transition: 'filter 0.24s ease-out, transform 0.24s ease-out',
  },
  sentinelWrap: {
    width: '100%',
    position: 'relative',
    paddingBottom: '0.5rem',
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: INDENT,
    paddingRight: INDENT,
    paddingTop: '0.65rem',
    paddingBottom: '0.65rem',
  },
  lightboxOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 4, 4, 0.56)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    cursor: 'pointer',
  },
  lightboxArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(10, 10, 10, 0.4)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    zIndex: 1001,
  },
  lightboxContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  lightboxImageWrap: {
    cursor: 'default',
    pointerEvents: 'auto',
    display: 'inline-flex',
  },
  lightboxImg: {
    width: 'auto',
    height: 'auto',
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    zIndex: 2,
  },
  sentinel: {
    width: '100%',
    height: '1px',
    background: 'transparent',
  },
};

// --- Component Interfaces ---
const pad2 = (n: number) => String(n).padStart(2, '0');

// Exact filenames mirrored from the R2 visualisations/mainpage/ bucket folder.
const VISUALISATION_IMAGE_NAMES: string[] = [
  '3.webp',
  'bergen-1.webp', 'bergen.webp',
  ...Array.from({ length: 35 }, (_, i) => `BosWinter25-${pad2(i + 1)}.webp`),
  'col1.webp',
  'kamikochi.webp',
  'osaka toren-1.webp', 'osaka toren-2-2.webp', 'osaka toren-2.webp', 'osaka toren.webp',
  'P1390076.webp', 'P1390150.webp', 'P1390156.webp',
  'P1470794.webp', 'P1470803.webp', 'P1470810.webp',
  'P1480060.webp', 'P1480096.webp', 'P1480139.webp', 'P1480142.webp', 'P1480166.webp',
  'P1480174.webp', 'P1480180.webp', 'P1480265.webp', 'P1480303.webp', 'P1480312.webp',
  'P1480316.webp', 'P1480326.webp', 'P1480454.webp', 'P1480469.webp', 'P1480475.webp',
  'P1480482.webp', 'P1480501.webp', 'P1480511.webp', 'P1480536.webp', 'P1480545.webp',
  'P1480549.webp', 'P1480556.webp', 'P1480558.webp', 'P1480564.webp', 'P1480575.webp',
  'P1480576.webp', 'P1480615.webp', 'P1480616.webp', 'P1480617.webp', 'P1480618.webp',
  'P1480621.webp', 'P1480635.webp', 'P1480669.webp', 'P1480680.webp', 'P1480688.webp',
  'P1480690.webp', 'P1480701.webp', 'P1480705.webp', 'P1480715.webp', 'P1480726.webp',
  'P1480727.webp', 'P1480731.webp', 'P1480742.webp', 'P1480764.webp', 'P1480766.webp',
  'P1480769.webp', 'P1480788-2.webp', 'P1480801.webp',
  'P1490038.webp', 'P1490043.webp', 'P1490191.webp', 'P1490204.webp', 'P1490210.webp',
  'P1490232.webp', 'P1490241.webp', 'P1490243.webp', 'P1490244.webp', 'P1490273.webp',
  'P1490286.webp', 'P1490289.webp', 'P1490293.webp', 'P1490296.webp', 'P1490297.webp',
  'P1490298.webp', 'P1490299.webp', 'P1490304.webp', 'P1490313.webp', 'P1490335.webp',
  'P1490343.webp', 'P1490346.webp', 'P1490358.webp', 'P1490364.webp', 'P1490370.webp',
  'P1490387.webp', 'P1490407.webp', 'P1490414.webp', 'P1490416.webp', 'P1490478.webp',
  'P1490489.webp', 'P1490499.webp', 'P1490542.webp',
  'rodin.webp',
  ...Array.from({ length: 8 }, (_, i) => `shadow${i + 1}.webp`),
  'tempel.webp',
  'test.webp',
  'Untitled-3.webp',
  ...Array.from({ length: 23 }, (_, i) => `veldwinter26-${pad2(i + 1)}.webp`),
];

const VISUALISATION_IMAGE_URLS = VISUALISATION_IMAGE_NAMES.map(name => r2Url(`visualisations/mainpage/${name}`));

const BATCH_SIZE = 4;
const PLACEHOLDER_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#ece7e2"/>
    <rect x="60" y="60" width="680" height="480" rx="18" fill="#f6f2ee"/>
    <circle cx="250" cy="260" r="82" fill="#d9d2cc"/>
    <rect x="360" y="200" width="270" height="28" rx="14" fill="#d9d2cc"/>
    <rect x="360" y="250" width="220" height="20" rx="10" fill="#ddd5cf"/>
    <rect x="360" y="290" width="240" height="20" rx="10" fill="#ddd5cf"/>
    <rect x="360" y="330" width="200" height="20" rx="10" fill="#ddd5cf"/>
  </svg>
`)}`;

interface GalleryAsset {
  src: string;
  width: number;
  height: number;
}

interface DisplayImage {
  src: string;
  id: string;
  left: number;
  width: number;
  height: number;
  top: number;
  lane: number;
}

interface ScatterLayout {
  canvasHeight: number;
  items: DisplayImage[];
}

interface PlacementCandidate {
  left: number;
  top: number;
  score: number;
}

const loadImageMetadata = (src: string): Promise<GalleryAsset> =>
  new Promise(resolve => {
    const image = new window.Image();

    image.onload = () => {
      resolve({
        src,
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
      });
    };

    image.onerror = () => {
      resolve({
        src,
        width: 4,
        height: 3,
      });
    };

    image.src = src;
  });

const buildScatterLayout = (assets: GalleryAsset[], canvasWidth: number): ScatterLayout => {
  if (assets.length === 0 || canvasWidth <= 0) {
    return { canvasHeight: 0, items: [] };
  }

  const laneCount = getLaneCount(canvasWidth);
  const sidePadding = laneCount === 3 ? 22 : laneCount === 2 ? 18 : 8;
  const availableWidth = Math.max(canvasWidth - sidePadding * 2, 220);
  const minHorizontalGap = laneCount === 3 ? 56 : laneCount === 2 ? 48 : 28;
  const minVerticalGap = laneCount === 3 ? 110 : laneCount === 2 ? 96 : 72;
  const verticalBacktrack = laneCount === 3 ? 180 : laneCount === 2 ? 130 : 40;
  const verticalForward = laneCount === 3 ? 220 : laneCount === 2 ? 180 : 92;
  const progressStep = laneCount === 3 ? 86 : laneCount === 2 ? 104 : 120;
  const jitterStep = laneCount === 3 ? 54 : laneCount === 2 ? 42 : 22;

  const items: DisplayImage[] = [];
  let maxBottom = 0;
  let flowTop = 0;

  assets.forEach((asset, index) => {
      const baseSquare = clamp(
        laneCount === 3
          ? availableWidth * (0.17 + noise(asset.src, 1) * 0.03)
          : laneCount === 2
            ? availableWidth * (0.23 + noise(asset.src, 1) * 0.035)
            : availableWidth * (0.46 + noise(asset.src, 1) * 0.04),
        laneCount === 3 ? 282 : laneCount === 2 ? 300 : 248,
        laneCount === 3 ? 360 : laneCount === 2 ? 348 : Math.min(340, availableWidth)
      );
      const sized = getDisplaySize(asset, baseSquare);
      const itemWidth = Math.min(sized.width, availableWidth);
      const itemHeight = sized.height * (itemWidth / sized.width);
      const candidateCount = laneCount === 3 ? 16 : laneCount === 2 ? 14 : 8;
      const targetTop = Math.max(0, flowTop + (noise(asset.src, 2) - 0.5) * verticalBacktrack);
      let bestCandidate: PlacementCandidate | null = null;

      for (let candidateIndex = 0; candidateIndex < candidateCount; candidateIndex += 1) {
        const candidateLeft = sidePadding + noise(asset.src, 20 + candidateIndex) * Math.max(availableWidth - itemWidth, 0);
        const candidateTop = Math.max(
          0,
          targetTop + (noise(asset.src, 60 + candidateIndex) - 0.35) * verticalForward + candidateIndex * jitterStep * 0.16
        );

        let penalty = Math.abs(candidateTop - targetTop) * 0.15;

        for (let compareIndex = Math.max(0, items.length - 18); compareIndex < items.length; compareIndex += 1) {
          const placed = items[compareIndex];
          const expandedLeft = placed.left - minHorizontalGap;
          const expandedRight = placed.left + placed.width + minHorizontalGap;
          const expandedTop = placed.top - minVerticalGap;
          const expandedBottom = placed.top + placed.height + minVerticalGap;
          const overlaps =
            candidateLeft < expandedRight &&
            candidateLeft + itemWidth > expandedLeft &&
            candidateTop < expandedBottom &&
            candidateTop + itemHeight > expandedTop;

          if (overlaps) {
            penalty += 100000;
            const pushDown = expandedBottom - candidateTop;
            penalty += pushDown * 40;
          } else {
            const horizontalDistance = Math.abs(candidateLeft - placed.left);
            const verticalDistance = Math.abs(candidateTop - placed.top);
            if (horizontalDistance < minHorizontalGap * 1.4 && verticalDistance < minVerticalGap * 1.8) {
              penalty += (minHorizontalGap * 1.4 - horizontalDistance) + (minVerticalGap * 1.8 - verticalDistance);
            }
          }
        }

        if (!bestCandidate || penalty < bestCandidate.score) {
          bestCandidate = {
            left: candidateLeft,
            top: candidateTop,
            score: penalty,
          };
        }
      }

      const fallbackTop = maxBottom + minVerticalGap + noise(asset.src, 90) * progressStep;
      const left = bestCandidate?.left ?? sidePadding;
      const top = bestCandidate && bestCandidate.score < 100000 ? bestCandidate.top : fallbackTop;
      const cluster = index % Math.max(laneCount, 1);

      items.push({
        src: asset.src,
        id: asset.src,
        left,
        width: itemWidth,
        height: itemHeight,
        top,
        lane: cluster,
      });

      maxBottom = Math.max(maxBottom, top + itemHeight);
      flowTop = Math.max(
        flowTop + progressStep + noise(asset.src, 5) * progressStep,
        top + itemHeight * (0.18 + noise(asset.src, 6) * 0.22)
      );
  });

  return {
    canvasHeight: Math.ceil(maxBottom + minVerticalGap),
    items,
  };
};

const getVisibleCanvasHeight = (items: DisplayImage[], minHeight: number, hasMore: boolean) => {
  if (items.length === 0) return minHeight;

  const contentBottom = items.reduce((maxBottom, item) => Math.max(maxBottom, item.top + item.height), 0);
  const sentinelBuffer = hasMore ? 140 : 72;

  return Math.max(minHeight, Math.ceil(contentBottom + sentinelBuffer));
};

const Visualizations = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<GalleryAsset[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [topNavHovered, setTopNavHovered] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [isLeftArrowHovered, setIsLeftArrowHovered] = useState(false);
  const [isRightArrowHovered, setIsRightArrowHovered] = useState(false);
  const [loadedImageIds, setLoadedImageIds] = useState<Set<string>>(new Set());

  const sentinelRef = useRef<HTMLDivElement>(null);
  const galleryViewportRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const batchLoadingRef = useRef(false);
  const hideNavTimeout = useRef<number | null>(null);

  const showTopNav = () => {
    if (hideNavTimeout.current !== null) {
      window.clearTimeout(hideNavTimeout.current);
      hideNavTimeout.current = null;
    }
    setTopNavHovered(true);
  };

  const hideTopNav = () => {
    if (hideNavTimeout.current !== null) {
      window.clearTimeout(hideNavTimeout.current);
    }
    hideNavTimeout.current = window.setTimeout(() => {
      setTopNavHovered(false);
      hideNavTimeout.current = null;
    }, 150);
  };

  const scatterLayout = useMemo(() => buildScatterLayout(allImages, canvasWidth), [allImages, canvasWidth]);
  const displayedImages = scatterLayout.items;

  const selectedImage = useMemo(() => {
    if (selectedImageIndex === null || !displayedImages) return null;
    return displayedImages[selectedImageIndex]?.src ?? null;
  }, [selectedImageIndex, displayedImages]);

  // 1. Fetch and shuffle all images on initial load
  useEffect(() => {
    setIsLoading(true);
    setImageUrls(shuffleArray(VISUALISATION_IMAGE_URLS));
    setAllImages([]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const viewport = galleryViewportRef.current;
    if (!viewport) return;

    const updateWidth = () => {
      setCanvasWidth(viewport.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect.width ?? viewport.getBoundingClientRect().width;
      setCanvasWidth(nextWidth);
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasMore = allImages.length < imageUrls.length;
  const galleryMinHeight = canvasWidth >= 980 ? 760 : canvasWidth >= 640 ? 620 : 420;
  const visibleCanvasHeight = useMemo(
    () => getVisibleCanvasHeight(displayedImages, galleryMinHeight, hasMore),
    [displayedImages, galleryMinHeight, hasMore]
  );

  // 2. Load more images function
  const loadMoreImages = useCallback(() => {
    if (isLoading || batchLoadingRef.current || imageUrls.length === 0 || allImages.length >= imageUrls.length) return;

    const startIndex = allImages.length;
    const batchUrls = imageUrls.slice(startIndex, startIndex + BATCH_SIZE);
    if (batchUrls.length === 0) return;

    batchLoadingRef.current = true;
    setIsBatchLoading(true);

    Promise.all(batchUrls.map(loadImageMetadata))
      .then(batchAssets => {
        setAllImages(previousImages => {
          if (previousImages.length !== startIndex) {
            return previousImages;
          }

          return [...previousImages, ...batchAssets];
        });
      })
      .finally(() => {
        batchLoadingRef.current = false;
        setIsBatchLoading(false);
      });
  }, [allImages.length, imageUrls, isLoading]);

  // 3. Initial load and infinite scroll observer
  useEffect(() => {
    if (!isLoading && imageUrls.length > 0 && allImages.length === 0) {
      loadMoreImages();
    }
  }, [allImages.length, imageUrls.length, isLoading, loadMoreImages]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreImages();
        }
      },
      { rootMargin: '0px 0px 800px 0px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loadMoreImages, hasMore]);

  useEffect(() => {
    const handleScrollState = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const docBottom = document.documentElement.scrollHeight;
      setIsScrolledToBottom(scrollBottom >= docBottom - 4);
    };

    handleScrollState();
    window.addEventListener('scroll', handleScrollState, { passive: true });
    window.addEventListener('resize', handleScrollState);

    return () => {
      window.removeEventListener('scroll', handleScrollState);
      window.removeEventListener('resize', handleScrollState);
    };
  }, []);

  // 4. Lightbox logic
  const handleImageClick = (src: string) => {
    const index = displayedImages.findIndex(img => img.src === src);
    if (index !== -1) {
      setSelectedImageIndex(index);
    }
  };
  const handleCloseLightbox = () => setSelectedImageIndex(null);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    const nextIndex = (selectedImageIndex + 1) % displayedImages.length;
    setSelectedImageIndex(nextIndex);
  }, [selectedImageIndex, displayedImages.length]);

  const handlePrevImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    const prevIndex = (selectedImageIndex - 1 + displayedImages.length) % displayedImages.length;
    setSelectedImageIndex(prevIndex);
  }, [selectedImageIndex, displayedImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage]);

  const allImagesLoaded = !hasMore && allImages.length === imageUrls.length && imageUrls.length > 0;
  const expandBottomBars = allImagesLoaded && isScrolledToBottom;

  useEffect(() => {
    if (displayedImages.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        setLoadedImageIds(previousLoaded => {
          const nextLoaded = new Set(previousLoaded);

          entries.forEach(entry => {
            const imageId = entry.target.getAttribute('data-image-id');
            if (!imageId) return;

            if (entry.isIntersecting) {
              nextLoaded.add(imageId);
            }
          });

          return nextLoaded;
        });
      },
      {
        root: null,
        rootMargin: '200px 0px 200px 0px',
        threshold: 0.01,
      }
    );

    displayedImages.forEach(image => {
      const node = imageRefs.current[image.id];
      if (node) {
        observer.observe(node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [displayedImages]);

  const globalBlur: React.CSSProperties = hoveredId
    ? { filter: 'blur(3px)', opacity: 0.34, transition: 'filter 0.24s ease, opacity 0.24s ease' }
    : { filter: 'none', opacity: 1, transition: 'filter 0.24s ease, opacity 0.24s ease' };

  // 5. Render component
  return (
    <>
      <div style={styles.pageShell}>
        <FloatingNav />
        <div style={styles.visPageContainer}>
          <header style={{ ...styles.visHeader, ...globalBlur }}>
            <div style={styles.visHeaderLeft}>
              <Link
                href="/"
                style={f(500, '1.75rem', {
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: 'inherit',
                  textDecoration: 'none',
                })}
              >
                linky2001
              </Link>

              <div
                style={{ ...styles.logoNavGroup, paddingRight: '42rem', marginRight: '-42rem' }}
                onMouseEnter={showTopNav}
                onMouseLeave={hideTopNav}
              >
                <div className="hover:text-accent transition-colors" style={{ lineHeight: 0, paddingRight: '0.75rem' }}>
                  <LogoMark />
                </div>
                <nav 
                  aria-label="Primary navigation"
                  style={{ ...styles.logoNavMenu, opacity: topNavHovered ? 1 : 0, pointerEvents: topNavHovered ? 'auto' : 'none' }}
                  onMouseEnter={showTopNav}
                  onMouseLeave={hideTopNav}
                >
                  {NAV_LINKS.map(({ label, href }) => (
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

            <div style={styles.headerTitle}>Visualizations</div>
          </header>

          <div style={{ ...styles.dividerLine, ...globalBlur }} />

          <div style={{ ...styles.subnavRow, ...globalBlur }}>
            {VISUALIZATION_SUBNAV.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-foreground hover:text-accent transition-colors"
                style={f(350, '0.95rem', { letterSpacing: '0.01em', textDecoration: 'none' })}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ ...styles.dividerLine, ...globalBlur }} />

          <main style={styles.main}>
            <section style={styles.scatterStage}>
              <div ref={galleryViewportRef} style={styles.galleryViewport}>
                <div
                  style={{
                    ...styles.galleryContainer,
                    height: `${visibleCanvasHeight}px`,
                  }}
                >
                {Array.isArray(displayedImages) && displayedImages.map((image) => {
                  const isHovered = hoveredId === image.id;
                  const isLoaded = loadedImageIds.has(image.id);

                  const wrapperStyle: React.CSSProperties = {
                    ...styles.imageWrapper,
                    width: `${image.width}px`,
                    left: `${image.left}px`,
                    top: `${image.top}px`,
                    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    zIndex: isHovered ? 2 : image.lane + 1,
                    opacity: hoveredId && hoveredId !== image.id ? 0.24 : 1,
                  };

                  const imageStyle: React.CSSProperties = {
                    ...styles.image,
                    filter: isHovered ? 'var(--project-drop-shadow-hover)' : 'var(--project-drop-shadow)',
                    opacity: isLoaded ? 1 : 0.7,
                    backgroundColor: '#efe9e4',
                  };

                  return (
                    <div
                      key={image.id}
                      ref={element => {
                        imageRefs.current[image.id] = element;
                      }}
                      data-image-id={image.id}
                      style={wrapperStyle}
                      onClick={() => handleImageClick(image.src)}
                      onMouseEnter={() => setHoveredId(image.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <img
                        src={isLoaded ? image.src : PLACEHOLDER_IMAGE_SRC}
                        alt="Visualization"
                        loading="lazy"
                        decoding="async"
                        style={imageStyle}
                      />
                    </div>
                  );
                })}
                </div>
              </div>

              {hasMore && (
                <div style={styles.sentinelWrap}>
                  <div ref={sentinelRef} style={styles.sentinel} />
                </div>
              )}
            </section>
          </main>

          <div
            style={{
              ...styles.dividerLine,
              ...globalBlur,
              marginLeft: INDENT,
              marginRight: INDENT,
            }}
          />

          <footer
            style={{
              ...styles.footer,
              ...globalBlur,
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <ThemeToggleInline />
            </div>
          </footer>
        </div>
      </div>

      {selectedImage && (
        <div style={styles.lightboxOverlay} onClick={handleCloseLightbox}>
          <button
            style={{ ...styles.lightboxArrow, left: '2rem' }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            onMouseEnter={() => setIsLeftArrowHovered(true)}
            onMouseLeave={() => setIsLeftArrowHovered(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isLeftArrowHovered ? '#EF4444' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={styles.lightboxContent}>
            <div style={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Selected Visualization"
                style={styles.lightboxImg}
              />
            </div>
          </div>
          <button
            style={{ ...styles.lightboxArrow, right: '2rem' }}
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            onMouseEnter={() => setIsRightArrowHovered(true)}
            onMouseLeave={() => setIsRightArrowHovered(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isRightArrowHovered ? '#EF4444' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default Visualizations;