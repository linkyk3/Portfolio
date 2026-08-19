import { r2Url } from '@/lib/r2';
import { VisualizationGallery } from '@/components/VisualizationGallery';
import { VISUALIZATION_COLLECTIONS } from './visualizationCollections.data';

const VISUALIZATION_SUBNAV = [{ label: 'Collections', href: '/visualizations/collections' }];

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

const mainPageImageUrls = VISUALISATION_IMAGE_NAMES.map(name => r2Url(`visualisations/mainpage/${name}`));

const collectionImageUrls = VISUALIZATION_COLLECTIONS.flatMap(collection =>
  collection.files.map(file =>
    r2Url(['visualisations', 'collections', collection.folder, file].map(encodeURIComponent).join('/'))
  )
);

const allImageUrls = [...new Set([...mainPageImageUrls, ...collectionImageUrls])];

const Visualizations = () => (
  <VisualizationGallery headerTitle="Visualizations" subnav={VISUALIZATION_SUBNAV} imageUrls={allImageUrls} />
);

export default Visualizations;
