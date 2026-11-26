import { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Search } from 'lucide-react';
import { fetchCategories, fetchShops } from '../lib/api';
import type { Category, Shop } from '../types';
import type { AppRoute } from '../components/Header';
import { ResilientImage } from '../components/ResilientImage';

interface ShopsPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function ShopsPage({ onNavigate }: ShopsPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      fetchShops({
        category: activeCategory,
        q: searchQuery.trim() || undefined,
      })
        .then((list) => {
          if (!cancelled) setShops(list);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : 'Unable to load shop directory.'
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-[#5C544B]">
          Naboa Shopping Centre <span aria-hidden="true">·</span> Mbale City
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F1C18] headline-balance">
          Shop Directory
        </h1>
        <p className="text-sm sm:text-base text-[#5C544B] max-w-2xl">
          Every merchant inside our ground-floor colonnade and balcony suites, with unit locations, direct phone lines, and full shop catalogues.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F3ECE1] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white text-[#1F1C18] shadow-sm'
                : 'text-[#5C544B] hover:text-[#1F1C18]'
            }`}
          >
            All Shops
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.slug
                  ? 'bg-white text-[#1F1C18] shadow-sm'
                  : 'text-[#5C544B] hover:text-[#1F1C18]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="w-4 h-4 text-[#5C544B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shops or wing (e.g. A-02)…"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E4DBCD] bg-white text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#E4DBCD] bg-white p-8 text-center">
          <p className="text-sm text-[#5C544B]">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-72 rounded-xl bg-[#F3ECE1] animate-pulse"
            />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-xl border border-[#E4DBCD] bg-white p-10 text-center space-y-3">
          <p className="text-sm text-[#5C544B]">
            No shops matched your current search or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-xs font-medium hover:bg-[#9A4123] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shopItem) => (
            <article
              key={shopItem.id}
              onClick={() => onNavigate({ page: 'shop', slug: shopItem.slug })}
              className="group cursor-pointer rounded-xl bg-white border border-[#E4DBCD] overflow-hidden flex flex-col sm:flex-row transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="sm:w-52 aspect-[4/3] sm:aspect-auto bg-[#F3ECE1] shrink-0 overflow-hidden">
                <ResilientImage
                  src={shopItem.imageUrl}
                  alt={shopItem.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs text-[#5C544B] mb-1">
                    {shopItem.categoryName}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#1F1C18] group-hover:text-[#B85231] transition-colors">
                    {shopItem.name}
                  </h2>
                  <p className="text-sm text-[#5C544B] mt-1.5 line-clamp-2">
                    {shopItem.tagline}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#5C544B] pt-3 border-t border-[#E4DBCD]/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B85231] shrink-0" aria-hidden="true" />
                    <span className="truncate">{shopItem.unitLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#1B4332] shrink-0" aria-hidden="true" />
                    <span className="font-mono">{shopItem.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#1B4332] shrink-0" aria-hidden="true" />
                    <span className="truncate">{shopItem.email}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
