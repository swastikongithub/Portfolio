import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROJECTS, PERSONAL_INFO } from '../../data/portfolioData';
import { Search, ArrowRight, Folder, User, Mail, FileText, ExternalLink, Code } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const allItems = [
    { id: 'home', title: 'Home', category: 'Navigation', icon: User, action: () => { navigate('/'); onClose(); } },
    { id: 'work', title: 'Work & Projects', category: 'Navigation', icon: Folder, action: () => { navigate('/'); setTimeout(() => { document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' }); }, 100); onClose(); } },
    { id: 'about', title: 'About Swastik', category: 'Navigation', icon: User, action: () => { navigate('/'); setTimeout(() => { document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }, 100); onClose(); } },
    { id: 'skills', title: 'Technical Skills', category: 'Navigation', icon: Code, action: () => { navigate('/'); setTimeout(() => { document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }); }, 100); onClose(); } },
    { id: 'background', title: 'Education & Milestones', category: 'Navigation', icon: FileText, action: () => { navigate('/'); setTimeout(() => { document.querySelector('#background')?.scrollIntoView({ behavior: 'smooth' }); }, 100); onClose(); } },
    { id: 'contact', title: 'Contact', category: 'Navigation', icon: Mail, action: () => { navigate('/'); setTimeout(() => { document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100); onClose(); } },
    ...PROJECTS.map(p => ({
      id: p.id,
      title: `${p.number} // ${p.title}`,
      category: 'Projects',
      icon: Folder,
      action: () => { navigate(`/projects/${p.id}`); onClose(); }
    })),
    { id: 'resume', title: 'View Resume (PDF)', category: 'Links', icon: ExternalLink, action: () => { window.open(PERSONAL_INFO.resume, '_blank'); onClose(); } },
    { id: 'github', title: 'GitHub Profile', category: 'Links', icon: ExternalLink, action: () => { window.open(PERSONAL_INFO.github, '_blank'); onClose(); } },
    { id: 'linkedin', title: 'LinkedIn Profile', category: 'Links', icon: ExternalLink, action: () => { window.open(PERSONAL_INFO.linkedin, '_blank'); onClose(); } },
    { id: 'instagram', title: 'Instagram Profile', category: 'Links', icon: ExternalLink, action: () => { window.open(PERSONAL_INFO.instagram, '_blank'); onClose(); } }
  ];

  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Editorial Modal Window */}
      <div className="relative w-full max-w-2xl bg-[#FAFAFA] dark:bg-[#111111] border border-[#1F1F1F]/20 dark:border-white/20 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#1F1F1F]/10 dark:border-white/10">
          <Search className="w-5 h-5 text-[#666666] dark:text-[#888888] mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work, skills, or navigation..."
            className="w-full bg-transparent text-sm md:text-base font-mono focus:outline-none text-[#111111] dark:text-white placeholder-[#666666] dark:placeholder-[#888888]"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono uppercase bg-[#111111]/5 dark:bg-white/10 text-[#666666] dark:text-[#888888]">
            ESC
          </kbd>
        </div>

        {/* List of actions */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs font-mono text-[#666666] dark:text-[#888888]">
              NO RESULTS FOUND FOR &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-left transition-colors font-mono text-xs md:text-sm ${
                    isSelected
                      ? 'bg-[#FF4D2D] text-white'
                      : 'text-[#111111] dark:text-[#F5F5F5] hover:bg-[#111111]/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#666666] dark:text-[#888888]'}`} />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-[#666666] dark:text-[#888888]'}`}>
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#111111]/5 dark:bg-white/5 border-t border-[#1F1F1F]/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono uppercase text-[#666666] dark:text-[#888888]">
          <span>Use ↑↓ to navigate • Enter to select</span>
          <span>SWASTIK // COMMAND</span>
        </div>
      </div>
    </div>
  );
};
