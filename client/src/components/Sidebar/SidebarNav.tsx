import React from 'react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../../types/sidebar';
import './SidebarNav.css';

interface SidebarNavProps {
  /** Navigation items to render */
  items: NavigationItem[];

  /** Current active item ID */
  activeItemId: string | null;

  /** Whether sidebar is in collapsed state (icon-only) */
  collapsed?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  activeItemId,
  collapsed = false,
}) => {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <nav className="sidebar-nav" role="navigation" aria-label="主导航">
      <ul className="sidebar-nav__list">
        {sortedItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;

          return (
            <li key={item.id} className="sidebar-nav__item-wrapper">
              <NavLink
                to={item.route}
                className={`sidebar-nav__item ${
                  isActive ? 'sidebar-nav__item--active' : ''
                } ${collapsed ? 'sidebar-nav__item--collapsed' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className="sidebar-nav__icon"
                  size={20}
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="sidebar-nav__label">{item.label}</span>
                )}
                {item.badge !== undefined && item.badge > 0 && !collapsed && (
                  <span className="sidebar-nav__badge" aria-label={`${item.badge} 条未读`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
