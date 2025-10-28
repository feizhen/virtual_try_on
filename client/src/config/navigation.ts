import { FiHome, FiPackage, FiClock, FiDollarSign } from 'react-icons/fi';
import type { NavigationItem } from '../types/sidebar';

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    route: '/',
    icon: FiHome,
    order: 1,
    exact: true,
  },
  {
    id: 'tryon',
    label: '虚拟试衣',
    route: '/tryon',
    icon: FiPackage,
    order: 2,
  },
  {
    id: 'history',
    label: '历史记录',
    route: '/history',
    icon: FiClock,
    order: 3,
  },
  {
    id: 'credits',
    label: '积分余额',
    route: '/credits',
    icon: FiDollarSign,
    order: 4,
  },
];
