import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import './ListingsPage.css';

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError(null);
        setProperties([]);

        const offset = (currentPage - 1) * itemsPerPage;
        const queryParams = {
          ...activeFilters,
          limit: itemsPerPage,
          offset,
        };

        const data = await fetchProperties(queryParams);
        setProperties(data.results || []);
        setTotalCount(data.total || 0);
      } catch (err) {
        setError(err.message || 'Failed to fetch properties.');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [activeFilters, currentPage]);

  const handleSearch = (newFilters) => {
    setCurrentPage(1); // Requirement 35: Filter changes reset to page 1
    setActiveFilters(newFilters);
  };

  const handleClear = () => {
    setCurrentPage(1); // Requirement 35: Clear resets to page 1
    setActiveFilters({});
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Requirement 34
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="listings-container">
      <header className="listings-header">
        <h1>Featured Properties</h1>
        <p className="property-count">
          Showing {startItem}-{endItem} of {totalCount} properties
        </p>
      </header>

      <PropertyFilters onSearch={handleSearch} onClear={handleClear} />

      {loading && (
        <div className="status-container">
          <div className="spinner" />
          <p>Loading real estate listings...</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>⚠️ Connection Error: {error}</p>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="no-results-box">
          <h3>No properties found</h3>
          <p>Try adjusting or clearing your search filters.</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property.L_ListingID} property={property} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}