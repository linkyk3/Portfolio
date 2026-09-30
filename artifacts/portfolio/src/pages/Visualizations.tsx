import { r2Url } from '@/lib/r2';
import { VisualizationGallery } from '@/components/VisualizationGallery';
import { VISUALIZATION_COLLECTIONS } from './visualizationCollections.data';

const VISUALIZATION_SUBNAV = [{ label: 'Collections', href: '/visualizations/collections' }];

const collectionImageUrls = VISUALIZATION_COLLECTIONS.flatMap(collection =>
  collection.files.map(file =>
    r2Url(['visualisations', 'collections', collection.folder, file].map(encodeURIComponent).join('/'))
  )
);

const allImageUrls = [...new Set(collectionImageUrls)];

const Visualizations = () => (
  <VisualizationGallery headerTitle="Visualizations" subnav={VISUALIZATION_SUBNAV} imageUrls={allImageUrls} />
);

export default Visualizations;
