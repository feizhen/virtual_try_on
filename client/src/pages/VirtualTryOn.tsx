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
  const [garmentPanelExpanded, setGarmentPanelExpanded] = useState(true);

  return (
    <div className="tryon-container">
      {/* Main Content Area */}
      <div className="tryon-main">
        {/* Center: Preview Area */}
        <PreviewArea />

        {/* Right: Side Panel */}
        <div className="tryon-side-panel">
          {/* Garment Selection Panel */}
          <GarmentPanel
            isExpanded={garmentPanelExpanded}
            onToggle={() => setGarmentPanelExpanded(!garmentPanelExpanded)}
          />

          {/* Try-On Button */}
          <TryOnButton />
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
