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
  group: 'Systems' | 'Sections' | 'Actions' | 'Links';
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
  const { transitionTo, scrollToSection, toggleTheme, theme, setScrollLocked, reducedMotion } = useSite();
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
        group: 'Systems',
        label: p.title,
        hint: p.kind,
        keywords: `${p.stackShort.join(' ')} ${p.summary} ${p.invariant}`,
        run: () => transitionTo(`/projects/${p.slug}`),
      })),
      ...SECTIONS.map<Command>((s) => ({
        id: `section-${s.id}`,
        group: 'Sections',
        label: s.label,
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
            .catch(() => setStatus(`Copy failed. The address is ${PERSONAL_INFO.email}`));
        },
      },
      {
        id: 'theme',
        group: 'Actions',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        keywords: 'dark light mode colour color',
        run: () => toggleTheme(),
      },
      { id: 'email', group: 'Links', label: 'Write an email', hint: 'opens your mail app', keywords: 'contact', run: () => void (window.location.href = `mailto:${PERSONAL_INFO.email}`) },
      { id: 'resume', group: 'Links', label: 'Resume (PDF)', hint: `updated ${PERSONAL_INFO.resumeUpdated}`, keywords: 'cv', run: () => openExternal(PERSONAL_INFO.resume) },
      { id: 'github', group: 'Links', label: 'GitHub', hint: PERSONAL_INFO.githubHandle, keywords: 'source code', run: () => openExternal(PERSONAL_INFO.github) },
      { id: 'linkedin', group: 'Links', label: 'LinkedIn', hint: PERSONAL_INFO.linkedinHandle, run: () => openExternal(PERSONAL_INFO.linkedin) },
      { id: 'instagram', group: 'Links', label: 'Instagram', hint: PERSONAL_INFO.instagramHandle, run: () => openExternal(PERSONAL_INFO.instagram) },
      ...PROJECTS.filter((p) => p.links.live).map<Command>((p) => ({
        id: `live-${p.slug}`,
        group: 'Links',
        label: `${p.title}, live`,
        hint: new URL(p.links.live as string).host,
        keywords: 'demo deployed',
        run: () => openExternal(p.links.live as string),
      })),
    ],
    [transitionTo, scrollToSection, toggleTheme, theme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint ?? ''} ${c.group} ${c.keywords ?? ''}`.toLowerCase().includes(q));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  // Lock page scroll and restore focus to the opener on close. The palette opens
  // from a keyboard shortcut many times a day, so it appears without animation;
  // only the first frame of the panel settles a few pixels.
  useEffect(() => {
    setScrollLocked(true);
    const opener = returnFocus.current;
    const panel = panelRef.current;
    if (panel && !reducedMotion) {
      gsap.fromTo(panel, { y: -6, autoAlpha: 0.6 }, { y: 0, autoAlpha: 1, duration: 0.16, ease: EASE.out });
    }
    return () => {
      setScrollLocked(false);
      opener?.focus?.();
    };
  }, [setScrollLocked, reducedMotion]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const execute = (cmd: Command | undefined) => {
    if (!cmd) return;
    if (cmd.keepOpen) {
      cmd.run();
      return;
    }
    // Close first so smooth scroll resumes before the command scrolls or navigates.
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
      <div className="absolute inset-0 bg-ink/40 dark:bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-2xl overflow-hidden rounded-[var(--r-lg)] border border-line-2 bg-bg-2 text-ink shadow-[0_30px_80px_-20px_rgb(14_17_21/0.45)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a system, section or link"
            className="w-full bg-transparent py-5 text-lg font-[500] outline-none placeholder:text-ink-3 focus-visible:shadow-none sm:text-xl"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search commands"
          />
          <button type="button" onClick={onClose} className="chip hover:text-ink">
            Esc
          </button>
        </div>

        <ul ref={listRef} id={listId} role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto py-2" data-lenis-prevent>
          {results.length === 0 && (
            <li className="px-5 py-10 text-center text-ink-2" role="presentation">
              Nothing matches &ldquo;{query}&rdquo;. Try a project name, &ldquo;email&rdquo; or &ldquo;theme&rdquo;.
            </li>
          )}
          {results.map((cmd, i) => {
            const header = i === 0 || results[i - 1].group !== cmd.group ? cmd.group : null;
            const selected = i === activeIndex;
            return (
              <React.Fragment key={cmd.id}>
                {header && (
                  <li role="presentation" className="t-mono px-5 pb-1 pt-4 text-ink-2">
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
                  className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-[var(--r-sm)] px-3 py-2.5 ${
                    selected ? 'bg-ink text-bg' : ''
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`h-3 w-[3px] shrink-0 rounded-[1px] ${selected ? 'bg-signal' : 'bg-transparent'}`} aria-hidden="true" />
                    <span className="truncate font-[600]">{cmd.label}</span>
                  </span>
                  {cmd.hint && <span className={`t-mono truncate ${selected ? 'opacity-75' : 'text-ink-2'}`}>{cmd.hint}</span>}
                </li>
              </React.Fragment>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-2.5 t-mono text-ink-2">
          <span aria-live="polite">{status || 'Arrow keys to move, Enter to open'}</span>
          <span className="hidden sm:inline">Ctrl K to close</span>
        </div>
      </div>
    </div>
  );
};
