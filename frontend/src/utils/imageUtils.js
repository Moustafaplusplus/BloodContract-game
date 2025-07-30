/**
 * Utility functions for handling image URLs
 */

/**
 * Constructs a proper image URL that points to the backend server
 * @param {string} imageUrl - The image URL from the database
 * @returns {string|null} - The full URL to the image or null if no URL provided
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
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
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const fullUrl = `${backendUrl}${imageUrl}`;
      return fullUrl;
    }
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  // Ensure proper URL encoding for the filename only
  const encodedUrl = encodeURIComponent(imageUrl);
  return `${backendUrl}/${encodedUrl}`;
};

/**
 * Gets the backend URL for static assets
 * @returns {string} - The backend URL
 */
export const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

/**
 * Handles image loading errors by hiding the image and showing a fallback
 * @param {Event} e - The error event
 * @param {string} imageUrl - The original image URL for logging
 */
export const handleImageError = (e, imageUrl) => {
  console.error('Failed to load image:', imageUrl);
  console.error('Image element:', e.target);
  
  // Additional debugging information
  const processedUrl = getImageUrl(imageUrl);
  console.error('Processed URL:', processedUrl);
  console.error('Environment:', {
    isDev: import.meta.env.DEV,
    apiUrl: import.meta.env.VITE_API_URL
  });
  
  // Hide the failed image
  e.target.style.display = 'none';
  
  // Show fallback if it exists
  const fallback = e.target.nextElementSibling;
  if (fallback && fallback.style) {
    fallback.style.display = 'flex';
  }
  
  // If no fallback exists, create a simple one
  if (!fallback) {
    const parent = e.target.parentElement;
    if (parent) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-bloodcontract-700 text-bloodcontract-400';
      fallbackDiv.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path></svg>';
      parent.appendChild(fallbackDiv);
    }
  }
};

/**
 * Validates if an image URL is valid
 * @param {string} imageUrl - The image URL to validate
 * @returns {boolean} - True if the URL is valid
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl) return false;
  
  // Check if it's a valid URL format
  try {
    const url = new URL(imageUrl.startsWith('http') ? imageUrl : `http://localhost:5001${imageUrl}`);
    return url.pathname.length > 0;
  } catch {
    return false;
  }
}; 