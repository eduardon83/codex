// Tutorial step definitions per screen.
// `target` is a CSS selector matched inside the document.
// If the element isn't found, the step is shown centered with no highlight.

export type TutorialScreen =
  | 'library'
  | 'addBook'
  | 'profile'
  | 'discover'
  | 'wishlist';

export interface TutorialStep {
  /** CSS selector for the element to highlight. */
  target: string | null;
  /** i18n key for the step title. */
  titleKey: string;
  /** i18n key for the step description. */
  descriptionKey: string;
}

export const TUTORIALS: Record<TutorialScreen, TutorialStep[]> = {
  library: [
    { target: '[data-tutorial="library-tabs"]', titleKey: 'tutorial.library.tabs.title', descriptionKey: 'tutorial.library.tabs.desc' },
    { target: '[data-tutorial="library-search"]', titleKey: 'tutorial.library.search.title', descriptionKey: 'tutorial.library.search.desc' },
    { target: '[data-tutorial="library-filter"]', titleKey: 'tutorial.library.filter.title', descriptionKey: 'tutorial.library.filter.desc' },
    { target: '[data-tutorial="library-add"]', titleKey: 'tutorial.library.add.title', descriptionKey: 'tutorial.library.add.desc' },
    { target: '[data-tutorial="library-book-row"]', titleKey: 'tutorial.library.book.title', descriptionKey: 'tutorial.library.book.desc' },
  ],
  addBook: [
    { target: '[data-tutorial="add-isbn-vs-manual"]', titleKey: 'tutorial.addBook.mode.title', descriptionKey: 'tutorial.addBook.mode.desc' },
    { target: '[data-tutorial="add-fields"]', titleKey: 'tutorial.addBook.fields.title', descriptionKey: 'tutorial.addBook.fields.desc' },
    { target: '[data-tutorial="add-tags"]', titleKey: 'tutorial.addBook.tags.title', descriptionKey: 'tutorial.addBook.tags.desc' },
    { target: '[data-tutorial="add-save"]', titleKey: 'tutorial.addBook.save.title', descriptionKey: 'tutorial.addBook.save.desc' },
  ],
  profile: [
    { target: '[data-tutorial="profile-stats"]', titleKey: 'tutorial.profile.stats.title', descriptionKey: 'tutorial.profile.stats.desc' },
    { target: '[data-tutorial="profile-reading-list"]', titleKey: 'tutorial.profile.reading.title', descriptionKey: 'tutorial.profile.reading.desc' },
    { target: '[data-tutorial="profile-favourites"]', titleKey: 'tutorial.profile.favourites.title', descriptionKey: 'tutorial.profile.favourites.desc' },
    { target: '[data-tutorial="profile-theme"]', titleKey: 'tutorial.profile.theme.title', descriptionKey: 'tutorial.profile.theme.desc' },
  ],
  discover: [
    { target: '[data-tutorial="discover-tabs"]', titleKey: 'tutorial.discover.tabs.title', descriptionKey: 'tutorial.discover.tabs.desc' },
    { target: '[data-tutorial="discover-distance"]', titleKey: 'tutorial.discover.distance.title', descriptionKey: 'tutorial.discover.distance.desc' },
    { target: '[data-tutorial="discover-save"]', titleKey: 'tutorial.discover.save.title', descriptionKey: 'tutorial.discover.save.desc' },
  ],
  wishlist: [
    { target: '[data-tutorial="wishlist-add"]', titleKey: 'tutorial.wishlist.add.title', descriptionKey: 'tutorial.wishlist.add.desc' },
    { target: '[data-tutorial="wishlist-share"]', titleKey: 'tutorial.wishlist.share.title', descriptionKey: 'tutorial.wishlist.share.desc' },
  ],
};

const STORAGE_PREFIX = 'tutorial_seen_';

export function isTutorialSeen(screen: TutorialScreen): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + screen) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialSeen(screen: TutorialScreen): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + screen, 'true');
  } catch {
    /* ignore */
  }
}
