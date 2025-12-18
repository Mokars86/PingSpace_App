import { supabase } from "./supabase";

/**
 * Supabase Storage Service
 * Handles uploading media to Supabase Storage Buckets.
 */

export const storageService = {
  uploadFile: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('pingspace_media')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('pingspace_media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
