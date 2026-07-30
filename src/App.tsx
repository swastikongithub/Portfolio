import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useLenis } from './hooks/useLenis';
import { useTheme } from './hooks/useTheme';
import { useCommandPalette } from './hooks/useCommandPalette';
import { Navigation } from './components/layout/Navigation';
import { CommandPalette } from './components/layout/CommandPalette';
import { PageLoader } from './components/layout/PageLoader';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { HomePage } from './components/pages/HomePage';
import { ProjectDetailPage } from './components/pages/ProjectDetailPage';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  useLenis();
  const { theme, toggleTheme } = useTheme();
  const commandPalette = useCommandPalette();

  return (
    <BrowserRouter>
      {loading ? (
        <PageLoader onComplete={() => setLoading(false)} />
      ) : (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#111111] dark:text-[#F5F5F5] transition-colors duration-300">
          <ScrollProgress />
          <Navigation
            onOpenCommandPalette={commandPalette.open}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <CommandPalette
            isOpen={commandPalette.isOpen}
            onClose={commandPalette.close}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  );
};

export default App;
