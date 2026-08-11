import React from 'react';
import { Link } from 'react-router-dom';
import PropertyImageCarousel from './PropertyImageCarousel';
import { formatCurrency } from '../utils/formatters';
import './PropertyCard.css';

export default function PropertyCard({ property }) {
  const listingId = property.L_ListingID;
  const price = property.L_SystemPrice;
  const address = property.L_Address || 'Address Undisclosed';
  const city = property.L_City;
  const state = property.L_State || 'CA';
  const beds = property.L_Keyword2 || '0';
  const baths = property.LM_Dec_3 || '0';
  const sqft = property.LM_Int2_3 || '0';

  return (
    <div className="property-card">
      <Link to={`/property/${listingId}`} className="card-link">
        <PropertyImageCarousel photosData={property.L_Photos} />

        <div className="card-details">
          <h2 className="card-price">{formatCurrency(price)}</h2>
          <p className="card-address">{address}</p>
          <p className="card-location">
            {city}, {state}
          </p>

          <div className="card-stats">
            <span><strong>{beds}</strong> beds</span>
            <span>&bull;</span>
            <span><strong>{baths}</strong> baths</span>
            <span>&bull;</span>
            <span><strong>{Number(sqft).toLocaleString()}</strong> sqft</span>
          </div>
        </div>
      </Link>
    </div>
  );
}