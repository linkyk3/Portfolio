import { Image, ImageGrid } from './ProjectDetail';
import { useState, useEffect, useRef } from 'react';
import { FloatingNav } from '@/components/FloatingNav';

const BASE = import.meta.env.BASE_URL;

// Inlined Lightbox component to resolve import issues
function Lightbox({ src, onClose }: { src: string | null; onClose: () => void; }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({});
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

  if (!cleanSrc) return null;

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
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img ref={imgRef} src={cleanSrc} alt="Enlarged view" 
             onMouseMove={handleMouseMove} 
             onClick={(e) => { setIsZooming(prev => !prev); handleMouseMove(e); }}
             className={`object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-in-out ${isZooming ? 'cursor-crosshair' : 'cursor-zoom-in'} ${isVisible ? 'scale-100' : 'scale-95'} max-w-[80vw] max-h-[80vh]`} />
        {isZooming && (
          <div className="absolute pointer-events-none rounded-full border-2 border-white/50 bg-no-repeat shadow-2xl" style={{ ...magnifierStyle, backgroundImage: `url(${cleanSrc || ''})`, width: magnifierSize, height: magnifierSize }} />
        )}
      </div>
    </div>
  );
}

export default function ThesisDetail() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <FloatingNav />
      {/* Hero Header */}
      <Lightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
      <div onClick={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.tagName === 'IMG' && target.closest('article')) { setSelectedImage(target.src); }
      }}>
      <div
        className="relative flex items-center justify-center text-center text-white p-8 bg-cover bg-center"
        style={{ backgroundImage: `url(${BASE}thesis/hero-background.jpg)`, minHeight: '50vh' }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
            De buurtspoorwegen in Brabant
          </h1>
          <p className="mt-4 text-lg md:text-xl opacity-90" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>
            Een historisch-morfologische lezing van het diffuse verstedelijkingsproces.
          </p>
        </div>
      </div>

      {/* Article Content */}
      <article className="prose prose-invert max-w-none px-8 md:px-16 lg:px-24 py-12 text-foreground/90 prose-p:leading-relaxed prose-p:text-justify">
        <blockquote className="border-l-4 border-accent pl-6 italic text-foreground/80 not-italic">
          <p>Die ochtend heb ik de man gezien, die de Dood in ‘t aangezicht aanschouwde... Ik zat op het landelijk stoomtrammetje, dat door de bloeiende lentevelden reed. Het is een verrukking, waarvan ik nooit verzadigd ben. Een trein is een somber, lelijk, log ding, dat over stug-getrokken, geometrische lijnen, zo snel en zo recht mogelijk op zijn doel af vliegt. Men is niet in het landschap met een trein. Men raast er bezijden, of er boven, langs eentonige dijken en sloten. Een stoomtrammetje daarentegen, zit laag tegen de grond en dringt kronkelend en gezellig in het hart zelf van de streek. ‘t Is als een beestje, dat zo goed zijn wegen kent en van alles geniet [...] Hier golven en deinen zacht in de wind de wijde korenakkers; dáár ligt de tintelende goudvlek van een bloeiend koolzaadveld; daarnaast het smaragden fluweel van een vlasaard; en ginds in de verte punt een fijn kerktorentje ten blauwen hemel; daar ligt een eenzaam dorpje in het groen van de bomen; en al spoedig zien wij de huisjes: de witte, de roze, de gele, met felrood pannendak en groene luikjes en wij houden weldra stil op ‘t pleintje vóór de kerk, waar enkele deftiger woningen staan en enige herbergen, die van ouds bekende namen dragen: In den Groenen Boomgaard, In den Dubbelen Arend, In het Huis van Commercie, In de Hope van Vrede, In den Leeuw van Vlaanderen. Te weinig mensen waarderen de gemoedelijke poëzie en de gezellige intimiteit van de stoomtram. Die moest in eer hersteld worden; en de trein, het lelijke, praktische monster, vernederd</p>
          <footer className="text-right text-sm text-foreground/60 mt-4">— Cyriel Buysse, 1978</footer>
        </blockquote>

        <Image src={`${BASE}thesis/extract-2.jpg`} alt="Extract 2" />

        <p>Ooit bezat België het dichtste spoor- en tramnetwerk ter wereld. Waar zijn deze sporen gebleven? Hoewel de Belgische diffuse verstedelijking vaak wordt afgedaan as chaos, hanteerde de Nationale Maatschappij van Buurtspoorwegen (NMVB) een specifieke planningslogica waarin staatsdoelstellingen en lokale noden werden verzoend via een territoriaal tramnetwerk. De rol van de buurtspoorwegen in het diffuse verstedelijkingsproces, die een symbiose vormden tussen het nationale macronetwerk en de <i>in-situ</i>-verstedelijking van het lokale weefsel, is dan ook niet te onderschatten. De latere verschuiving van collectief spoorvervoer naar individueel personenvervoer luidde een dissociatie in tussen infrastructuur en verstedelijking. Het resultaat is een dunne stedelijke nevel: een diffuse conditie die zich permanent over het territorium heeft uitgespreid. Vandaag bevindt dit model zich op een kritiek kantelpunt. Negatieve externaliteiten dwingen ons tot een herinterpretatie van het territorium. Welke lessen kunnen we trekken uit een historische en morfologische lezing van de buurtspoorwegen die aan de basis lagen van dit verstedelijkingsproces? Via verschillende cartografische en visuele herinterpretaties, gekoppeld aan archiefonderzoek, worden de historische tracés van het buurtspoorwegennetwerk in Brabant met als rode draad de case study lijn Tervuren-Tienen (de ‘Zwarte Jean’) doorgrond. Dit onderzoek toont aan dat deze relicten nog latent aanwezig zijn en dat deze retroactief hergebruikt kunnen worden voor een duurzamere ruimtelijke transitie.</p>

        <ImageGrid>
          <Image src={`${BASE}thesis/extract-1.jpg`} alt="Extract 1" />
          <Image src={`${BASE}thesis/extract-3.jpg`} alt="Extract 3" />
        </ImageGrid>

        <p>Dit onderzoek is begonnen vanuit enerzijds een fascinatie voor het feit dat België ooit het dichtste spoor- en tramnetwerk ter wereld had en de vraag waar dit netwerk is gebleven. Anderzijds vertrekt het vanuit de vaststelling dat België zich bevindt in een redelijk specifieke ruimtelijke conditie die op een eigen manier gelezen moet worden. Vandaag de dag wordt de Belgische verstedelijking vaak bekritiseerd en afgedaan als een chaotische situatie die het resultaat is van een fundamenteel gebrek aan planning. Hoewel hier zeker een kern van waarheid in zit, probeert dit onderzoek aan te tonen dat het een genuanceerder verhaal is dat tot stand komt wanneer elke schakel in de geschiedenis van de Belgische verstedelijking van dichterbij bestudeerd wordt. Zo vormde de Nationale Maatschappij van Buurtspoorwegen (NMVB), opgericht in 1884, hierin een belangrijke sleutel. Op haar hoogtepunt beheerde deze maatschappij een groot netwerk van ongeveer 5.000 kilometer aan smalspoor en beschikte zij over zo’n 3.000 voertuigen. Hierbij fungeerden de buurtspoorwegen als een krachtig instrument voor een bewuste verzoeningspolitiek, net zoals jaren ervoor bij de spoorwegen. Het bood de arbeidersklasse de kans om economisch te emanciperen via loonarbeid of goederenverkoop in de stad, terwijl zij fysiek en sociaal verankerd bleven in hun rurale dorpsstructuren. Door deze symbiose tussen het lokale en het nationale hielden de buurtspoorwegen een directe verbinding tussen infrastructuur en verstedelijking in stand.</p>

        <Image src={`${BASE}thesis/extract-4.jpg`} alt="Extract 4" />

        <p>De naoorlogse transitie van collectief spoorvervoer naar individueel personenvervoer doorbrak deze balans echter definitief. Het ruimtelijk resultaat is een dunne stedelijke nevel: een diffuse conditie die zich als een permanente, isotrope en perifere toestand over het territorium heeft uitgespreid. Al zijn de fysieke sporen van de buurtspoorwegen vaak uit het zicht verdwenen, blijven ze wel nog latent aanwezig in het territorium. Als we de huidige verstedelijkingsprocessen in een duurzame richting willen sturen, is het van cruciaal belang om toekomstige transformaties te verankeren in deze bestaande historische reality. Het is dus vanuit dit opzicht dat de centrale onderzoeksvraag werd gevormd: “Welke lessen kunnen we trekken uit een historische en morfologische lezing van de buurtspoorwegen voor het begrijpen van de diffuse verstedelijking in de Brabantse context?” De overheid wedde destijds op twee paarden. Aan de ene kant faciliteerde ze een top-down gepland macro-netwerk van spoorwegen en kanalen om grote nationale en internationale stedelijke polen en industrieën met elkaar te verbinden. Anderzijds stimuleerde de overheid via fijnmazige netwerken en huisvestingswetten de rurale stabiliteit, wat een grootschalige in-situ verstedelijking mogelijk maakte.</p>

        <ImageGrid>
          <Image src={`${BASE}thesis/extract-5.jpg`} alt="Extract 5" />
          <Image src={`${BASE}thesis/extract-6.jpg`} alt="Extract 6" />
        </ImageGrid>

        <p>Om een onderbouwd antwoord op deze vraag te formuleren, is deze thesis vertrokken vanuit een methodologisch tweeluik. Enerzijds schetst een historische en hedendaagse literatuurstudie een nuchter beeld van de politieke, sociale en theoretische context van de buurtspoorwegen. Anderzijds ontleedt een ruimtelijke analyse hoe de samenkomst van nationaal top-down beleid en lokaal bottom-up initiatief zich concreet vertaalde in de materiële logica van het netwerk. Hierbij hanteer ik de tramlijn Tervuren–Tienen, beter bekend als de 'Zwarte Jean', als centrale casus. Methodologisch vertaal ik deze ruimtelijke analyse naar een gelaagde mapping over meerdere schalen via macro-, meso- en microgrids. Deze 're-cartografie' fungeert niet als een neutrale weergave, maar als een analytische en prospectieve methode om verborgen ruimtelijke verbanden en structuren tussen de buurtspoorwegen en de omgeving bloot te leggen. Dit werd gedaan aan de hand van een superpositie van historische kaarten en datasets, aangevuld met eigen veldwerk. Ook werden de archieven van de NMVB uit het Vlaams Tram- en Autobusmuseum (VlaTAM) geraadpleegd om zoveel mogelijk materiaal, zoals gedetailleerde perceelplannen en onteigeningsplannen, direct uit de bron te reconstrueren.</p>

        <Image src={`${BASE}thesis/extract-7.jpg`} alt="Extract 7" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 my-8">
          <Image src={`${BASE}thesis/extract-9.jpg`} alt="Extract 9" />
          <Image src={`${BASE}thesis/extract-10.jpg`} alt="Extract 10" />
          <Image src={`${BASE}thesis/extract-11.jpg`} alt="Extract 11" />
          <Image src={`${BASE}thesis/extract-12.jpg`} alt="Extract 12" />
        </div>

        <p>De rode draad van de ruimtelijke analyse is de voormalige tramlijn Tervuren–Tienen, in de volksmond beter bekend als de 'Zwarte Jean', opgericht in 1897. Wat de Zwarte Jean speciaal maakt, is dat ze voornamelijk door ruraal landbouwgebied liep en ook volstrekt met deze opzet is opgericht, waardoor redelijk wat stukken van het tracé tot vandaag de dag nog zichtbaar aanwezig zijn in het landschap. In tegenstelling tot de aanpalende buurtspoorlijnen zoals Brussel–Vossem of Tervuren–Leuven, die hoofdzakelijk stedelijke polen verbonden en over steenwegen liepen, had de Zwarte Jean een volstrekt eigen logica. Alleen al het hoogteprofiel van de lijn toont aan in hoeverre het tracé het onderliggende reliëf moest overwinnen. Aangezien elke buurtspoorlijn destijds vanuit een specifieke lokale context werd opgezet, bezit elk tracé een eigen logica. Om de verschillen in morfologie en functie van deze lijn te onderscheiden, maakt dit onderzoek gebruik van de spons- en buismetafoor van Secchi en Viganò. In deze zin kunnen we de Zwarte Jean het best beschrijven als een 'spons'. In tegenstelling tot een ‘buis’, sluit de Zwarte Jean zich niet af, maar plooit ze zich in het bestaande reliëf om zoveel mogelijk landbouwproductie te absorberen en lokaliteiten te ontsluiten.</p>

        <Image src={`${BASE}thesis/extract-8.jpg`} alt="Extract 8" />

        <p>Om de eigenheid van de Zwarte Jean verder te verduidelijken, werd de analyse opgedeeld in de relatie tussen het tracé en de fysische geografie, de landbouw en de verstedelijking, telkens bekeken op verschillende schaalniveaus. In tegenstelling tot grootschaligere netwerken zoals de spoorwegen, zocht de Zwarte Jean een symbiose met de topografie. Vanwege de technische limieten van stoomtractie was de tram verplicht het bestaande reliëf en de natuurlijke contouren nauwgezet te volgen. Het tracé werd gedicteerd door de wisselwerking tussen de droge leemplateaus, zoals die van Duisburg en Beauvechain, en de diep ingesneden riviervalleien zoals de Dijlevallei. Op verschillende plekken waren dan ook fysieke kunstwerken nodig om de hellingsgraad te minimaliseren en het spoor te vrijwaren van overstromingen.</p>

        <Image src={`${BASE}thesis/extract-13.jpg`} alt="Extract 13" />

        <p>We kunnen ons de vraag stellen waarom al deze moeite gedaan werd om in dit uitdagende gebied een stoomtram aan te leggen. De Zwarte Jean fungeerde in essentie als een 'bietentram' die een cruciale logistieke schakel vormde voor het transport van de suikerbietenteelt naar de suikerfabrieken in Tienen en Waver. Om de transportkosten te minimaliseren, liep het tracé hoofdzakelijk door het open akkerland en meanderde het als een spons langs grote, geïsoleerde hoeves. De buurtstations zochten daarbij vaak een balans tussen het bedienen van deze hoeves enerzijds en de dorpskern anderzijds, waardoor de stations zich in de praktijk dikwijls een stuk buiten de historische dorpskern bevonden.</p>

        <Image src={`${BASE}thesis/extract-14.jpg`} alt="Extract 14" />

        <p>In tegenstelling tot radiale buurtspoorlijnen die bestaande steenwegen volgden en de longitudinale verstedelijking versterkten, hanteerde de 'Zwarte Jean' een autonome, transversale logica waarmee het in een eigen bedding het weefsel haaks doorkruiste. Om overlast in de dorpskernen en duren onteigeningen te vermijden, maakte het tracé slechts sporadisch contact met de publieke zijde van de bebouwing en liep het veelal binnendoor langs de achterkant van de dorpen. Dit bracht een specifieke bipolaire dorpsstructuur voort, waarbij een 'Statiestraat' de historische kern verbond met het nieuwe infrastructurele knooppunt. Deze stations en haltes fungeerden op microschaal als actieve facilitators die lokaal ondernemerschap en een stedelijke conditie aantrokken. Dit varieerde van lokale cafés in Loonbeek en Vossem tot de uitbouw van een stationswijk in Sint-Joris-Weert en de melkerij Emmerechts in Neerijse. Het zijn exact deze specifieke punten die de latere oorsprong vormden voor de verdere uitbreiding van de omliggende bebouwing.</p>

        <ImageGrid>
          <Image src={`${BASE}thesis/extract-15.jpg`} alt="Extract 15" />
          <Image src={`${BASE}thesis/extract-16.jpg`} alt="Extract 16" />
        </ImageGrid>

        <p>De Zwarte Jean en het merendeel van het buurtspoorwegennetwerk kan dus omschreven worden als een sponsachtige structuur die een nauwe relatie onderhoudt met de omliggende omgeving, juist omdat het reeds bestaande lokaliteiten bediende en versterkte. Dit wordt gereflecteerd in de fijnmazige relatie met de topografie, de landbouw en de lokale verstedelijking patronen. In tegenstelling tot pijpachtige structuren zoals de nationale spoorwegen en latere snelwegen, die opereren volgens een rigide 'punt A naar punt B'-logica en enkel toegankelijk zijn via grotere stations of op- en afritten, verdeelde de buurtspoorweg de bereikbaarheid veel gelijkmatiger over het landschap.</p>

        <Image src={`${BASE}thesis/extract-17.jpg`} alt="Extract 17" />

        <p>De historische betekenis van dit netwerk ligt in haar rol als een stabiliserende schakel tussen de selectieve macro-interventies van de overheid en de a-selectieve, organische dynamiek van het gebouwde tussenruimte. Vóór de Tweede Wereldoorlog leidde deze relatie tot een duidelijke symbiose. Omdat de tram destijds de belangrijkste collectieve vervoersmodus was, stimuleerde dit een gerichte verstedelijking en verdichting rondom de buurtstations en de historische dorpskernen, waardoor infrastructuur en bebouwing over verschillende schaalniveaus op elkaar afgestemd bleven. De naoorlogse transitie naar individueel personenvervoer over de weg verstoorde dit evenwicht echter fundamenteel. Terwijl de nieuwe infrastructuren zoals snelwegen zich steeds hiërarchischer gingen structureren, verspreidde de bebouwing zich op een homogene wijze over het territorium. De buurtspoorwegen vormden destijds de binding die deze schaalniveaus met elkaar verbond. Met het wegvallen van dit collectieve ankerpunt raakte de mobiliteit losgekoppeld van specifieke knooppunten, waardoor de situatie ontstond waarin men in theorie overal kon geraken en overal kon wonen.</p>

        <Image src={`${BASE}thesis/extract-18.jpg`} alt="Extract 18" />

        <p>Wat kunnen we vandaag de dag leren van deze morfologische erfenis, nu we botsen op de ecologische grenzen van dit verspreide model? Dit onderzoek pleit voor een grondige herdenking van de relatie tussen infrastructuur en verstedelijking. Waar veel van de buurtspoorlijnen verdwenen zijn, blijven veel van deze tracés wel nog latent aanwezig in het landschap, zoals aangetoond door de Zwarte Jean. Vandaag blijft veel van dit potentieel echter onbenut of gereduceerd tot een eendimensionale herbestemming. Het potentieel ligt juist in het heractiveren van deze voormalige lijnen, omdat ze historisch gezien zo sturend waren in de verstedelijkingspatronen. We moeten deze voormalige lijnen herdenken in zowel lineaire als transversale richting. Longitudinaal kunnen de tracés fungeren als zachte recreatieve verbindingen—zoals de landinrichtingsplannen 'Missing Links' en 'OVID' van de VLM reeds aantonen voor de Zwarte Jean. Transversaal moeten ze transformeren tot ecotopen en ecologische corridors. De beplante historische taluds van de trambedding kunnen heel concreet worden ingezet voor erosiebestrijding door water- en modderafspoeling van de hoger gelegen landbouwplateaus effectief af te remmen, terwijl lineaire groenstructuren de lokale biodiversiteit ondersteunen en hittestress tegengaan.</p>

        <Image src={`${BASE}thesis/extract-19.jpg`} alt="Extract 19" />

        <p>De erfenis van de buurtspoorwegen bewijst zodoende dat fysieke dichtheid niet de enige manier is om een territorium te structureren; de kwaliteit waarmee verschillende schaalniveaus en landschapslagen met elkaar worden verbonden, vormt de ware sleutel tot een veerkrachtige en duurzame verstedelijking. Natuurlijk zijn er veel andere aspecten die meespelen, maar het is juist door een variatie aan analyses dat we bijdragen aan een gedifferentieerd begrip van de verstedelijkingsprocessen binnen België. Op deze wijze wordt het territorium van onderuit begrepen, wat een noodzakelijk tegenwicht biedt aan de gangbare, top-down benaderingen. Toekomstige ruimtelijke interventies in het territorium moeten bijgevolg ook onvoorwaardelijk vertrekken vanuit een diepgaande lezing en het begrijpen van de bestaande structuren, alvorens fysiek in te grijpen. Enkel zo kunnen onvoorziene, negatieve neveneffecten worden vermeden. Dit onderzoek levert hiermee een bijdrage aan een diepere, gelaagde lezing van ons landschap. De uiteindelijke les van deze reflectie luidt dan ook dat het herstellen van de breuklijn tussen infrastructuur, landschap en samenleving vraagt om een proactieve, gelaagde herlezing van het territorium.</p>

        <Image src={`${BASE}thesis/extract-20.jpg`} alt="Extract 20" />
      </article>
      </div>
    </>
  );
}