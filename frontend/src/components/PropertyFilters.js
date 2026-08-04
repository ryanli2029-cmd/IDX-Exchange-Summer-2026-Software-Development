// frontend/src/components/PropertyFilters.js
import React, { useState } from 'react';
import './PropertyFilters.css';

const INITIAL_STATE = {
  city: '',
  zipcode: '',
  minPrice: '',
  maxPrice: '',
  beds: '',
  baths: ''
};

export default function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState(INITIAL_STATE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Remove empty string/whitespace values before passing to API
    const activeFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '' && filters[key] !== null) {
        activeFilters[key] = filters[key].trim ? filters[key].trim() : filters[key];
      }
    });

    onSearch(activeFilters);
  };

  const handleClear = () => {
    setFilters(INITIAL_STATE);
    onClear();
  };

  return (
    <form className="filters-form" onSubmit={handleSubmit} data-testid="property-filters-form">
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            name="city"
            placeholder="e.g. Oroville"
            value={filters.city}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="zipcode">ZIP Code</label>
          <input
            id="zipcode"
            type="text"
            name="zipcode"
            placeholder="e.g. 95965"
            value={filters.zipcode}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minPrice">Min Price</label>
          <input
            id="minPrice"
            type="number"
            name="minPrice"
            placeholder="$ Min"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPrice">Max Price</label>
          <input
            id="maxPrice"
            type="number"
            name="maxPrice"
            placeholder="$ Max"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="beds">Beds</label>
          <select id="beds" name="beds" value={filters.beds} onChange={handleChange}>
            <option value="">Any Beds</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="baths">Baths</label>
          <select id="baths" name="baths" value={filters.baths} onChange={handleChange}>
            <option value="">Any Baths</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>

      <div className="filters-actions">
        <button type="submit" className="btn-search">Search</button>
        <button type="button" className="btn-clear" onClick={handleClear}>Clear Filters</button>
      </div>
    </form>
  );
}