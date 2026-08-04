// frontend/src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock global fetch so ListingsPage inside App doesn't throw unhandled promise errors
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ total: 0, limit: 20, offset: 0, results: [] })
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Featured Properties heading in main app layout', async () => {
  render(<App />);
  const headingElement = screen.getByText(/Featured Properties/i);
  expect(headingElement).toBeInTheDocument();
});