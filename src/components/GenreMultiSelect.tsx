import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronDown } from 'lucide-react';

export const GENRE_OPTIONS = [
  'Academic', 'Alternate History', 'Biography', "Children's Story", 'Comedy',
  'Cookbook', 'Fairy Tale', 'Fantasy', 'Historical', 'Horror', 'Magazine',
  'Mystery', 'Non-fiction', 'Play', 'Poetry', 'Romance', 'Science Fiction',
  'Self-help', 'Thriller & Suspense', 'Travel', 'Western',
];

interface GenreMultiSelectProps {
  selected: string[];
  onChange: (genres: string[]) => void;
  disabled?: boolean;
}

export default function GenreMultiSelect({ selected, onChange, disabled }: GenreMultiSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter(g => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-10 px-3 text-sm border border-border rounded bg-background text-foreground disabled:opacity-50"
      >
        <span className={selected.length === 0 ? 'text-muted-foreground' : ''}>
          {selected.length === 0 ? t('addBook.selectGenre') : `${selected.length} ${t('addBook.genresSelected')}`}
        </span>
        <ChevronDown size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-auto rounded border border-border bg-popover shadow-md">
          {GENRE_OPTIONS.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => toggle(genre)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors ${
                selected.includes(genre) ? 'bg-accent text-accent-foreground' : 'text-foreground'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(genre => (
            <span key={genre} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground">
              {genre}
              <button type="button" onClick={() => toggle(genre)}><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Parse a genre string (comma-separated) into an array */
export function parseGenres(genre: string | null): string[] {
  if (!genre) return [];
  return genre.split(',').map(g => g.trim()).filter(Boolean);
}

/** Serialize genre array to comma-separated string */
export function serializeGenres(genres: string[]): string | null {
  return genres.length > 0 ? genres.join(', ') : null;
}
