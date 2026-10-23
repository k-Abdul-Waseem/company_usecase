import { apiProvider } from '@/services/api';

/** Approved content library facade. */
export const contentService = {
  list: (params = {}) => apiProvider.content.list(params),
  upload: (input) => apiProvider.content.upload(input),
  retry: (id) => apiProvider.content.retry(id),
  remove: (id) => apiProvider.content.remove(id),

  async getStats() {
    const documents = await apiProvider.content.list({});
    return {
      total: documents.length,
      indexed: documents.filter((document) => document.status === 'indexed').length,
      processing: documents.filter((document) => document.status === 'processing').length,
      uploaded: documents.filter((document) => document.status === 'uploaded').length,
      failed: documents.filter((document) => document.status === 'failed').length,
      indexedChunks: documents.reduce(
        (sum, document) =>
          sum + (document.status === 'indexed' ? document.chunkCount ?? 0 : 0),
        0,
      ),
    };
  },
};
