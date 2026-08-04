// frontend/src/components/PropertyFilters.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';

describe('PropertyFilters Component', () => {
  const mockOnSearch = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Form displays all six inputs
  test('renders all 6 filter inputs correctly', () => {
    render(<PropertyFilters onSearch={mockOnSearch} onClear={mockOnClear} />);

    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ZIP Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Min Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Beds/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Baths/i)).toBeInTheDocument();
  });

  // Test 2: Submitting passes non-empty inputs to onSearch
  test('submitting form passes active non-empty filter values to onSearch', () => {
    render(<PropertyFilters onSearch={mockOnSearch} onClear={mockOnClear} />);

    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Oroville' } });
    fireEvent.change(screen.getByLabelText(/Min Price/i), { target: { value: '200000' } });

    fireEvent.submit(screen.getByTestId('property-filters-form'));

    expect(mockOnSearch).toHaveBeenCalledWith({
      city: 'Oroville',
      minPrice: '200000'
    });
  });

  // Test 3: Clear button resets form and calls onClear
  test('clicking Clear Filters resets inputs and invokes onClear handler', () => {
    render(<PropertyFilters onSearch={mockOnSearch} onClear={mockOnClear} />);

    const cityInput = screen.getByLabelText(/City/i);
    fireEvent.change(cityInput, { target: { value: 'Sacramento' } });
    expect(cityInput.value).toBe('Sacramento');

    fireEvent.click(screen.getByText(/Clear Filters/i));

    expect(cityInput.value).toBe('');
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});