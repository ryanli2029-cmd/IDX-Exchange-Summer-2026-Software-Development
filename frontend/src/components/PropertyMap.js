import React from 'react';
import './PropertyMap.css';

export default function PropertyMap({ lat, lng, address }) {
  if (!lat || !lng) return null;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;
  const externalDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="property-map-container">
      <h3>Location & Map</h3>
      <div className="map-wrapper">
        <iframe
          title={`Map location for ${address || 'Property'}`}
          width="100%"
          height="320"
          style={{ border: 0, borderRadius: '8px' }}
          loading="lazy"
          allowFullScreen
          src={embedUrl}
        />
      </div>
      <div className="map-actions">
        <a
          href={externalDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-directions"
        >
          📍 Get Directions on Google Maps &rarr;
        </a>
      </div>
    </div>
  );
}
