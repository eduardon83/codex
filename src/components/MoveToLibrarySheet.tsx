import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { BookOpen, Check } from 'lucide-react';

interface Library {
  id: string;
  name: string;
}

interface MoveToLibrarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraries: Library[];
  currentLibraryId?: string;
  onSelect: (libraryId: string, libraryName: string) => void;
}

export default function MoveToLibrarySheet({
  open,
  onOpenChange,
  libraries,
  currentLibraryId,
  onSelect,
}: MoveToLibrarySheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background border-border rounded-t-2xl max-h-[60vh]">
        <SheetHeader>
          <SheetTitle className="font-serif text-lg">{t('library.moveToLibrary')}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-1 overflow-y-auto">
          {libraries.map(lib => {
            const isCurrent = lib.id === currentLibraryId;
            return (
              <button
                key={lib.id}
                disabled={isCurrent}
                onClick={() => !isCurrent && onSelect(lib.id, lib.name)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isCurrent
                    ? 'opacity-50 cursor-default'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <BookOpen size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
                <span className="flex-1 text-sm text-foreground">{lib.name}</span>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Check size={12} />
                    {t('library.current')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
