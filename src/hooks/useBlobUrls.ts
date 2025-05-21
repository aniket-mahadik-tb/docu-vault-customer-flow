import { useEffect } from 'react';

// Keep track of created Blob URLs to revoke them when no longer needed
const createdBlobUrls = new Set<string>();

export const useBlobUrls = () => {
  // Cleanup function to revoke all created Blob URLs when context is unmounted
  useEffect(() => {
    return () => {
      createdBlobUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
      createdBlobUrls.clear();
    };
  }, []);
  
  const trackBlobUrl = (url: string) => {
    createdBlobUrls.add(url);
    return url;
  };
  
  const revokeBlobUrl = (url: string) => {
    if (url.startsWith('blob:') && createdBlobUrls.has(url)) {
      URL.revokeObjectURL(url);
      createdBlobUrls.delete(url);
    }
  };
  
  return {
    trackBlobUrl,
    revokeBlobUrl,
    createdBlobUrls
  };
};
