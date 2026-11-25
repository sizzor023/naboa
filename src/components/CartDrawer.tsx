import { useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  DELIVERY_ZONES,
  PAYMENT_METHODS,
  formatUgx,
  type PaymentMethod,
} from '../lib/constants';
import { placeOrder } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { OrderReceipt } from '../types';
import { DeliveryAddressField } from './CentreMap';
import type { AppRoute } from './Header';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  hasMapsKey: boolean;
  onNavigate: (route: AppRoute) => void;
  onOrderCompleted: () => void;
}

export function CartDrawer({
  hasMapsKey,
  onNavigate,
  onOrderCompleted,
}: CartDrawerProps) {
  const {
    items,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotalUgx,
  } = useCart();
  const { user, signInWithGoogle, getToken } = useAuth();

  const [zoneId, setZoneId] = useState<string>('mbale-central');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [providerPhone, setProviderPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  if (!drawerOpen) return null;

  const selectedZone =
    DELIVERY_ZONES.find((z) => z.id === zoneId) ?? DELIVERY_ZONES[1];
  const deliveryFeeUgx = items.length > 0 ? selectedZone.feeUgx : 0;
  const totalUgx = subtotalUgx + deliveryFeeUgx;
  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

  const handleClose = () => {
    setDrawerOpen(false);
    if (receipt) {
      setReceipt(null);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) return;

    setSubmitting(true);
    try {
      let token = await getToken();
      if (!token) {
        token = await signInWithGoogle();
      }
      if (!token) {
        setError('Please sign in with Google to confirm your order.');
        setSubmitting(false);
        return;
      }

      const resolvedAddress =
        zoneId === 'pickup' && !deliveryAddress.trim()
          ? 'Courtyard Desk Pickup, Naboa Shopping Centre, Mbale'
          : deliveryAddress.trim();

      const result = await placeOrder(token, {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        deliveryZoneId: zoneId,
        deliveryAddress: resolvedAddress,
        customerPhone: customerPhone.trim(),
        paymentMethod,
        providerPhone: selectedPayment?.requiresPhone
          ? (providerPhone.trim() || customerPhone.trim())
          : undefined,
        notes: notes.trim() || undefined,
      });

      setReceipt(result);
      clearCart();
      onOrderCompleted();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to complete checkout.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart and Checkout"
    >
      <div className="w-full max-w-lg bg-[#FAF7F2] h-full flex flex-col border-l border-[#E4DBCD] shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E4DBCD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#B85231]" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-[#1F1C18]">
              {receipt ? 'Order Confirmed' : 'Your Cart & Checkout'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close cart drawer"
            className="p-2 rounded-lg text-[#5C544B] hover:bg-[#F3ECE1] hover:text-[#1F1C18] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {receipt ? (
            <div className="space-y-5">
              <div className="rounded-xl bg-white border border-[#E4DBCD] p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-6 h-6 text-[#1B4332] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-[#5C544B]">Order Reference</p>
                    <h3 className="font-mono text-lg font-semibold text-[#1F1C18] tabular-nums">
                      {receipt.order.orderNumber}
                    </h3>
                    <p className="text-sm text-[#5C544B] mt-1">
                      Thank you! Your order from Naboa Shopping Centre is confirmed.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4DBCD] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5C544B]">Payment Method</span>
                    <span className="font-medium text-[#1F1C18]">
                      {receipt.payment.method === 'mtn_momo'
                        ? 'MTN MoMo'
                        : receipt.payment.method === 'airtel_money'
                          ? 'Airtel Money'
                          : 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C544B]">Transaction Ref</span>
                    <span className="font-mono text-xs text-[#1F1C18]">
                      {receipt.payment.transactionRef}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C544B]">Total</span>
                    <span className="font-mono font-semibold text-[#1F1C18] tabular-nums">
                      {formatUgx(receipt.order.totalUgx)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#1B4332] text-white p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#FAF7F2]/80">
                  <Truck className="w-4 h-4" aria-hidden="true" />
                  <span>Assigned Mbale Courier</span>
                </div>
                <p className="font-display text-lg font-semibold">
                  {receipt.delivery.courier.fullName}
                </p>
                <p className="text-sm text-[#FAF7F2]/90">
                  {receipt.delivery.courier.vehicleType} · Plate{' '}
                  <span className="font-mono">
                    {receipt.delivery.courier.plateNumber}
                  </span>
                </p>
                <p className="text-sm text-[#FAF7F2]/90 font-mono">
                  {receipt.delivery.courier.phone}
                </p>
                <p className="text-xs text-[#FAF7F2]/75 pt-1">
                  Destination: {receipt.delivery.deliveryAddress} · Est.{' '}
                  {receipt.delivery.estimatedMinutes} mins
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigate({ page: 'orders' });
                  }}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#B85231] text-white text-sm font-medium hover:bg-[#9A4123] transition-colors cursor-pointer"
                >
                  View All Orders
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 px-4 rounded-lg border border-[#E4DBCD] bg-white text-sm font-medium text-[#1F1C18] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <ShoppingBag
                className="w-10 h-10 text-[#5C544B]/50 mx-auto"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1F1C18]">
                  Your basket is empty
                </h3>
                <p className="text-sm text-[#5C544B] mt-1">
                  Explore Bugisu coffee, Ugandan textiles, and fresh Mbale pantry goods.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onNavigate({ page: 'products' });
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#B85231] text-white text-sm font-medium hover:bg-[#9A4123] transition-colors cursor-pointer"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-[#5C544B]">
                  Items ({items.length})
                </h3>
                <div className="divide-y divide-[#E4DBCD] rounded-xl border border-[#E4DBCD] bg-white">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="p-4 flex gap-3.5 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F3ECE1] shrink-0">
                        <ResilientImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1F1C18] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#5C544B] truncate">
                          {product.shopName}
                        </p>
                        <p className="font-mono text-xs text-[#1F1C18] mt-1 tabular-nums">
                          {formatUgx(product.priceUgx * quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Decrease quantity for ${product.name}`}
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-md border border-[#E4DBCD] flex items-center justify-center text-[#1F1C18] hover:bg-[#F3ECE1] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity for ${product.name}`}
                          disabled={quantity >= product.stockQty}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded-md border border-[#E4DBCD] flex items-center justify-center text-[#1F1C18] hover:bg-[#F3ECE1] disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${product.name}`}
                          onClick={() => removeItem(product.id)}
                          className="ml-1 p-1.5 text-[#5C544B] hover:text-[#B85231] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Zone & Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-[#5C544B]">
                  Mbale Delivery Details
                </h3>
                <div className="rounded-xl border border-[#E4DBCD] bg-white p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                      Delivery Zone & Fee
                    </label>
                    <select
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] focus:border-[#B85231] focus:outline-none"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.label} —{' '}
                          {zone.feeUgx === 0 ? 'Free' : formatUgx(zone.feeUgx)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#5C544B] mt-1">
                      {selectedZone.areaHint} · Est. {selectedZone.etaMinutes} mins
                    </p>
                  </div>

                  {zoneId !== 'pickup' && (
                    <div>
                      <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                        Street / Plot / Landmark Address
                      </label>
                      <DeliveryAddressField
                        value={deliveryAddress}
                        onChange={setDeliveryAddress}
                        hasApiKey={hasMapsKey}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                      Contact Phone Number (Uganda)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+256 772 000 000"
                      required
                      className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                      Rider Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Gate color, office floor, or call upon arrival"
                      className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-[#5C544B]">
                  Payment Method
                </h3>
                <div className="rounded-xl border border-[#E4DBCD] bg-white p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-2.5">
                    {PAYMENT_METHODS.map((method) => {
                      const active = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                            active
                              ? 'border-[#B85231] bg-[#B85231]/5'
                              : 'border-[#E4DBCD] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#1F1C18]">
                              {method.label}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                active
                                  ? 'border-[#B85231] bg-[#B85231]'
                                  : 'border-[#5C544B]/40'
                              }`}
                            >
                              {active && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C544B] mt-0.5">
                            {method.subtitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPayment?.requiresPhone && (
                    <div className="pt-2">
                      <label className="block text-xs font-medium text-[#1F1C18] mb-1.5">
                        {selectedPayment.label} Phone Number
                      </label>
                      <input
                        type="tel"
                        value={providerPhone}
                        onChange={(e) => setProviderPhone(e.target.value)}
                        placeholder={selectedPayment.prefixHint}
                        required
                        className="w-full rounded-lg border border-[#E4DBCD] bg-white px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#5C544B]/60 focus:border-[#B85231] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-[#B85231]/40 bg-[#B85231]/10 px-4 py-3 text-xs text-[#7D3017]">
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {!receipt && items.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-[#E4DBCD] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C544B]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {formatUgx(subtotalUgx)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C544B]">
                <span>Delivery ({selectedZone.label})</span>
                <span className="font-mono tabular-nums">
                  {deliveryFeeUgx === 0 ? 'Free' : formatUgx(deliveryFeeUgx)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-[#1F1C18] pt-1.5 border-t border-[#E4DBCD]">
                <span>Total</span>
                <span className="font-mono tabular-nums">
                  {formatUgx(totalUgx)}
                </span>
              </div>
            </div>

            {!user && (
              <p className="text-xs text-[#5C544B]">
                You will be prompted to sign in with Google when placing your order.
              </p>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-lg bg-[#B85231] text-white text-sm font-semibold hover:bg-[#9A4123] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? 'Confirming Order…'
                : user
                  ? `Confirm Order · ${formatUgx(totalUgx)}`
                  : `Sign in & Place Order · ${formatUgx(totalUgx)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
