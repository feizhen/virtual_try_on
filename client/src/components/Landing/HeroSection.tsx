import React from 'react';
import { Link } from 'react-router-dom';
import type { HeroContent } from '@/types/landing';
import './HeroSection.css';

interface HeroSectionProps extends HeroContent {}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="hero-cta">
          <Link
            to={primaryCTA.link}
            className={`btn btn-${primaryCTA.variant}`}
          >
            {primaryCTA.text}
          </Link>
          {secondaryCTA && (
            <Link
              to={secondaryCTA.link}
              className={`btn btn-${secondaryCTA.variant}`}
            >
              {secondaryCTA.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
