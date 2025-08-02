/**
 * Utility functions for handling image URLs
 */

/**
 * Constructs a proper image URL that handles both Firebase Storage and local URLs
 * @param {string} imageUrl - The image URL from the database
 * @returns {string|null} - The full URL to the image or null if no URL provided
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL (Firebase Storage or other CDN), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it starts with /, it's a relative path from the backend
  if (imageUrl.startsWith('/')) {
    // In development, use the proxy (relative URL)
    // In production, use the full backend URL
    const isDev = import.meta.env.DEV;
    if (isDev) {
      // Use relative URL for proxy in development
      return imageUrl;
    } else {
      // Use full URL in production
      const backendUrl = import.meta.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app';
      const fullUrl = `${backendUrl}${imageUrl}`;
      return fullUrl;
    }
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  const backendUrl = import.meta.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app';
  // Ensure proper URL encoding for the filename only
  const encodedUrl = encodeURIComponent(imageUrl);
  return `${backendUrl}/${encodedUrl}`;
};

/**
 * Gets the backend URL for static assets
 * @returns {string} - The backend URL
 */
export const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app';
};

/**
 * Handles image loading errors by hiding the image and showing a fallback
 * @param {Event} e - The error event
 * @param {string} imageUrl - The original image URL for logging
 */
export const handleImageError = (e, imageUrl) => {
  console.warn('Image failed to load:', imageUrl);
  e.target.style.display = 'none';
  
  // Show fallback if available
  const fallback = e.target.nextElementSibling;
  if (fallback && fallback.classList.contains('image-fallback')) {
    fallback.style.display = 'block';
  }
};

/**
 * Validates if a URL is accessible
 * @param {string} imageUrl - The image URL to validate
 * @returns {Promise<boolean>} - True if the URL is accessible
 */
export const validateImageUrl = async (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    const url = new URL(imageUrl.startsWith('http') ? imageUrl : `https://bloodcontract-game-production.up.railway.app${imageUrl}`);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image URL validation failed:', error);
    return false;
  }
}; 