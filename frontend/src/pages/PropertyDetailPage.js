import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPropertyDetail, fetchOpenHouses } from '../api/client';
import { formatCurrency } from '../utils/formatters';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';
import OpenHouseList from '../components/OpenHouseList';
import './PropertyDetailPage.css';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [propData, ohData] = await Promise.all([
          fetchPropertyDetail(id),
          fetchOpenHouses(id).catch(() => []), // Gracefully handle if open houses fail
        ]);

        setProperty(propData);
        setOpenHouses(ohData || []);
      } catch (err) {
        setError(err.message || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="status-container">
        <div className="spinner" />
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="detail-error-container">
        <h2>⚠️ Unable to load property</h2>
        <p>{error || 'Property not found.'}</p>
        <Link to="/" className="btn-back">&larr; Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="property-detail-container">
      <Link to="/" className="btn-back">&larr; Back to Listings</Link>

      <div className="detail-header">
        <div>
          <h1>{property.L_Address || 'Address Undisclosed'}</h1>
          <p className="detail-subtitle">{property.L_City}, {property.L_State} {property.L_Zip}</p>
        </div>
        <div className="detail-price">{formatCurrency(property.L_SystemPrice)}</div>
      </div>

      <PropertyImageGallery photosData={property.L_Photos} />

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Bedrooms</span>
          <span className="stat-value">{property.L_Keyword2 || 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Bathrooms</span>
          <span className="stat-value">{property.LM_Dec_3 || 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Square Feet</span>
          <span className="stat-value">{property.LM_Int2_3 ? Number(property.LM_Int2_3).toLocaleString() : 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Year Built</span>
          <span className="stat-value">{property.YearBuilt || 'N/A'}</span>
        </div>
      </div>

      <div className="detail-section">
        <h3>Description</h3>
        <p className="property-description">
          {property.L_Remarks || 'No public remarks provided for this listing.'}
        </p>
      </div>

      <OpenHouseList openHouses={openHouses} />

      <PropertyMap
        lat={property.LMD_MP_Latitude}
        lng={property.LMD_MP_Longitude}
        address={property.L_Address}
      />
    </div>
  );
}
