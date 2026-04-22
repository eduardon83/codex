import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MapPin, BookOpen, Users, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import OwlLoader from '@/components/OwlLoader';
import ReadingListsTab from '@/components/ReadingListsTab';
import HelpButton from '@/components/tutorial/HelpButton';
import { resolveAvatarSrc } from '@/lib/avatars';

interface PublicLibrary {
  id: string;
  name: string;
  is_public: boolean;
  user_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    location: string | null;
    avatar_url: string | null;
  } | null;
  book_count: number;
}

interface SavedLib {
  id: string;
  library_id: string;
}

interface OSMLibrary {
  id: number;
  name: string;
  address: string | null;
  distance: number;
  openingHours: string | null;
  website: string | null;
}

type DiscoverTab = 'people' | 'public' | 'readingLists';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface FindLibrariesScreenProps {
  onGoToProfile?: () => void;
  onOpenLibrary?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void;
}

export default function FindLibrariesScreen({ onGoToProfile, onOpenLibrary }: FindLibrariesScreenProps) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<DiscoverTab>('people');
  const [libraries, setLibraries] = useState<PublicLibrary[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedLibs, setSavedLibs] = useState<SavedLib[]>([]);

  // OSM state
  const [osmLibraries, setOsmLibraries] = useState<OSMLibrary[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmError, setOsmError] = useState<'no_location' | 'empty' | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);

  useEffect(() => {
    loadPublicLibraries();
    if (user) loadSaved();
  }, [user]);

  // When switching to public tab, resolve location
  useEffect(() => {
    if (tab === 'public' && !userCoords && !osmLoading) {
      resolveLocation();
    }
  }, [tab]);

  // Re-query when radius or coords change
  useEffect(() => {
    if (userCoords) {
      queryOverpass(userCoords.lat, userCoords.lon, radiusKm);
    }
  }, [userCoords, radiusKm]);

  const resolveLocation = () => {
    // Priority 1: saved profile location
    const profileData = profile as any;
    if (profileData?.location_lat && profileData?.location_lng) {
      setUserCoords({ lat: profileData.location_lat, lon: profileData.location_lng });
      setLocationLabel(profileData.location || null);
      return;
    }

    // Priority 2: browser geolocation fallback
    if (navigator.geolocation) {
      setOsmLoading(true);
      setOsmError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationLabel(null); // no label for browser geolocation
        },
        () => {
          setOsmLoading(false);
          setOsmError('no_location');
        }
      );
      return;
    }

    // Both failed
    setOsmError('no_location');
  };

  const queryOverpass = async (lat: number, lon: number, radius: number) => {
    setOsmLoading(true);
    setOsmError(null);
    const radiusM = radius * 1000;
    const query = `[out:json][timeout:25];(node["amenity"="library"](around:${radiusM},${lat},${lon});way["amenity"="library"](around:${radiusM},${lat},${lon}););out center;`;
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.private.coffee/api/interpreter',
    ];
    let data: any = null;
    let lastErr: unknown = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        if (!res.ok) throw new Error(`Overpass ${url} returned ${res.status}`);
        data = await res.json();
        break;
      } catch (err) {
        lastErr = err;
        console.warn('[Overpass] endpoint failed, trying next:', url, err);
      }
    }
    try {
      if (!data) throw lastErr ?? new Error('All Overpass endpoints failed');
      const results: OSMLibrary[] = (data.elements || []).map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        const tags = el.tags || {};
        const parts = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean);
        return {
          id: el.id,
          name: tags.name || 'Biblioteca',
          address: parts.length > 0 ? parts.join(', ') : null,
          distance: haversineKm(lat, lon, elLat, elLon),
          openingHours: tags.opening_hours || null,
          website: tags.website || tags['contact:website'] || null,
        };
      });
      results.sort((a, b) => a.distance - b.distance);
      setOsmLibraries(results);
      if (results.length === 0) setOsmError('empty');
    } catch (e) {
      console.error('Overpass error:', e);
      setOsmError('empty');
    }
    setOsmLoading(false);
  };

  const loadPublicLibraries = async () => {
    // Use public_libraries view (excludes share_code) and public_profiles for safe cross-user data
    const { data: libs } = await supabase
      .from('public_libraries' as any)
      .select('id, name, is_public, user_id')
      .neq('user_id', user?.id || '');

    // Fetch public profile info for each library owner
    let data: any[] | null = null;
    if (libs && libs.length > 0) {
      const ownerIds = [...new Set((libs as any[]).map((l: any) => l.user_id))];
      const { data: profiles } = await supabase
        .from('public_profiles' as any)
        .select('user_id, first_name, last_name, username, location, avatar_url')
        .in('user_id', ownerIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      data = (libs as any[]).map((lib: any) => ({ ...lib, profiles: profileMap.get(lib.user_id) || null }));
    }

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (lib: any) => {
          const { count } = await supabase
            .from('books')
            .select('id', { count: 'exact', head: true })
            .eq('library_id', lib.id)
            .eq('is_wishlist', false);
          return { ...lib, book_count: count || 0 };
        })
      );
      setLibraries(withCounts as PublicLibrary[]);
    }
  };

  const loadSaved = async () => {
    const { data } = await supabase
      .from('saved_libraries')
      .select('id, library_id')
      .eq('user_id', user!.id);
    if (data) {
      setSavedLibs(data);
      setSavedIds(new Set(data.map((s: any) => s.library_id)));
    }
  };

  const toggleSave = async (libraryId: string) => {
    if (savedIds.has(libraryId)) {
      const saved = savedLibs.find(s => s.library_id === libraryId);
      if (saved) {
        await supabase.from('saved_libraries').delete().eq('id', saved.id);
      }
    } else {
      await supabase.from('saved_libraries').insert({
        user_id: user!.id,
        library_id: libraryId,
      });
    }
    loadSaved();
  };

  const savedLibraries = libraries.filter(l => savedIds.has(l.id));
  const otherLibraries = libraries.filter(l => !savedIds.has(l.id));

  const tabs: { id: DiscoverTab; labelKey: string }[] = [
    { id: 'people', labelKey: 'findLibraries.peopleShelves' },
    { id: 'public', labelKey: 'findLibraries.publicLibraries' },
    { id: 'readingLists', labelKey: 'findLibraries.readingLists' },
  ];

  const radiusOptions = [5, 15, 50];

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-foreground">{t('findLibraries.title')}</h2>
        <HelpButton screen="discover" />
      </div>

      {/* Pill selector */}
      <div data-tutorial="discover-tabs" className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
        {tabs.map(({ id, labelKey }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
              tab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {tab === 'people' && (
        <div>
          {savedLibraries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t('findLibraries.saved')}</h3>
              {savedLibraries.map((lib, i) => (
                <LibraryCard key={lib.id} lib={lib} isSaved={true} onToggleSave={toggleSave} booksLabel={t('library.books')} onOpen={onOpenLibrary} tutorialAnchor={i === 0} />
              ))}
            </div>
          )}

          {otherLibraries.length > 0 ? (
            <div>
              {savedLibraries.length > 0 && (
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{t('findLibraries.discover')}</h3>
              )}
              {otherLibraries.map((lib, i) => (
                <LibraryCard key={lib.id} lib={lib} isSaved={false} onToggleSave={toggleSave} booksLabel={t('library.books')} onOpen={onOpenLibrary} tutorialAnchor={savedLibraries.length === 0 && i === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-muted-foreground text-sm">{t('findLibraries.noShelves')}</p>
              <p className="text-muted-foreground text-xs mt-1">{t('findLibraries.beFirst')}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'public' && (
        <div>
          {/* Radius filter */}
          <div data-tutorial="discover-distance" className="flex gap-1 mb-2 bg-secondary rounded-lg p-1">
            {radiusOptions.map(r => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${
                  radiusKm === r
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Reference location label */}
          {locationLabel && userCoords && !osmLoading && (
            <p className="text-xs text-muted-foreground mb-4">
              {t('findLibraries.nearLocation', { location: locationLabel })}
            </p>
          )}

          {osmLoading && (
            <div className="text-center py-16">
              <OwlLoader />
            </div>
          )}

          {osmError === 'no_location' && !osmLoading && (
            <div className="text-center py-16">
              <MapPin size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-muted-foreground text-sm">{t('findLibraries.setLocationHint')}</p>
              {onGoToProfile && (
                <button
                  onClick={onGoToProfile}
                  className="mt-4 text-sm text-accent hover:text-foreground transition-colors"
                >
                  {t('findLibraries.goToProfile')}
                </button>
              )}
            </div>
          )}

          {osmError === 'empty' && !osmLoading && (
            <div className="text-center py-16">
              <MapPin size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-muted-foreground text-sm">{t('findLibraries.noResults')}</p>
            </div>
          )}

          {!osmLoading && !osmError && osmLibraries.length > 0 && (
            <div>
              {osmLibraries.map(lib => (
                <div key={lib.id} className="py-3 border-b border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">{lib.name}</p>
                      {lib.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">{lib.address}</p>
                      )}
                      {lib.openingHours && (
                        <p className="text-xs text-muted-foreground mt-0.5">{lib.openingHours}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                      {lib.distance.toFixed(1)} km
                    </span>
                  </div>
                  {lib.website && (
                    <a
                      href={lib.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors mt-1.5"
                    >
                      {t('findLibraries.viewWebsite')} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'readingLists' && <ReadingListsTab />}
    </div>
  );
}

function LibraryCard({ lib, isSaved, onToggleSave, booksLabel, onOpen, tutorialAnchor }: {
  lib: PublicLibrary;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  booksLabel: string;
  onOpen?: (lib: { libraryId: string; libraryName: string; ownerUserId: string; ownerUsername: string | null }) => void;
  tutorialAnchor?: boolean;
}) {
  const { t } = useTranslation();
  const profile = Array.isArray(lib.profiles) ? lib.profiles[0] : lib.profiles;

  const handleClick = () => {
    onOpen?.({
      libraryId: lib.id,
      libraryName: lib.name,
      ownerUserId: lib.user_id,
      ownerUsername: profile?.username || null,
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border">
      <button onClick={handleClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <img src={resolveAvatarSrc(profile?.avatar_url)} alt="" className="h-9 w-9 rounded-full border border-border object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{profile?.username} · {lib.book_count} {booksLabel}{profile?.location ? ` · ${profile.location}` : ''}
          </p>
        </div>
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            data-tutorial={tutorialAnchor ? 'discover-save' : undefined}
            onClick={() => onToggleSave(lib.id)}
            className="p-1"
          >
            <Heart
              size={18}
              className={isSaved ? 'text-gold fill-gold' : 'text-muted-foreground'}
              strokeWidth={1.5}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>{isSaved ? t('findLibraries.unsave') : t('findLibraries.saveLibrary')}</TooltipContent>
      </Tooltip>
    </div>
  );
}
