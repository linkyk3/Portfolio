import { Image, ImageGrid, ImageCollage } from './ProjectDetail';
import { useState, useEffect, useRef } from 'react';
import { FloatingNav } from '@/components/FloatingNav';

// Inlined Lightbox component to resolve import issues
function Lightbox({ src, onClose }: { src: string | null; onClose: () => void; }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({});
  const isRotated = src?.includes('?rotated=true');
  const cleanSrc = src?.split('?')[0];
  const imgRef = useRef<HTMLImageElement>(null);

  const zoomLevel = 1.875; // 25% less zoom
  const magnifierSize = 250; // 25% larger box

  useEffect(() => {
    // Reset zoom state when the image source changes
    setIsZooming(false);

    if (!src) return;
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVisible(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src]);

  if (!src) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || !isZooming) return;

    const img = imgRef.current;
    const { left, top, width, height } = img.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x < 0 || x > width || y < 0 || y > height) {
      setIsZooming(false);
      return;
    }

    setMagnifierStyle({
      backgroundPositionX: `${-x * zoomLevel + magnifierSize / 2}px`,
      backgroundPositionY: `${-y * zoomLevel + magnifierSize / 2}px`,
      backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
      left: `${x - magnifierSize / 2}px`,
      top: `${y - magnifierSize / 2}px`,
    });
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 cursor-zoom-out transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} bg-white/80 backdrop-blur-sm`} onClick={() => setIsVisible(false)} onTransitionEnd={() => !isVisible && onClose()}>
      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="relative shadow-2xl rounded-lg self-center">
          <img ref={imgRef} src={cleanSrc} alt="Enlarged view" 
              onMouseMove={handleMouseMove} 
              onClick={(e) => { setIsZooming(prev => !prev); handleMouseMove(e); }}
              className={`object-contain rounded-lg transition-transform duration-300 ease-in-out ${isZooming ? 'cursor-crosshair' : 'cursor-zoom-in'} ${isVisible ? 'scale-100' : 'scale-95'} ${isRotated ? 'rotate-90 max-w-[80vh] max-h-[80vw]' : 'max-w-[80vw] max-h-[80vh]'}`} />
          
          {isZooming && (
            <div className="absolute pointer-events-none rounded-full border-2 border-white/50 bg-no-repeat shadow-2xl" style={{ ...magnifierStyle, backgroundImage: `url(${cleanSrc || ''})`, width: magnifierSize, height: magnifierSize }} />
          )}
        </div>
      </div>
    </div>
  );
}

const BASE = import.meta.env.BASE_URL;

const A_SERIES_IMAGES = [
  `${BASE}design_studio/part1/a1.jpg`,
  `${BASE}design_studio/part1/a2 (1).jpg`,
  `${BASE}design_studio/part1/a3.jpg`,
  `${BASE}design_studio/part1/a4.jpg`,
];
const B_SERIES_IMAGES = [
  `${BASE}design_studio/part1/b1.jpg`,
  `${BASE}design_studio/part1/b2.jpg`,
  `${BASE}design_studio/part1/b3.jpg`,
  `${BASE}design_studio/part1/b4.jpg`,
];

const SESSION_IMAGES = [
  `${BASE}design_studio/part1/session5_A3 conv 0.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 1.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 2.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 3.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 4.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 5.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 6.jpg`,
  `${BASE}design_studio/part1/session5_A3 conv 8.png`,
];

const SPECIAL_IMAGES = [
  `${BASE}design_studio/part1/session5_A3 conv 7.jpg`,
  `${BASE}design_studio/part1/session6_designquestion conv 0.jpg`,
];

const CRITERIA_IMAGES = [
  `${BASE}design_studio/part2/1_criteria-analysis_A4 conv 0.png`,
  `${BASE}design_studio/part2/1_criteria-analysis_A4 conv 1.png`,
  `${BASE}design_studio/part2/1_criteria-analysis_A4 conv 2.png`,
  `${BASE}design_studio/part2/1_criteria-analysis_A4 conv 3.png`,
  `${BASE}design_studio/part2/1_criteria-analysis_A4 conv 4.png`,
];

const SUITABILITY_IMAGES = [
  `${BASE}design_studio/part2/3_suitability-maps_A3 conv 0.jpg`,
  `${BASE}design_studio/part2/3_suitability-maps_A3 conv 1 (1).jpg`,
  `${BASE}design_studio/part2/3_suitability-maps_A3 conv 2 (1).jpg`,
  `${BASE}design_studio/part2/3_suitability-maps_A3 conv 3.jpg`,
];

const NETWORK_IMAGES = [
  `${BASE}design_studio/part2/4_abstract map conv 0.jpg`,
  `${BASE}design_studio/part2/5_pen-network.png`,
];

const OLYMPIA_IMAGES = [
  `${BASE}design_studio/part2/6_Olympia conv 0.jpg`,
  `${BASE}design_studio/part2/6_Olympia conv 1.png`,
];

const VIEW_IMAGES = [
  `${BASE}design_studio/part2/vergezicht.png`,
  `${BASE}design_studio/part2/straatzicht.png`,
  `${BASE}design_studio/part2/erfgoed.png`,
  `${BASE}design_studio/part2/Doorzicht woningen.png`,
];

const PXL_IMAGES = [
  `${BASE}design_studio/part2/PXL_20240110_130345221.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130405391.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130429495.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130505329.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130526621.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130558941.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130636393.jpg`,
  `${BASE}design_studio/part2/PXL_20240110_130705933.jpg`,
];

const EXHIBITION_IMAGES = [
  `${BASE}design_studio/part2/PXL_20260610_095640256.jpg`, // Row 1
  `${BASE}design_studio/part2/PXL_20260610_095651009.jpg`,
  `${BASE}design_studio/part2/PXL_20260610_110033374.jpg`, // Row 2
  `${BASE}design_studio/part2/PXL_20260610_110050083.jpg`, // Row 2 paired with 110033374
  `${BASE}design_studio/part2/PXL_20260610_110037052.jpg`, // Row 3
  `${BASE}design_studio/part2/PXL_20260610_110039494.jpg`,
  `${BASE}design_studio/part2/PXL_20260610_110045353.jpg`, // Row 4
  `${BASE}design_studio/part2/PXL_20260610_110104973.jpg`,
  `${BASE}design_studio/part2/PXL_20260610_110112205.jpg`,
];

export default function DesignStudioDetail() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <FloatingNav />
      <Lightbox src={selectedImage} onClose={() => { setSelectedImage(null); }} />

      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' && target.closest('article, .relative')) {
          const img = target as HTMLImageElement;
          const isRotated = img.getAttribute('data-rotated') === 'true';
          setSelectedImage(isRotated ? `${(target as HTMLImageElement).src}?rotated=true` : (target as HTMLImageElement).src);
        }
      }}>
        {/* Hero Header */}
      <div className="relative flex items-center justify-center text-center text-white p-8 overflow-hidden" style={{ minHeight: '50vh' }}>
        {/* Blurred Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${BASE}design_studio/part2/Luchtfoto Olympia.jpg")`,
            filter: 'blur(1.8px)',
            transform: 'scale(1.05)', // Prevents blurred edges from showing
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
            Re-Imagining Intermediate Territories
          </h1>
          <p className="mt-4 text-lg md:text-xl opacity-90" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>
            From PED to Positive Energy Network (PEN)
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="prose prose-invert max-w-none px-8 md:px-16 lg:px-24 py-12 text-foreground/90 prose-p:leading-relaxed prose-p:text-justify">
        <p>
          The contemporary ecological transition faces a distinct challenge in Europe’s intermediate territories—hybrid, non-metropolitan landscapes characterized by scattered housing, fragmented governance, and widespread agricultural land. Working within the VUB/ULB Design Studio framework and inspired by the European InterPED research project, our interdisciplinary team challenged the traditionally urban-centric concept of Positive Energy Districts (PEDs). Instead, we used the complex fabric of Belgium's Pajottenland as a living lab to design a context-sensitive methodology that transitions from isolated districts to a connected Positive Energy Network (PEN). By analyzing the region’s metabolic flows, structural parameters, and historical settlement layers, our multi-scalar territorial approach aims to turn dispersed agro-industrial structures into socio-ecological catalysts for a collective regional energy fabric.
        </p>

        <div className="space-y-4 my-8">
          <div className="grid grid-cols-4 gap-4">
            {A_SERIES_IMAGES.map((src, i) => <img key={i} src={src} alt={`Series A image ${i + 1}`} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />)}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {B_SERIES_IMAGES.map((src, i) => <img key={i} src={src} alt={`Series B image ${i + 1}`} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />)}
          </div>
        </div>

        <p>
          To achieve this, our design studio adopted a rigorous, workshop-based research-by-design methodology divided into two fundamental phases across the semester. The first part of the semester was entirely dedicated to systemic analysis and interpretation, where we used extensive desktop research, site visits, and impromptu stakeholder interviews to unfold the layers of the Pajottenland palimpsest and pinpoint territorial barriers and opportunities. This multi-layered analytical mapping set the foundation for the second part of the studio, which shifted focus entirely toward developing actionable, design-led spatial strategies. By bridging spatial forms with socio-economic parameters and policy conditions, this secondary phase allowed us to translate abstract energy transition goals into a concrete, institutionalized design vision tailored specifically to our assigned case study.
        </p>

        <div className="grid gap-4 my-8">
          <div className="grid grid-cols-4 gap-4">
            {[SESSION_IMAGES[0], SESSION_IMAGES[1], SESSION_IMAGES[2], SESSION_IMAGES[7]].map((src, i) => (
              <img key={i} src={src} alt={`Session image ${i + 1}`} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {SESSION_IMAGES.slice(3, 7).map((src, i) => (
              <img key={i} src={src} alt={`Session image ${i + 4}`} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <img src={SPECIAL_IMAGES[1]} alt="session 6 design question" className="w-3/4 h-auto object-contain rounded-md border border-foreground/10 shadow-sm" style={{ maxHeight: '40vh' }} />
          </div>
        </div>

        <p>
          This methodology began with a comprehensive spatial criteria analysis overlaid across a 1.5 km x 1.5 km regional grid. We tracked high-tier spatial data such as farm and animal density to gauge biomass feedstock scalability, alongside local energy consumption and renewable production potentials. Crucially, we cross-referenced these metrics with the traditional landscape boundaries of Flanders (TradLa) to ensure that the deployment of capillary energy infrastructure respects historical regional morphologies and fragile heritage. To bridge these extensive GIS databases with real-world, on-the-ground stakeholders, we developed an interactive digital assessment tool. Using a web interface, a local decision-maker can input a specific address to immediately load its territorial GIS scores. By manually combining these with localized site data, such as structural integrity, roof area for solar panels, grid connectivity, and public ownership status, the tool outputs a customized radar diagram that highlights the site’s ideal programmatic potential within the network.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-8">
          {CRITERIA_IMAGES.map((src, i) => (
            <img key={i} src={src} alt={`Criteria analysis image ${i + 1}`} className="w-full h-auto object-cover rounded-md border border-foreground/10 shadow-sm" />
          ))}
        </div>

        <p>
          The data harvested from the assessment tool operationalized our research by identifying regional suitability profiles based on four distinct network functions. These functions include Processing for active energy conversion, Gathering for biomass collection and sorting logistics, Distribution for energy buffering to minimize transmission losses, and Social for contextually grounded community cooperative hubs. Extracting aerial orthophotos of the grid cells revealed that while the highest and lowest scores followed the traditional urban-rural divide, the moderately suited spaces were dispersed across the entire Pajottenland. This finding verified the exact nature of an intermediate territory, showcasing a rich multiplicity of moderately suited nodes waiting to be integrated into a regional system. We translated this spatial logic into an Abstract Network Map and a conceptual Word Matrix to illustrate how different actors, such as local enterprises, breweries, schools, and farms, can structurally complement one another through shared workflows without requiring any single site to be completely overhauled.
        </p>

        <ImageGrid>
            <Image src={SUITABILITY_IMAGES[0]} alt="Suitability map for Processing function" />
            <Image src={SUITABILITY_IMAGES[1]} alt="Suitability map for Gathering function" />
            <Image src={SUITABILITY_IMAGES[2]} alt="Suitability map for Distribution function" />
            <Image src={SUITABILITY_IMAGES[3]} alt="Suitability map for Social function" />
        </ImageGrid>

        <Image src={NETWORK_IMAGES[0]} alt="Abstract Network Map" />
        <Image src={NETWORK_IMAGES[1]} alt="Abstract Network Map" />

        <p>
          To ground this regional network logic into an architectural reality, we created a pilot design proposal for the Olympia site, a massive 22,600 m² former milk-processing facility in Herfelingen that historically anchored the area's agricultural logistics. Identified by our tool as a prime node for regional gathering and localized processing, our proposal reimagined how this architectural asset could anchor the broader energy network while integrating harmoniously into its neighborhood context to prevent local pushback. The physical intervention is guided by four distinct design principles, starting with mobility integration to streamline large transport logistics while opening green pathways for community access and educational spaces. Deep landscape connectivity is achieved by orienting roof slopes southward for future solar deployment and framing structural landmarks within the hilly topography. Furthermore, the design prioritizes historical preservation by celebrating the aesthetic language of the industrial silos and steel components, while segmenting the extensive 240m façade to relate to the smaller scale of nearby residential housing. Ultimately, this architectural manifestation provides an actionable framework, turning an abandoned agro-industrial asset into a vital, public-facing anchor for future positive energy landscapes within intermediate territories.
        </p>

        <ImageGrid>
            <Image src={OLYMPIA_IMAGES[0]} alt="Olympia Site Design - View 1" />
            <Image src={OLYMPIA_IMAGES[1]} alt="Olympia Site Design - View 2" />
        </ImageGrid>

        <ImageCollage images={VIEW_IMAGES} />

        <p>
          For the final presentation and evaluation of our work, this entire methodology, from the regional GIS models to the interactive digital application, was compiled into a group exhibition and oral jury defense. The exhibition space showcased our analytical maps, scenarios, and site architectural drawings alongside a physical maquette of the Olympia pilot site, effectively visualizing how data-driven territorial design can actively reshape future positive energy landscapes. This comprehensive project would not have been possible without the intense dedication, fieldwork, and interdisciplinary collaboration of my colleagues: Anastasia Balian, Yannick Fischer, Iliana Ingoglia, Nils Lindemans, Heidi Van Eetvelt.
        </p>

        <div className="grid grid-cols-1 gap-4 my-8">
          <div className="grid grid-cols-2 gap-4">
            <img src={EXHIBITION_IMAGES[0]} alt="Exhibition view 1" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" />
            <img src={EXHIBITION_IMAGES[1]} alt="Exhibition view 2" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" />
          </div>
          <div className="grid grid-cols-2 gap-4 items-center justify-items-center">
            <img src={EXHIBITION_IMAGES[2]} alt="Exhibition view 3" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" style={{ maxHeight: '40vh' }} />
            <img src={EXHIBITION_IMAGES[3]} alt="Exhibition view 6" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" style={{ maxHeight: '40vh' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={EXHIBITION_IMAGES[4]} alt="Exhibition view 4" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" />
            <img src={EXHIBITION_IMAGES[5]} alt="Exhibition view 5" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <img src={EXHIBITION_IMAGES[6]} alt="Exhibition view 7" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" style={{ maxHeight: '40vh' }} />
            <img src={EXHIBITION_IMAGES[7]} alt="Exhibition view 8" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" style={{ maxHeight: '40vh' }} />
            <img src={EXHIBITION_IMAGES[8]} alt="Exhibition view 9" className="w-full h-full object-contain rounded-md [filter:drop-shadow(0_1px_2px_rgb(0,0,0,0.1))_drop-shadow(0_1px_1px_rgb(0,0,0,0.06))]" style={{ maxHeight: '40vh' }} />
          </div>
        </div>

      </article>
      </div>
    </>
  );
}