// Central API configuration
// Change this URL when deploying backend to cloud
export const API_BASE_URL = 'https://feuda.vercel.app';
export const MAIN_URL = 'http://feudatech.com';

// Helper to build full API endpoint URLs
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Helper to build full upload/image URLs  
export const uploadUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already absolute
  return `${MAIN_URL}${path}`;
};

