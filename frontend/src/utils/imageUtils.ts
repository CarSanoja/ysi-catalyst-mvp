/**
 * Utility functions for handling shaper images
 */

/**
 * Get the full image URL for a shaper's photo
 * @param photoPath - The photo path from the database (e.g., "/images/shapers/1-priyanka-jaisinghani.jpg")
 * @returns The full image URL or a default placeholder
 */
export const getShaperImageUrl = (photoPath?: string): string => {
  if (!photoPath) {
    return '/images/shapers/default-avatar.jpg';
  }

  // If it's already a full URL, return as-is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }

  // Ensure the path starts with /
  const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  return normalizedPath;
};

/**
 * Generate the expected image filename for a shaper based on their ID and name
 * @param id - The shaper's ID
 * @param name - The shaper's name
 * @returns The expected filename (e.g., "1-priyanka-jaisinghani.jpg")
 */
export const generateShaperImageFilename = (id: number, name: string): string => {
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();

  return `${id}-${sanitizedName}.jpg`;
};

/**
 * Generate the full image path for a shaper
 * @param id - The shaper's ID
 * @param name - The shaper's name
 * @returns The full image path (e.g., "/images/shapers/1-priyanka-jaisinghani.jpg")
 */
export const generateShaperImagePath = (id: number, name: string): string => {
  const filename = generateShaperImageFilename(id, name);
  return `/images/shapers/${filename}`;
};

/**
 * Check if an image exists by attempting to load it
 * @param imagePath - The path to the image
 * @returns Promise that resolves to true if image exists, false otherwise
 */
export const checkImageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

/**
 * Get a fallback image URL if the primary image doesn't exist
 * @param primaryPath - The primary image path
 * @param fallbackPath - Optional fallback path, defaults to default avatar
 * @returns Promise that resolves to the appropriate image path
 */
export const getShaperImageWithFallback = async (
  primaryPath?: string,
  fallbackPath: string = '/images/shapers/default-avatar.jpg'
): Promise<string> => {
  if (!primaryPath) {
    return fallbackPath;
  }

  const imageUrl = getShaperImageUrl(primaryPath);
  const exists = await checkImageExists(imageUrl);

  return exists ? imageUrl : fallbackPath;
};