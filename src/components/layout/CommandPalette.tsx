import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PERSONAL_INFO, PROJECTS, SECTIONS } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { EASE, gsap } from '../../lib/motion';
import { trapTab } from '../../lib/focus';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  group: 'Case studies' | 'Sections' | 'Actions' | 'Links';
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
  /** Keep the palette open after running (e.g. copy to clipboard). */
  keepOpen?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) =>
  isOpen ? <PaletteDialog onClose={onClose} /> : null;

const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

const PaletteDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { transitionTo, scrollToSection, toggleTheme, toggleGrid, theme, setScrollLocked, reducedMotion } = useSite();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  const listId = useId();

  const commands = useMemo<Command[]>(
    () => [
      ...PROJECTS.map<Command>((p) => ({
        id: `project-${p.slug}`,
        group: 'Case studies',
        label: `${p.number} ${p.title}`,
        hint: p.kind,
        keywords: `${p.stackShort.join(' ')} ${p.summary}`,
        run: () => transitionTo(`/projects/${p.slug}`, p.title),
      })),
      ...SECTIONS.map<Command>((s) => ({
        id: `section-${s.id}`,
        group: 'Sections',
        label: s.label,
        hint: `§ ${s.number}`,
        run: () => scrollToSection(s.id),
      })),
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: PERSONAL_INFO.email,
        keywords: 'contact mail',
        keepOpen: true,
        run: () => {
          navigator.clipboard
            ?.writeText(PERSONAL_INFO.email)
            .then(() => setStatus(`Copied ${PERSONAL_INFO.email}`))
            .catch(() => setStatus('Copy failed — the address is ' + PERSONAL_INFO.email));
        },
      },
      {
        id: 'theme',
        group: 'Actions',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        keywords: 'dark light mode colour color',
        run: toggleTheme,
      },
      { id: 'grid', group: 'Actions', label: 'Toggle layout grid', hint: 'G', keywords: 'columns', run: toggleGrid },
      { id: 'email', group: 'Links', label: 'Write an email', hint: 'mailto', run: () => void (window.location.href = `mailto:${PERSONAL_INFO.email}`) },
      { id: 'resume', group: 'Links', label: 'Résumé (PDF)', hint: `Updated ${PERSONAL_INFO.resumeUpdated}`, keywords: 'cv', run: () => openExternal(PERSONAL_INFO.resume) },
      { id: 'github', group: 'Links', label: 'GitHub', hint: 'swastikongithub', keywords: 'source code', run: () => openExternal(PERSONAL_INFO.github) },
      { id: 'linkedin', group: 'Links', label: 'LinkedIn', hint: 'swastiksin', run: () => openExternal(PERSONAL_INFO.linkedin) },
    ],
    [transitionTo, scrollToSection, toggleTheme, toggleGrid, theme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint ?? ''} ${c.group} ${c.keywords ?? ''}`.toLowerCase().includes(q));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  // Lock page scroll, animate in, restore focus to the opener on close.
  useEffect(() => {
    setScrollLocked(true);
    const opener = returnFocus.current;
    const panel = panelRef.current;
    if (panel && !reducedMotion) {
      gsap.fromTo(panel, { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: EASE.out });
    }
    return () => {
      setScrollLocked(false);
      opener?.focus?.();
    };
  }, [setScrollLocked, reducedMotion]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const execute = (cmd: Command | undefined) => {
    if (!cmd) return;
    if (cmd.keepOpen) {
      cmd.run();
      return;
    }
    // Close first so smooth scroll is resumed before the command scrolls or navigates.
    onClose();
    requestAnimationFrame(() => cmd.run());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((activeIndex + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(results[activeIndex]);
    } else {
      trapTab(e, panelRef.current);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center px-3 pt-[10vh] sm:pt-[14vh]">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-2xl bg-paper text-ink border-2 border-ink shadow-[10px_10px_0_0_var(--ink)]"
      >
        <div className="flex items-center gap-3 border-b border-rule px-5">
          <span className="t-label text-accent-text" aria-hidden="true">⌘</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a case study, section or link…"
            className="w-full bg-transparent py-5 text-lg sm:text-xl font-[500] outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search commands"
          />
          <button type="button" onClick={onClose} className="t-label text-muted hover:text-ink px-2 py-2">
            Esc
          </button>
        </div>

        <ul ref={listRef} id={listId} role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto py-2" data-lenis-prevent>
          {results.length === 0 && (
            <li className="px-5 py-10 text-center text-muted" role="presentation">
              Nothing matches “{query}”.
            </li>
          )}
          {results.map((cmd, i) => {
            const header = i === 0 || results[i - 1].group !== cmd.group ? cmd.group : null;
            const selected = i === activeIndex;
            return (
              <React.Fragment key={cmd.id}>
                {header && (
                  <li role="presentation" className="t-label text-muted px-5 pt-4 pb-1.5">
                    {header}
                  </li>
                )}
                <li
                  id={`${listId}-${cmd.id}`}
                  role="option"
                  aria-selected={selected}
                  data-index={i}
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={() => execute(cmd)}
                  className={`mx-2 flex cursor-pointer items-center justify-between gap-4 px-3 py-2.5 ${
                    selected ? 'bg-ink text-paper' : ''
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={`w-1.5 h-1.5 shrink-0 ${selected ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                    <span className="truncate font-[560]">{cmd.label}</span>
                  </span>
                  {cmd.hint && <span className={`t-label truncate ${selected ? 'opacity-70' : 'text-muted'}`}>{cmd.hint}</span>}
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-rule px-5 py-2.5 t-label text-muted">
          <span aria-live="polite">{status || '↑ ↓ to move · Enter to open'}</span>
          <span className="hidden sm:inline">Swastik Singh / Index</span>
        </div>
      </div>
    </div>
  );
};
