import React, { useState } from 'react';
import { getPhotoArray } from '../utils/formatters';
import './PropertyImageCarousel.css';

export default function PropertyImageCarousel({ photosData }) {
  const photos = getPhotoArray(photosData);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="carousel-placeholder">
        <span className="placeholder-icon">🏠</span>
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation(); // Prevents card link click
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation(); // Prevents card link click
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="property-carousel">
      <img
        src={photos[currentIndex]}
        alt={`Property photo ${currentIndex + 1}`}
        className="carousel-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable';
        }}
      />

      {photos.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={handlePrev} aria-label="Previous photo">
            &lsaquo;
          </button>
          <button className="carousel-btn next" onClick={handleNext} aria-label="Next photo">
            &rsaquo;
          </button>
          <span className="carousel-counter">
            {currentIndex + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}