import React, { useState, useEffect, useRef } from 'react';
import { getPhotoArray } from '../utils/formatters';
import './PropertyImageGallery.css';

export default function PropertyImageGallery({ photosData }) {
  const photos = getPhotoArray(photosData);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxRef = useRef(null);

  // Focus the lightbox when opened so keyboard events fire instantly
  useEffect(() => {
    if (isLightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [isLightboxOpen]);

  if (photos.length === 0) {
    return (
      <div className="gallery-placeholder">
        <p>No images available for this property.</p>
      </div>
    );
  }


  const handleKeyDown = (e) => {
    if (!isLightboxOpen) return;

    if (e.key === 'Escape') {
      setIsLightboxOpen(false);
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    }
  };
return (
    <div className="gallery-container">
      {/* Main Preview Image */}
      <div className="gallery-main" onClick={() => setIsLightboxOpen(true)}>
        <img
          src={photos[selectedIndex]}
          alt={`Main view ${selectedIndex + 1}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/800x500?text=Image+Unavailable';
          }}
        />
        <div className="gallery-overlay-hint">Click to enlarge</div>
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="thumbnail-strip">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`thumbnail-btn ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
            </button>
          ))}
        </div>
      )}
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="lightbox-overlay"
          ref={lightboxRef}
          tabIndex={0} // 
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            // Close lightbox on click-outside
            if (e.target.classList.contains('lightbox-overlay')) {
              setIsLightboxOpen(false);
            }
          }}
        >
          <button
            className="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close Lightbox"
          >
            &times;
          </button>

          <button
            className="lightbox-nav prev"
            onClick={() =>
              setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
            }
          >
            &lsaquo;
          </button>

          <div className="lightbox-content">
            <img src={photos[selectedIndex]} alt={`Enlarged ${selectedIndex + 1}`} />
            <div className="lightbox-caption">
              Photo {selectedIndex + 1} of {photos.length}
            </div>
          </div>

          <button
            className="lightbox-nav next"
            onClick={() =>
              setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
            }
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
