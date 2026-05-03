import { ReactNode, createContext, useContext, useMemo } from 'react';

/**
 * Tutorial system removed for Codex. This provider is now a no-op shim that
 * preserves the previous public API so existing imports continue to compile.
 * The interactive tutorial has been replaced by a static help modal — see
 * `src/components/HelpModal.tsx`.
 */

type TutorialContextValue = {
  isActive: boolean;
  currentStep: number;
  chapterStatus: never[];
  startTutorial: (step?: number, revisit?: boolean) => void;
  openChapterMap: () => void;
  closeTutorial: () => void;
};

const noop = () => {};
const defaultValue: TutorialContextValue = {
  isActive: false,
  currentStep: 0,
  chapterStatus: [],
  startTutorial: noop,
  openChapterMap: noop,
  closeTutorial: noop,
};

const TutorialContext = createContext<TutorialContextValue>(defaultValue);

export function FoliumTutorialProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => defaultValue, []);
  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useCodexTutorial() {
  return useContext(TutorialContext);
}
