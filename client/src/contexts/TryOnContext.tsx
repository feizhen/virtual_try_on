import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Model } from '../types/model';
import type { Garment } from '../types/garment';
import type { Scene } from '../types/scene';
import type { TryOnSession } from '../types/tryon';

/**
 * 虚拟试衣全局状态
 */
interface TryOnState {
  // 选中的模特
  selectedModel: Model | null;
  setSelectedModel: (model: Model | null) => void;

  // 选中的服装
  selectedGarment: Garment | null;
  setSelectedGarment: (garment: Garment | null) => void;

  // 选中的场景 (可选,P3 功能)
  selectedScene: Scene | null;
  setSelectedScene: (scene: Scene | null) => void;

  // 当前试衣会话
  currentSession: TryOnSession | null;
  setCurrentSession: (session: TryOnSession | null) => void;

  // 试衣历史记录
  tryOnHistory: TryOnSession[];
  addToHistory: (session: TryOnSession) => void;
  clearHistory: () => void;

  // 重置所有选择
  resetSelection: () => void;
}

const TryOnContext = createContext<TryOnState | undefined>(undefined);

/**
 * TryOn Context Provider
 */
export const TryOnProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [currentSession, setCurrentSession] = useState<TryOnSession | null>(
    null
  );
  const [tryOnHistory, setTryOnHistory] = useState<TryOnSession[]>([]);

  const addToHistory = (session: TryOnSession) => {
    setTryOnHistory((prev) => [session, ...prev].slice(0, 10)); // 保留最近 10 条
  };

  const clearHistory = () => {
    setTryOnHistory([]);
  };

  const resetSelection = () => {
    setSelectedModel(null);
    setSelectedGarment(null);
    setSelectedScene(null);
    setCurrentSession(null);
  };

  const value: TryOnState = {
    selectedModel,
    setSelectedModel,
    selectedGarment,
    setSelectedGarment,
    selectedScene,
    setSelectedScene,
    currentSession,
    setCurrentSession,
    tryOnHistory,
    addToHistory,
    clearHistory,
    resetSelection,
  };

  return (
    <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>
  );
};

/**
 * 使用 TryOn Context 的 Hook
 */
export const useTryOn = (): TryOnState => {
  const context = useContext(TryOnContext);
  if (context === undefined) {
    throw new Error('useTryOn must be used within a TryOnProvider');
  }
  return context;
};
