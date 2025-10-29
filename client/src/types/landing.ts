import type { ReactNode } from 'react';

/**
 * ��aGpnӄ
 */
export interface FeatureCard {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * :��Gpnӄ
 */
export interface ExampleImage {
  id: string;
  beforeImage: string;
  afterImage: string;
  alt?: string;
}

/**
 * CTA 	�pnӄ
 */
export interface CTAButton {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

/**
 * ��:��
 */
export interface HeroContent {
  title: string;
  subtitle: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
}

/**
 * CTA :߅�
 */
export interface CTAContent {
  heading: string;
  description?: string;
  button: CTAButton;
}

/**
 * =0u�t��Mn
 */
export interface LandingPageContent {
  hero: HeroContent;
  features: FeatureCard[];
  examples: ExampleImage[];
  cta: CTAContent;
}
