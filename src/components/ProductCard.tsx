import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { formatUgx } from '../lib/constants';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { ResilientImage } from './ResilientImage';
import type { AppRoute } from './Header';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: AppRoute) => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQty <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      onClick={() => onNavigate({ page: 'product', slug: product.slug })}
      className="group cursor-pointer rounded-xl bg-white border border-[#E4DBCD] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-[#F3ECE1] overflow-hidden">
        <ResilientImage
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs text-[#5C544B] mb-1.5 truncate">
            {product.categoryName} <span aria-hidden="true">·</span> {product.shopName}
          </p>
          <h3 className="text-base font-semibold text-[#1F1C18] leading-snug group-hover:text-[#B85231] transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-[#5C544B] mt-1">{product.unitLabel}</p>
        </div>

        <div className="pt-3 border-t border-[#E4DBCD]/70 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[15px] font-medium text-[#1F1C18] tabular-nums">
              {formatUgx(product.priceUgx)}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                product.stockQty === 0
                  ? 'text-[#B85231] font-medium'
                  : product.stockQty <= 10
                    ? 'text-[#9A6E14]'
                    : 'text-[#1B4332]'
              }`}
            >
              {product.stockQty === 0
                ? 'Out of stock'
                : `${product.stockQty} in stock`}
            </p>
          </div>

          <button
            type="button"
            disabled={product.stockQty === 0}
            onClick={handleQuickAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-[#1B4332] text-white'
                : 'bg-[#FAF7F2] border border-[#E4DBCD] text-[#1F1C18] hover:bg-[#B85231] hover:text-white hover:border-[#B85231]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
