import React from 'react';
import { FeatureCard } from './FeatureCard';
import type { FeatureCard as FeatureCardType } from '@/types/landing';
import './FeaturesSection.css';

interface FeaturesSectionProps {
  features: FeatureCardType[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section className="features-section">
      <div className="section-header">
        <h2 className="section-title">核心功能</h2>
        <p className="section-description">AI 驱动的虚拟试衣体验</p>
      </div>
      <div className="features-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </div>
    </section>
  );
};
