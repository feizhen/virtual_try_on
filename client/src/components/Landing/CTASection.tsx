import React from 'react';
import { Link } from 'react-router-dom';
import type { CTAContent } from '@/types/landing';
import './CTASection.css';

interface CTASectionProps extends CTAContent {}

export const CTASection: React.FC<CTASectionProps> = ({ heading, description, button }) => {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-heading">{heading}</h2>
        {description && <p className="cta-description">{description}</p>}
        <Link to={button.link} className={`btn btn-${button.variant} btn-large`}>
          {button.text}
        </Link>
      </div>
    </section>
  );
};
