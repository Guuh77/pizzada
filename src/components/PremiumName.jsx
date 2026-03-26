import React from 'react';

const PremiumName = ({ name, isPremium, className = '' }) => {
  if (!isPremium) {
    return <span className={className}>{name}</span>;
  }

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className="premium-crown" aria-hidden="true">👑</span>
      <span className="premium-name">{name}</span>
    </span>
  );
};

export default PremiumName;
