
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
        // In a real app, this would be a POST request to an endpoint that returns the file URL
        console.log(`[Storage] Uploading file: ${file.name} (${file.size} bytes)`);
        
        // Return a fake URL based on file type for preview purposes
        if (file.type.startsWith('image/')) {
          // Use a random placeholder for images if we can't create a local object URL in this env safely,
          // but URL.createObjectURL is better for immediate preview simulation.
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        } else {
          resolve('https://example.com/file-download-link.pdf');
        }
      }, 1500);
    });
  }
};
