/**
 * Fetch a paginated, filtered list of properties
 */
export async function fetchProperties(params = {}) {
  // Convert JS object parameters into a URL query string
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/properties${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return response.json(); // Returns { total, limit, offset, results }
}

/**
 * Fetch a single property by ID
 */
export async function fetchPropertyDetail(id) {
  const response = await fetch(`/api/properties/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch property details (Status ${response.status})`);
  }

  return response.json();
}


/**
 * Fetch open houses for a specific property ID
 */
export async function fetchOpenHouses(id) {
  const response = await fetch(`/api/properties/${id}/openhouses`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch open houses.');
  }
  return response.json();
}