import React from 'react';
import './SortControls.css';

export default function SortControls({ sortBy, sortOrder, onSortChange }) {
  const currentSortValue = `${sortBy}-${sortOrder}`;

  const handleChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="sort-controls-container">
      <label htmlFor="sort-select" className="sort-label">
        Sort By:
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={currentSortValue}
        onChange={handleChange}
      >
        <option value="date-DESC">Newest Listed</option>
        <option value="date-ASC">Oldest Listed</option>
        <option value="price-ASC">Price: Low to High</option>
        <option value="price-DESC">Price: High to Low</option>
        <option value="sqft-DESC">Square Feet: Large to Small</option>
        <option value="beds-DESC">Bedrooms: Most to Least</option>
      </select>
    </div>
  );
}