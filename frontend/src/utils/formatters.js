// Placeholder image when a property has no photo available
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Photo+Available';

// Safely parses the L_Photos field and returns the first valid image URL.

export function getFirstPhotoUrl(photosData) {
  if (!photosData) return DEFAULT_PLACEHOLDER;

  try {
    const parsed = typeof photosData === 'string' ? JSON.parse(photosData) : photosData;

    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].trim() !== '') {
      return parsed[0];
    }
  } catch (error) {
    console.warn("Failed to parse L_Photos JSON:", error.message);
  }

  return DEFAULT_PLACEHOLDER;
}


// Helper to format raw numbers into USD currency strings
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}