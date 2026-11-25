import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { CENTRE_OPENING_HOURS } from '../lib/constants';
import type { HomeData } from '../types';
import { CentreMap } from '../components/CentreMap';
import type { AppRoute } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface HomePageProps {
  data: HomeData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (route: AppRoute) => void;
  hasMapsKey: boolean;
}

export function HomePage({
  data,
  loading,
  error,
  onRetry,
  onNavigate,
  hasMapsKey,
}: HomePageProps) {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. Storefront Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative rounded-2xl overflow-hidden border border-[#E4DBCD] bg-[#1F1C18]">
          <div className="aspect-[16/9] min-h-[380px] max-h-[560px] w-full">
            <ResilientImage
              src="/src/assets/images/hero_naboa_centre_1795630079734.jpg"
              alt="Naboa Shopping Centre terracotta colonnade with Mount Elgon rising behind Mbale City"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end">
            <div className="p-6 sm:p-10 lg:p-12 max-w-2xl text-white">
              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#E7C675] mb-3">
                Naboa Road · Mbale City, Uganda
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-tight headline-balance">
                Mbale’s gathering place for Elgon craft, coffee & daily market goods
              </h1>
              <p className="mt-4 text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
                Explore independent shops under terracotta arches—from freshly roasted Bugisu Arabica and handwoven sisal to raw highland honey delivered across Mbale City.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'products' })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#B85231] text-white text-sm font-semibold hover:bg-[#9A4123] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'shops' })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/15 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Shop Directory
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl border border-[#E4DBCD] bg-white p-8 text-center space-y-3">
            <p className="text-sm text-[#5C544B]">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-sm font-medium hover:bg-[#9A4123] cursor-pointer"
            >
              Retry Loading Directory
            </button>
          </div>
        </section>
      ) : loading || !data ? (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-36 rounded-xl bg-[#F3ECE1] animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl bg-[#F3ECE1] animate-pulse"
              />
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* 2. Shop Categories */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1F1C18]">
                  Shop by Category
                </h2>
                <p className="text-sm text-[#5C544B] mt-1">
                  Five curated aisles inside Naboa Shopping Centre.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'products' })}
                className="text-sm font-medium text-[#B85231] hover:text-[#9A4123] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                View full catalogue
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onNavigate({ page: 'products', category: cat.slug })
                  }
                  className="group text-left rounded-xl bg-white border border-[#E4DBCD] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full bg-[#F3ECE1] overflow-hidden">
                    <ResilientImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#1F1C18] group-hover:text-[#B85231] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#5C544B] mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 3. Featured Shops */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1F1C18]">
                  Featured Shops
                </h2>
                <p className="text-sm text-[#5C544B] mt-1">
                  Independent Mbale merchants, roasters, and craft ateliers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'shops' })}
                className="text-sm font-medium text-[#B85231] hover:text-[#9A4123] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                All shops in directory
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.featuredShops.map((shopItem) => (
                <article
                  key={shopItem.id}
                  onClick={() =>
                    onNavigate({ page: 'shop', slug: shopItem.slug })
                  }
                  className="group cursor-pointer rounded-xl bg-white border border-[#E4DBCD] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full bg-[#F3ECE1] overflow-hidden">
                    <ResilientImage
                      src={shopItem.imageUrl}
                      alt={shopItem.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#5C544B] mb-1.5">
                        {shopItem.categoryName} <span aria-hidden="true">·</span>{' '}
                        {shopItem.unitLocation}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-[#1F1C18] group-hover:text-[#B85231] transition-colors">
                        {shopItem.name}
                      </h3>
                      <p className="text-sm text-[#5C544B] mt-2 line-clamp-2">
                        {shopItem.tagline}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#E4DBCD]/70 flex items-center justify-between text-xs text-[#5C544B]">
                      <span>{shopItem.openingHours.split('·')[0].trim()}</span>
                      <span className="font-medium text-[#B85231] group-hover:underline">
                        Visit shop
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 4. Trending Products */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1F1C18]">
                  Trending Products
                </h2>
                <p className="text-sm text-[#5C544B] mt-1">
                  Popular picks across Mbale City with same-day local dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'products' })}
                className="text-sm font-medium text-[#B85231] hover:text-[#9A4123] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                Browse all products
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trendingProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* 5. Opening Hours & Interactive Map */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 rounded-xl bg-[#1B4332] text-[#FAF7F2] p-8 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-xs font-medium tracking-wide text-[#E7C675]">
                Plan Your Visit
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold headline-balance">
                Opening Hours & Courtyard Location
              </h2>
              <p className="text-sm text-[#FAF7F2]/80 leading-relaxed">
                Find us along Naboa Road in central Mbale City, two blocks east of the Clock Tower with shaded courtyard parking and boda-boda dispatch.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/15 pt-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#E7C675]">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>Centre Hours</span>
              </div>
              <dl className="space-y-2.5 text-sm">
                {CENTRE_OPENING_HOURS.map((row) => (
                  <div
                    key={row.days}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="text-[#FAF7F2]/80">{row.days}</dt>
                    <dd className="font-mono tabular-nums font-medium">
                      {row.hours}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-2.5 border-t border-white/15 pt-6 text-sm text-[#FAF7F2]/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E7C675] mt-0.5 shrink-0" aria-hidden="true" />
                <span>Plot 18–24 Naboa Road, Mbale City, Uganda</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E7C675] shrink-0" aria-hidden="true" />
                <a href="tel:+256454433210" className="hover:underline font-mono">
                  +256 454 433 210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E7C675] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:concierge@naboacentre.ug"
                  className="hover:underline"
                >
                  concierge@naboacentre.ug
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex">
            <CentreMap hasApiKey={hasMapsKey} />
          </div>
        </div>
      </section>
    </div>
  );
}
