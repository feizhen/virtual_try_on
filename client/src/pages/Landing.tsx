import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeaturesSection } from '../components/Landing/FeaturesSection';
import { ExamplesSection } from '../components/Landing/ExamplesSection';
import { CTASection } from '../components/Landing/CTASection';
import { FaMagic, FaBolt, FaImage } from 'react-icons/fa';
import type { LandingPageContent } from '../types/landing';
import example1Before from '../assets/examples/example-1-before.svg';
import example1After from '../assets/examples/example-1-after.svg';
import example2Before from '../assets/examples/example-2-before.svg';
import example2After from '../assets/examples/example-2-after.svg';
import './Landing.css';

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 已登录用户重定向到虚拟试衣页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tryon', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 内容配置
  const content: LandingPageContent = {
    hero: {
      title: 'AI 虚拟试衣,随心换装',
      subtitle: '无需实际试穿,一键体验千款服饰,找到最适合你的风格',
      primaryCTA: { text: '立即体验', link: '/register', variant: 'primary' },
      secondaryCTA: { text: '登录', link: '/login', variant: 'secondary' },
    },
    features: [
      {
        id: 'ai-processing',
        icon: <FaMagic />,
        title: 'AI 智能换装',
        description: '先进的 AI 算法,自动识别人体轮廓,精准换装',
      },
      {
        id: 'fast-process',
        icon: <FaBolt />,
        title: '快速处理',
        description: '秒级生成试衣效果,无需漫长等待',
      },
      {
        id: 'hd-output',
        icon: <FaImage />,
        title: '高清输出',
        description: '保持原图清晰度,细节完美呈现',
      },
    ],
    examples: [
      {
        id: 'example-1',
        beforeImage: example1Before,
        afterImage: example1After,
        alt: '夏季连衣裙试穿效果',
      },
      {
        id: 'example-2',
        beforeImage: example2Before,
        afterImage: example2After,
        alt: '商务正装试穿效果',
      },
    ],
    cta: {
      heading: '准备好开始你的虚拟试衣之旅了吗?',
      description: '注册即可获得 10 次免费试衣机会',
      button: { text: '免费注册', link: '/register', variant: 'primary' },
    },
  };

  return (
    <div className="landing-page">
      <HeroSection {...content.hero} />
      <FeaturesSection features={content.features} />
      <ExamplesSection examples={content.examples} />
      <CTASection {...content.cta} />
    </div>
  );
};
