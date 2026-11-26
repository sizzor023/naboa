import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, Star, Store } from 'lucide-react';
import { formatUgx } from '../lib/constants';
import { fetchProductDetail, submitProductReview } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { ProductDetail, Review } from '../types';
import type { AppRoute } from '../components/Header';
import { ResilientImage } from '../components/ResilientImage';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (route: AppRoute) => void;
}

export function ProductDetailPage({
  slug,
  onNavigate,
}: ProductDetailPageProps) {
  const { addToCart, setDrawerOpen } = useCart();
  const { user, signInWithGoogle, getToken } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchProductDetail(slug);
      setProduct(detail.product);
      setReviews(detail.reviews);
      setRatingSummary(detail.ratingSummary);
      setQty(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stockQty <= 0) return;
    addToCart(product, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewError(null);
    setSubmittingReview(true);

    try {
      let token = await getToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setReviewError('Please sign in with Google to publish a review.');
        setSubmittingReview(false);
        return;
      }

      const created = await submitProductReview(product.id, token, {
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      const updatedReviews = [created, ...reviews];
      setReviews(updatedReviews);
      const nextCount = updatedReviews.length;
      const nextAvg = Number(
        (
          updatedReviews.reduce((acc, r) => acc + r.rating, 0) / nextCount
        ).toFixed(1)
      );
      setRatingSummary({ average: nextAvg, count: nextCount });
      setReviewTitle('');
      setReviewComment('');
      setRating(5);
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error ? err.message : 'Could not publish your review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-[4/3] rounded-2xl bg-[#F3ECE1] animate-pulse" />
          <div className="lg:col-span-6 h-80 rounded-2xl bg-[#F3ECE1] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center space-y-4">
        <p className="text-sm text-[#5C544B]">{error || 'Product not found.'}</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'products' })}
          className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-sm font-medium cursor-pointer"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      <button
        type="button"
        onClick={() => onNavigate({ page: 'products' })}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5C544B] hover:text-[#1F1C18] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Products
      </button>

      {/* Contiguous Purchase Module */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-6 lg:sticky lg:top-24 rounded-2xl overflow-hidden border border-[#E4DBCD] bg-[#F3ECE1] aspect-[4/3]">
          <ResilientImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E4DBCD] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-[#5C544B]">
              {product.categoryName} <span aria-hidden="true">·</span>{' '}
              <button
                type="button"
                onClick={() =>
                  onNavigate({ page: 'shop', slug: product.shopSlug })
                }
                className="font-medium text-[#B85231] hover:underline cursor-pointer"
              >
                {product.shopName}
              </button>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F1C18] headline-balance">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-sm pt-1">
              <div className="flex items-center gap-1 text-[#C9962B]">
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                <span className="font-mono font-medium text-[#1F1C18] tabular-nums">
                  {ratingSummary.count > 0 ? ratingSummary.average.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-[#5C544B]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#5C544B] tabular-nums">
                {ratingSummary.count}{' '}
                {ratingSummary.count === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4DBCD] flex items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-2xl font-semibold text-[#1F1C18] tabular-nums">
                {formatUgx(product.priceUgx)}
              </p>
              <p className="text-xs text-[#5C544B] mt-0.5">{product.unitLabel}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  product.stockQty === 0
                    ? 'text-[#B85231]'
                    : product.stockQty <= 10
                      ? 'text-[#9A6E14]'
                      : 'text-[#1B4332]'
                }`}
              >
                {product.stockQty === 0
                  ? 'Out of stock'
                  : `${product.stockQty} units in stock`}
              </p>
              <p className="text-xs text-[#5C544B]">
                Dispatched from {product.shopLocation}
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#5C544B] leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-[#E4DBCD] rounded-lg bg-[#FAF7F2]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 text-[#1F1C18] hover:bg-[#F3ECE1] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={qty >= product.stockQty}
                  onClick={() =>
                    setQty((q) => Math.min(product.stockQty, q + 1))
                  }
                  className="p-3 text-[#1F1C18] hover:bg-[#F3ECE1] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stockQty === 0}
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  addedFeedback
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-[#B85231] text-white hover:bg-[#9A4123]'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Added to Cart
                  </>
                ) : (
                  `Add to Cart · ${formatUgx(product.priceUgx * qty)}`
                )}
              </button>
            </div>

            {addedFeedback && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg border border-[#E4DBCD] text-xs font-medium text-[#1F1C18] hover:bg-[#FAF7F2] cursor-pointer"
              >
                Open Cart & Checkout
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-[#E4DBCD] flex items-center justify-between text-xs text-[#5C544B]">
            <span className="inline-flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
              Sold by {product.shopName}
            </span>
            <button
              type="button"
              onClick={() => onNavigate({ page: 'shop', slug: product.shopSlug })}
              className="text-[#B85231] font-medium hover:underline cursor-pointer"
            >
              View shop profile
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-[#E4DBCD]">
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#1F1C18]">
              Customer Reviews
            </h2>
            <p className="text-sm text-[#5C544B] mt-1">
              Verified shopper feedback stored in our Naboa marketplace ledger.
            </p>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-[#E4DBCD] bg-white p-6 text-sm text-[#5C544B]">
              No reviews yet. Be the first shopper in Mbale to share your thoughts.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-xl border border-[#E4DBCD] bg-white p-5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-[#C9962B]">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < rev.rating ? 'fill-current' : 'text-[#E4DBCD]'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#5C544B] tabular-nums">
                      {new Date(rev.createdAt).toLocaleDateString('en-UG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1F1C18]">
                    {rev.title}
                  </h3>
                  <p className="text-sm text-[#5C544B] leading-relaxed">
                    {rev.comment}
                  </p>
                  <p className="text-xs text-[#5C544B] pt-1">
                    {rev.reviewerName}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-xl border border-[#E4DBCD] bg-white p-6 space-y-4"
          >
            <h3 className="font-display text-xl font-semibold text-[#1F1C18]">
              Write a Review
            </h3>

            <div>
              <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} stars`}
                    onClick={() => setRating(value)}
                    className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                      value <= rating
                        ? 'border-[#C9962B] bg-[#C9962B]/10 text-[#C9962B]'
                        : 'border-[#E4DBCD] text-[#5C544B]/40'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        value <= rating ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                Headline
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                required
                minLength={2}
                maxLength={100}
                className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                Review
              </label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share quality notes, freshness, or delivery experience…"
                required
                minLength={5}
                maxLength={800}
                className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
              />
            </div>

            {reviewError && (
              <p className="text-xs text-[#B85231]">{reviewError}</p>
            )}

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#265943] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submittingReview
                ? 'Publishing…'
                : user
                  ? 'Submit Review'
                  : 'Sign in with Google & Submit'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
