// frontend/src/api/client.test.js
import { fetchProperties, fetchPropertyDetail } from './client';

describe('API Client Module', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Success Path for fetchProperties
  test('fetchProperties returns property list and total count on successful request', async () => {
    const mockPayload = {
      total: 1,
      limit: 20,
      offset: 0,
      results: [{ L_ListingID: '123', L_SystemPrice: 500000 }]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPayload
    });

    const result = await fetchProperties({ city: 'Oroville' });

    expect(global.fetch).toHaveBeenCalledWith('/api/properties?city=Oroville');
    expect(result).toEqual(mockPayload);
  });

  // Test 2: Error Path for fetchProperties
  test('fetchProperties throws meaningful error message when response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid limit parameter.' })
    });

    await expect(fetchProperties({ limit: 'invalid' })).rejects.toThrow('Invalid limit parameter.');
  });

  // Test 3: fetchPropertyDetail returns a single property
  test('fetchPropertyDetail fetches single property object by ID', async () => {
    const mockProperty = { L_ListingID: '123', L_SystemPrice: 400000 };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProperty
    });

    const result = await fetchPropertyDetail('123');

    expect(global.fetch).toHaveBeenCalledWith('/api/properties/123');
    expect(result).toEqual(mockProperty);
  });
});