import React from 'react';
import type { ExampleImage } from '@/types/landing';
import './ExampleComparison.css';

interface ExampleComparisonProps extends ExampleImage {}

export const ExampleComparison: React.FC<ExampleComparisonProps> = ({
  beforeImage,
  afterImage,
  alt = '虚拟试衣示例',
}) => {
  return (
    <div className="example-comparison">
      <div className="example-item">
        <img src={beforeImage} alt={`${alt} - 原始照片`} loading="lazy" />
        <span className="example-label">原始照片</span>
      </div>
      <div className="example-divider">→</div>
      <div className="example-item">
        <img src={afterImage} alt={`${alt} - 试衣效果`} loading="lazy" />
        <span className="example-label">试衣效果</span>
      </div>
    </div>
  );
};
