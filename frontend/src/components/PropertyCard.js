// frontend/src/components/PropertyCard.js
import React from 'react';
import { getFirstPhotoUrl, formatCurrency } from '../utils/formatters';
import './PropertyCard.css';

export default function PropertyCard({ property }) {
  // Maps database information onto the card
  const photoUrl = getFirstPhotoUrl(property.L_Photos);
  const price = property.L_SystemPrice;
  const address = property.L_Address || property.L_AddressStreet || 'Address Undisclosed';
  const city = property.L_City || '';
  const state = property.L_State || 'CA';
  const beds = property.L_Keyword2 ?? 'N/A';
  const baths = property.LM_Dec_3 ?? 'N/A';
  const sqft = property.LM_Int2_3 ? property.LM_Int2_3.toLocaleString() : 'N/A';

  return (
    <div className="property-card">
      <div className="card-image-wrapper">
        <img src={photoUrl} alt={address} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'; }} />
      </div>
      <div className="card-content">
        <h3 className="card-price">{formatCurrency(price)}</h3>
        <p className="card-address">{address}</p>
        <p className="card-location">{city}{city && state ? `, ${state}` : state}</p>
        <div className="card-specs">
          <span><strong>{beds}</strong> beds</span>
          <span>•</span>
          <span><strong>{baths}</strong> baths</span>
          <span>•</span>
          <span><strong>{sqft}</strong> sqft</span>
        </div>
      </div>
    </div>
  );
}
