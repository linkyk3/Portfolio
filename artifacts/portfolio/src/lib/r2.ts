// Fallback keeps builds working if VITE_PUBLIC_ASSETS_URL isn't set (e.g. missing Vercel env var).
export const R2_BASE_URL =
  import.meta.env.VITE_PUBLIC_ASSETS_URL || 'https://pub-c0213405e2bb46a699b3f27d6cc98185.r2.dev';

export const r2Url = (path: string) => `${R2_BASE_URL}/${path}`;
