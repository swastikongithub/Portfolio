import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../data/portfolioData';
import { Search, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  onOpenCommandPalette: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenCommandPalette,
  theme,
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && isHome) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md py-4 border-b border-[#1F1F1F]/10 dark:border-white/10'
          : 'bg-transparent py-6 md:py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Editorial Brand / Monogram */}
        <Link
          to="/"
          className="font-display font-bold text-lg md:text-xl tracking-tighter uppercase group flex items-center gap-2"
        >
          <span>SWASTIK</span>
          <span className="w-2 h-2 bg-[#FF4D2D] rounded-full inline-block group-hover:scale-125 transition-transform" />
        </Link>

        {/* Small Uppercase Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
          {NAVIGATION_ITEMS.map((item) => {
            const isHash = item.href.startsWith('#');
            if (item.isExternal) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative py-1 hover:text-[#FF4D2D] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#FF4D2D] hover:after:w-full after:transition-all after:duration-300"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <a
                key={item.label}
                href={isHome ? item.href : `/${item.href}`}
                onClick={(e) => isHash && handleNavClick(e, item.href)}
                className="relative py-1 hover:text-[#FF4D2D] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#FF4D2D] hover:after:w-full after:transition-all after:duration-300"
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Utilities: Command Palette (Ctrl+K) & Theme Switcher */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase border border-[#1F1F1F]/20 dark:border-white/20 hover:border-[#FF4D2D] dark:hover:border-[#FF4D2D] transition-colors rounded-none bg-transparent"
            aria-label="Open Command Palette"
          >
            <Search className="w-3.5 h-3.5 text-[#666666] dark:text-[#888888]" />
            <span className="hidden sm:inline text-[#666666] dark:text-[#888888]">CMD</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[#111111]/10 dark:bg-white/10 rounded-none text-[#111111] dark:text-white">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 border border-[#1F1F1F]/20 dark:border-white/20 hover:border-[#FF4D2D] dark:hover:border-[#FF4D2D] transition-colors bg-transparent text-[#111111] dark:text-white"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
