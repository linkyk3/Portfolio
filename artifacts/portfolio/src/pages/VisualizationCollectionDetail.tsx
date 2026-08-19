import { useRoute } from 'wouter';
import { r2Url } from '@/lib/r2';
import { VisualizationGallery } from '@/components/VisualizationGallery';
import { getCollectionBySlug } from './visualizationCollections.data';
import NotFound from './not-found';

const COLLECTION_SUBNAV = [
  { label: 'All Visualizations', href: '/visualizations' },
  { label: 'Collections', href: '/visualizations/collections' },
];

// Encode each path segment separately so folder/file names with spaces resolve correctly.
const collectionImageUrl = (folder: string, file: string) =>
  r2Url(['visualisations', 'collections', folder, file].map(encodeURIComponent).join('/'));

const VisualizationCollectionDetail = () => {
  const [, params] = useRoute('/visualizations/collections/:slug');
  const collection = params?.slug ? getCollectionBySlug(params.slug) : undefined;

  if (!collection) {
    return <NotFound />;
  }

  const imageUrls = collection.files.map(file => collectionImageUrl(collection.folder, file));

  return <VisualizationGallery headerTitle={collection.title} subnav={COLLECTION_SUBNAV} imageUrls={imageUrls} />;
};

export default VisualizationCollectionDetail;
