import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Crosshair, Loader2, X } from 'lucide-react';

interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  currentName: string | null;
  onSave: (data: LocationData) => Promise<void>;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

function trimDisplayName(result: NominatimResult): string {
  const addr = result.address;
  if (addr) {
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const country = addr.country || '';
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
  }
  // Fallback: take first two parts
  const parts = result.display_name.split(',').map(s => s.trim());
  return parts.slice(0, 2).join(', ');
}

export default function LocationSelector({ currentName, onSave }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    if (!editing) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, editing, search]);

  const selectResult = async (result: NominatimResult) => {
    const name = trimDisplayName(result);
    await onSave({ name, lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setEditing(false);
    setQuery('');
    setSuggestions([]);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`
          );
          const data: NominatimResult = await res.json();
          const name = trimDisplayName(data);
          await onSave({ name, lat: pos.coords.latitude, lng: pos.coords.longitude });
          setEditing(false);
        } catch { /* ignore */ }
        setDetecting(false);
      },
      () => setDetecting(false)
    );
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-muted-foreground shrink-0" />
        {currentName ? (
          <>
            <span className="text-sm text-muted-foreground">{currentName}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-accent hover:text-foreground transition-colors ml-1"
            >
              {t('profile.changeLocation')}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('profile.setLocation')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Detect button */}
      <button
        onClick={detectLocation}
        disabled={detecting}
        className="flex items-center gap-2 text-sm text-accent hover:text-foreground transition-colors"
      >
        {detecting ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
        {t('profile.detectLocation')}
      </button>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('profile.searchLocation')}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {(suggestions.length > 0 || searching) && (
        <div className="border border-border rounded bg-background max-h-48 overflow-y-auto">
          {searching && (
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" /> {t('profile.searchingLocation')}
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => selectResult(s)}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border last:border-b-0"
            >
              {trimDisplayName(s)}
              <span className="block text-xs text-muted-foreground truncate">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => { setEditing(false); setQuery(''); setSuggestions([]); }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('profile.cancel')}
      </button>
    </div>
  );
}
