

/**
 * Mock Storage Service
 * Simulates uploading files to a cloud storage provider (e.g., AWS S3, Cloudinary).
 */

export const storageService = {
  /**
   * Simulates uploading a file.
   * Returns a promise that resolves to a mock URL after a delay.
   */
  uploadFile: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate network latency
      setTimeout(() => {
        console.log(`[Storage] Uploading file: ${file.name} (${file.size} bytes, type: ${file.type})`);
        
        // For media files, create a local object URL to allow immediate preview playback/viewing
        // This simulates the returned CDN url
        if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        } else {
          // For other files, return a fake downloadable link
          resolve(`https://example.com/files/${file.name}`);
        }
      }, 1000);
    });
  }
};