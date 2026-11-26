import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { fetchShopDetail } from '../lib/api';
import type { Product, Shop } from '../types';
import type { AppRoute } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface ShopDetailPageProps {
  slug: string;
  onNavigate: (route: AppRoute) => void;
}

export function ShopDetailPage({ slug, onNavigate }: ShopDetailPageProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchShopDetail(slug)
      .then((res) => {
        if (!cancelled) {
          setShop(res.shop);
          setProducts(res.products);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Shop not found.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="h-80 rounded-2xl bg-[#F3ECE1] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-[#F3ECE1] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center space-y-4">
        <p className="text-sm text-[#5C544B]">{error || 'Shop not found.'}</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'shops' })}
          className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-sm font-medium cursor-pointer"
        >
          Back to Shop Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <button
        type="button"
        onClick={() => onNavigate({ page: 'shops' })}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5C544B] hover:text-[#1F1C18] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Shop Directory
      </button>

      {/* Shop Profile Header */}
      <section className="rounded-2xl bg-white border border-[#E4DBCD] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-6 aspect-[4/3] lg:aspect-auto bg-[#F3ECE1]">
          <ResilientImage
            src={shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs text-[#5C544B]">
              {shop.categoryName} <span aria-hidden="true">·</span> Naboa Shopping Centre
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F1C18] headline-balance">
              {shop.name}
            </h1>
            <p className="text-sm sm:text-base text-[#5C544B] leading-relaxed">
              {shop.description || shop.tagline}
            </p>
          </div>

          <dl className="pt-5 border-t border-[#E4DBCD] space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#B85231] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-[#5C544B]">Location inside Centre</dt>
                <dd className="font-medium text-[#1F1C18]">{shop.unitLocation}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-[#5C544B]">Phone</dt>
                <dd>
                  <a
                    href={`tel:${shop.phone.replace(/\s+/g, '')}`}
                    className="font-mono font-medium text-[#1F1C18] hover:text-[#B85231]"
                  >
                    {shop.phone}
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-[#5C544B]">Email</dt>
                <dd>
                  <a
                    href={`mailto:${shop.email}`}
                    className="font-medium text-[#1F1C18] hover:text-[#B85231]"
                  >
                    {shop.email}
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#C9962B] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-[#5C544B]">Opening Hours</dt>
                <dd className="font-medium text-[#1F1C18]">{shop.openingHours}</dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* Shop Products */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#1F1C18]">
            Products from {shop.name}
          </h2>
          <p className="text-sm text-[#5C544B] mt-1">
            {products.length} {products.length === 1 ? 'item' : 'items'} available for Mbale delivery or courtyard pickup.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-[#E4DBCD] bg-white p-8 text-center text-sm text-[#5C544B]">
            No products currently listed for this shop.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
