import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchCategories, fetchProducts, fetchShops } from '../lib/api';
import type { Category, Product, Shop } from '../types';
import type { AppRoute } from '../components/Header';
import { ProductCard } from '../components/ProductCard';

interface ProductsPageProps {
  initialCategory?: string;
  initialShop?: string;
  onNavigate: (route: AppRoute) => void;
}

export function ProductsPage({
  initialCategory,
  initialShop,
  onNavigate,
}: ProductsPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categorySlug, setCategorySlug] = useState<string>(
    initialCategory || 'all'
  );
  const [shopSlug, setShopSlug] = useState<string>(initialShop || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'trending' | 'price_asc' | 'price_desc'>(
    'trending'
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategorySlug(initialCategory || 'all');
  }, [initialCategory]);

  useEffect(() => {
    setShopSlug(initialShop || 'all');
  }, [initialShop]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchShops()])
      .then(([cats, shopList]) => {
        setCategories(cats);
        setShops(shopList);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      fetchProducts({
        category: categorySlug,
        shop: shopSlug,
        q: searchQuery.trim() || undefined,
        sort,
      })
        .then((list) => {
          if (!cancelled) setProducts(list);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : 'Unable to load products.'
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
  }, [categorySlug, shopSlug, searchQuery, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <p className="text-xs text-[#5C544B]">
          Naboa Shopping Centre <span aria-hidden="true">·</span> Product Catalogue
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F1C18] headline-balance">
          All Marketplace Products
        </h1>
        <p className="text-sm sm:text-base text-[#5C544B] max-w-2xl">
          Search across all Naboa merchants, filter by aisle category or shop, and order for rapid Mbale delivery or courtyard collection.
        </p>
      </div>

      {/* Category Filter Segmented Control + Search/Shop/Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F3ECE1] rounded-lg w-fit max-w-full">
          <button
            type="button"
            onClick={() => setCategorySlug('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              categorySlug === 'all'
                ? 'bg-white text-[#1F1C18] shadow-sm'
                : 'text-[#5C544B] hover:text-[#1F1C18]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorySlug(cat.slug)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categorySlug === cat.slug
                  ? 'bg-white text-[#1F1C18] shadow-sm'
                  : 'text-[#5C544B] hover:text-[#1F1C18]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search
              className="w-4 h-4 text-[#5C544B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee, honey, kitenge, sisal…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E4DBCD] bg-white text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter by shop"
              value={shopSlug}
              onChange={(e) => setShopSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4DBCD] bg-white text-sm text-[#1F1C18] focus:border-[#B85231] focus:outline-none"
            >
              <option value="all">All Shops</option>
              {shops.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as 'trending' | 'price_asc' | 'price_desc'
                )
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4DBCD] bg-white text-sm text-[#1F1C18] focus:border-[#B85231] focus:outline-none"
            >
              <option value="trending">Sort: Featured & Trending</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#E4DBCD] bg-white p-8 text-center">
          <p className="text-sm text-[#5C544B]">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-xl bg-[#F3ECE1] animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-[#E4DBCD] bg-white p-10 text-center space-y-3">
          <p className="text-sm text-[#5C544B]">
            No products matched your search or filter selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategorySlug('all');
              setShopSlug('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-xs font-medium hover:bg-[#9A4123] cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
