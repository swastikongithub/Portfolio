import { useEffect } from 'react';

const SITE = 'Swastik Singh';
const DEFAULT_DESCRIPTION =
  'Swastik Singh builds backends for the second time something happens: LPU Reserve, VulnTrack, Tenora and an AI Interview Platform, each built around one guarantee the database enforces.';

export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE}, software engineer`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description ?? DEFAULT_DESCRIPTION);
  }, [title, description]);
}
