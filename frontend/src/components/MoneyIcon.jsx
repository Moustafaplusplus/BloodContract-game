import React, { useState } from 'react';

const MoneyIcon = ({ className = "w-6 h-6", alt = "Money" }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImage, setCurrentImage] = useState('/images/money-icon.png');

  const handleImageError = (e) => {
    
    setImageError(true);
    
    // Try alternative image sources
    if (currentImage === '/images/money-icon.png') {
      setCurrentImage('/images/money.jpeg');
      setImageError(false);
    } else if (currentImage === '/images/money.jpeg') {
      setCurrentImage('/images/blackcoins-icon.png');
      setImageError(false);
    } else {
      // All images failed, show fallback
      e.target.style.display = 'none';
      if (e.target.nextSibling) {
        e.target.nextSibling.style.display = 'inline-block';
      }
    }
  };

  return (
    <>
      {!imageError && (
        <img
          src={currentImage}
          alt={alt}
          className={className}
          onError={handleImageError}
        />
      )}
      {/* Fallback emoji if all images fail to load */}
      <span className="text-white font-bold text-lg" style={{ display: imageError ? 'inline-block' : 'none' }}>
        💰
      </span>
    </>
  );
};

export default MoneyIcon; 