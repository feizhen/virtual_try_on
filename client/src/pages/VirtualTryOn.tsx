import React, { useState } from 'react';
import { PreviewArea } from '../components/VirtualTryOn/PreviewArea';
import { GarmentPanel } from '../components/VirtualTryOn/GarmentPanel';
import { TryOnButton } from '../components/VirtualTryOn/TryOnButton';
import '../components/VirtualTryOn/styles.css';

/**
 * 虚拟试衣页面
 * 简化版布局:
 * - 中央预览区域 (点击上传模特照片)
 * - 右侧服装选择面板 (可折叠)
 */
const VirtualTryOn: React.FC = () => {
  return (
    <div className="tryon-container">
      {/* Main Content Area */}
      <div className="tryon-main">
        {/* Center: Preview Area */}
        <PreviewArea />

        {/* Right: Side Panel */}
        <div className="tryon-side-panel">
          {/* Garment Selection Panel */}
          <div className="tryon-panel-content-wrapper">
            <GarmentPanel />
          </div>

          {/* Try-On Button - Fixed at Bottom */}
          <div className="tryon-panel-footer">
            <TryOnButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
