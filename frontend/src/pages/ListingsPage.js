// frontend/src/pages/ListingsPage.js
import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import './ListingsPage.css';

export default function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch initial page of properties
        const data = await fetchProperties({ limit: 20, offset: 0 });
        
        setProperties(data.results || []);
        setTotalCount(data.total || 0);
      } catch (err) {
        setError(err.message || 'Failed to load properties. Is your backend server running?');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="status-container">
        <div className="spinner"></div>
        <p>Loading real estate listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container error-box">
        <h2>Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="listings-container">
      <header className="listings-header">
        <h1>Featured Properties</h1>
        <p className="property-count">
          Showing <strong>{properties.length}</strong> of <strong>{totalCount}</strong> properties
        </p>
      </header>

      {properties.length === 0 ? (
        <p>No properties match your search.</p>
      ) : (
        <div className="property-grid">
          {properties.map((prop, idx) => (
            <PropertyCard key={prop.L_ListingID || idx} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
}
