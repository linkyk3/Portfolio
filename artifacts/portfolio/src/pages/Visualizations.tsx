import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { ThemeToggleInline } from '@/components/ThemeToggle';
import { FloatingNav } from '@/components/FloatingNav';

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

const VISUALIZATION_SUBNAV = [
  { label: 'Albums', href: '/visualizations/albums' },
  { label: 'Map View', href: '/visualizations/map-view' },
];

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
const IMAGE_MODULES = import.meta.glob('/public/visualisations/*.{png,jpg,jpeg,gif,svg}');
const BATCH_SIZE = 8;

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
  const [allImages, setAllImages] = useState<GalleryAsset[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const galleryViewportRef = useRef<HTMLDivElement>(null);

  // 1. Fetch and shuffle all images on initial load
  useEffect(() => {
    const fetchAndPrepareImages = async () => {
      setIsLoading(true);
      const imagePaths = Object.keys(IMAGE_MODULES);
      const loadedModules = await Promise.all(imagePaths.map(path => IMAGE_MODULES[path]()));
      const urls = loadedModules.map(module => (module as any).default).filter(Boolean);

      const withMetadata = await Promise.all(urls.map(loadImageMetadata));
      const shuffled = shuffleArray(withMetadata);
      setAllImages(shuffled);
      setVisibleCount(0);
      setIsLoading(false);
    };

    fetchAndPrepareImages();
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

  const scatterLayout = useMemo(() => buildScatterLayout(allImages, canvasWidth), [allImages, canvasWidth]);
  const displayedImages = useMemo(() => scatterLayout.items.slice(0, visibleCount), [scatterLayout.items, visibleCount]);
  const hasMore = visibleCount < scatterLayout.items.length;
  const galleryMinHeight = canvasWidth >= 980 ? 760 : canvasWidth >= 640 ? 620 : 420;
  const visibleCanvasHeight = useMemo(
    () => getVisibleCanvasHeight(displayedImages, galleryMinHeight, hasMore),
    [displayedImages, galleryMinHeight, hasMore]
  );

  // 2. Load more images function
  const loadMoreImages = useCallback(() => {
    if (isLoading || scatterLayout.items.length === 0 || visibleCount >= scatterLayout.items.length) return;

    setVisibleCount(previousCount => Math.min(previousCount + BATCH_SIZE, scatterLayout.items.length));
  }, [isLoading, scatterLayout.items.length, visibleCount]);

  // 3. Initial load and infinite scroll observer
  useEffect(() => {
    if (!isLoading && scatterLayout.items.length > 0 && visibleCount === 0) {
      setVisibleCount(Math.min(BATCH_SIZE, scatterLayout.items.length));
    }
  }, [isLoading, scatterLayout.items.length, visibleCount]);

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
  const handleImageClick = (src: string) => setSelectedImage(src);
  const handleCloseLightbox = () => setSelectedImage(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allImagesLoaded = !hasMore && displayedImages.length >= scatterLayout.items.length && scatterLayout.items.length > 0;
  const expandBottomBars = allImagesLoaded && isScrolledToBottom;

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
                className="group"
                style={styles.logoNavGroup}
                onMouseEnter={() => setHoveredId('menu')}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="hover:text-accent transition-colors" style={{ lineHeight: 0 }}>
                  <LogoMark />
                </div>
                <nav aria-label="Primary navigation" style={styles.logoNavMenu} className="group-hover:opacity-100 group-hover:pointer-events-auto">
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
                  };

                  return (
                    <div
                      key={image.id}
                      style={wrapperStyle}
                      onClick={() => handleImageClick(image.src)}
                      onMouseEnter={() => setHoveredId(image.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <img src={image.src} alt="Visualization" style={imageStyle} />
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
          <div style={styles.lightboxContent}>
            <div style={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Selected Visualization"
                style={styles.lightboxImg}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Visualizations;