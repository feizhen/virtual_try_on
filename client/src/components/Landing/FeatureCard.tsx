import React from 'react';
import type { FeatureCard as FeatureCardType } from '@/types/landing';
import './FeatureCard.css';

interface FeatureCardProps extends FeatureCardType {}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};
