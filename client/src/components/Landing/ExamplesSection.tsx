import React from 'react';
import { ExampleComparison } from './ExampleComparison';
import type { ExampleImage } from '@/types/landing';
import './ExamplesSection.css';

interface ExamplesSectionProps {
  examples: ExampleImage[];
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({ examples }) => {
  return (
    <section className="examples-section">
      <div className="section-header">
        <h2 className="section-title">真实效果展示</h2>
        <p className="section-description">看看 AI 虚拟试衣的惊艳效果</p>
      </div>
      <div className="examples-container">
        {examples.map((example) => (
          <ExampleComparison key={example.id} {...example} />
        ))}
      </div>
    </section>
  );
};
