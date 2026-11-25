import { useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';

interface ResolvedLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface PlacePredictionItem {
  placeId: string;
  text: { text: string };
  toPlace: () => {
    fetchFields: (opts: { fields: string[] }) => Promise<unknown>;
    formattedAddress?: string | null;
    displayName?: string | null;
  };
}

interface SuggestionItem {
  placePrediction?: PlacePredictionItem | null;
}

function isQuotaError(err: unknown): boolean {
  const text = err instanceof Error ? err.message : String(err);
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('429') ||
    text.includes('QuotaExceededError')
  );
}

export function CentreMap({ hasApiKey }: { hasApiKey: boolean }) {
  const isLoaded = useApiIsLoaded();
  const loadingStatus = useApiLoadingStatus();
  const placesLib = useMapsLibrary('places');

  const [resolved, setResolved] = useState<ResolvedLocation | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (!hasApiKey || !isLoaded || !placesLib) return;

    let cancelled = false;

    async function locateCentre() {
      try {
        const { places } = await placesLib!.Place.searchByText({
          textQuery: 'Naboa Road, Mbale, Uganda',
          fields: ['displayName', 'location', 'formattedAddress'],
          maxResultCount: 1,
        });

        if (cancelled) return;

        const match = places?.[0];
        if (match?.location) {
          setResolved({
            lat: match.location.lat(),
            lng: match.location.lng(),
            name: 'Naboa Shopping Centre',
            address: match.formattedAddress || 'Naboa Road, Mbale City, Uganda',
          });
          setLookupError(null);
        } else {
          setLookupError('Location details unavailable for Naboa Road, Mbale.');
        }
      } catch (err) {
        if (cancelled) return;
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setLookupError(
          'Interactive map preview is temporarily unavailable. Use the Google Maps link below for directions.'
        );
      }
    }

    locateCentre();
    return () => {
      cancelled = true;
    };
  }, [hasApiKey, isLoaded, placesLib]);

  const mapsSearchUrl =
    'https://www.google.com/maps/search/?api=1&query=Naboa+Road,+Mbale,+Uganda';

  if (
    !hasApiKey ||
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    lookupError
  ) {
    return (
      <div className="h-full min-h-[360px] w-full rounded-xl border border-[#E4DBCD] bg-[#F3ECE1] p-8 flex flex-col justify-between">
        <div>
          <div className="w-11 h-11 rounded-lg bg-[#B85231]/10 text-[#B85231] flex items-center justify-center mb-5">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-[#1F1C18] mb-2">
            Naboa Road, Mbale City
          </h3>
          <p className="text-sm text-[#5C544B] leading-relaxed max-w-md">
            {lookupError ||
              'Located in the commercial heart of Mbale City, minutes from Republic Street and the Mount Elgon foothills.'}
          </p>
        </div>
        <div className="pt-6 border-t border-[#E4DBCD] flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-[#5C544B]">
            Central Division · Mbale City, Eastern Uganda
          </span>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B85231] text-white text-sm font-medium hover:bg-[#9A4123] transition-colors whitespace-nowrap shrink-0"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="h-full min-h-[360px] w-full rounded-xl border border-[#E4DBCD] bg-[#F3ECE1] flex items-center justify-center p-6">
        <div className="text-center">
          <MapPin className="w-6 h-6 text-[#B85231] mx-auto mb-2 animate-pulse" aria-hidden="true" />
          <p className="text-sm text-[#5C544B]">Locating Naboa Road, Mbale City…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[360px] w-full rounded-xl overflow-hidden border border-[#E4DBCD] bg-[#F3ECE1] relative">
      <GoogleMap
        defaultCenter={{ lat: resolved.lat, lng: resolved.lng }}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%', minHeight: '360px' }}
      >
        <AdvancedMarker
          ref={markerRef}
          position={{ lat: resolved.lat, lng: resolved.lng }}
          onClick={() => setInfoOpen(true)}
          title={resolved.name}
        >
          <Pin
            background="#B85231"
            borderColor="#7D3017"
            glyphColor="#FAF7F2"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={240}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="p-1 text-[#1F1C18]">
              <p className="font-semibold text-sm">{resolved.name}</p>
              <p className="text-xs text-[#5C544B] mt-0.5">{resolved.address}</p>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs font-medium text-[#B85231] underline"
              >
                Get directions
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

interface DeliveryAddressFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasApiKey: boolean;
  placeholder?: string;
}

export function DeliveryAddressField({
  value,
  onChange,
  hasApiKey,
  placeholder = 'e.g. Plot 12, Republic Street, Mbale',
}: DeliveryAddressFieldProps) {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<unknown>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasApiKey || !placesLib) return;
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const res =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: `${value.trim()}, Mbale`,
            includedRegionCodes: ['ug'],
            sessionToken: sessionTokenRef.current as never,
          });
        if (!cancelled) {
          setSuggestions((res.suggestions as SuggestionItem[]).slice(0, 4));
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, hasApiKey, placesLib]);

  const handleSelectSuggestion = async (suggestion: SuggestionItem) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress', 'displayName'] });
      const chosen =
        place.formattedAddress || place.displayName || prediction.text.text;
      onChange(chosen);
    } catch {
      onChange(prediction.text.text);
    } finally {
      sessionTokenRef.current = null;
      setSuggestions([]);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none focus:ring-2 focus:ring-[#B85231]/15"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#E4DBCD] bg-white shadow-lg overflow-hidden">
          {suggestions.map((s) => {
            const pred = s.placePrediction;
            if (!pred) return null;
            return (
              <li key={pred.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(s);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs text-[#1F1C18] hover:bg-[#F3ECE1] transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#B85231] shrink-0" aria-hidden="true" />
                  <span className="truncate">{pred.text.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
