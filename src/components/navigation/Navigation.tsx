import { Menu, Moon, Sun, X, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { navItems } from '../../config/site';
import { useTheme } from '../../contexts/ThemeContext';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll and manage keyboard accessibility when mobile menu is open
  useEffect(() => {
    if (open) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Move focus to close button for screen-reader & keyboard users
      const focusTimer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      // Handle Escape key dismissal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        // Restore focus to hamburger trigger
        triggerRef.current?.focus();
      };
    }
  }, [open]);

  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main Navigation">
        {/* Brand Logo & Name */}
        <Logo size="sm" showName />

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
              <span className="nav-active-pill" />
            </NavLink>
          ))}
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {/* Theme Toggle Button */}
          <button
            className="icon-button theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="theme-icon sun-icon" />
            ) : (
              <Moon size={17} className="theme-icon moon-icon" />
            )}
          </button>

          {/* Mobile Drawer Hamburger Trigger */}
          <button
            ref={triggerRef}
            className="icon-button mobile-only hamburger-btn"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu & Overlay — Rendered via Portal directly into document.body to avoid stacking-context clipping */}
      {open &&
        createPortal(
          <div
            className="mobile-nav-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          >
            <div
              ref={drawerRef}
              className="mobile-nav-drawer"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              <div className="mobile-nav-top">
                <Logo size="sm" showName />
                <button
                  ref={closeBtnRef}
                  className="icon-button close-drawer-btn"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mobile-nav-list" role="menu">
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `mobile-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    <span className="mobile-nav-num">0{index + 1}</span>
                    <span className="mobile-nav-text">{item.label}</span>
                    <ChevronRight size={16} className="mobile-nav-arrow" />
                  </NavLink>
                ))}
              </div>

              <div className="mobile-nav-footer">
                <span className="mobile-theme-label">Interface Mode</span>
                <button
                  className="mobile-theme-switch-btn"
                  onClick={toggleTheme}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={16} /> Switch to Light Theme
                    </>
                  ) : (
                    <>
                      <Moon size={16} /> Switch to Dark Theme
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
