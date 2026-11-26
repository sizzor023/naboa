import { useEffect, useState } from 'react';
import { LogOut, Package, Truck, UserCheck } from 'lucide-react';
import { formatUgx } from '../lib/constants';
import { fetchMyOrders } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { UserOrder } from '../types';
import type { AppRoute } from '../components/Header';
import { ResilientImage } from '../components/ResilientImage';

interface OrdersPageProps {
  refreshSignal: number;
  onNavigate: (route: AppRoute) => void;
}

export function OrdersPage({ refreshSignal, onNavigate }: OrdersPageProps) {
  const { user, loading: authLoading, signInWithGoogle, logout, getToken, authError } =
    useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    const token = await getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyOrders(token);
      setOrders(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [user, refreshSignal]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#5C544B]">
            Naboa Shopping Centre <span aria-hidden="true">·</span> Account & Dispatch
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#1F1C18] mt-1">
            Your Orders & Deliveries
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 rounded-xl border border-[#E4DBCD] bg-white px-4 py-2.5">
            <UserCheck className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
            <div className="text-xs">
              <p className="font-semibold text-[#1F1C18]">
                {user.displayName || 'Naboa Shopper'}
              </p>
              <p className="text-[#5C544B]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#E4DBCD] text-xs font-medium text-[#5C544B] hover:text-[#1F1C18] hover:bg-[#FAF7F2] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {authLoading ? (
        <div className="h-48 rounded-xl bg-[#F3ECE1] animate-pulse" />
      ) : !user ? (
        <div className="rounded-2xl border border-[#E4DBCD] bg-white p-8 sm:p-10 text-center space-y-4">
          <Package
            className="w-10 h-10 text-[#B85231] mx-auto"
            aria-hidden="true"
          />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="font-display text-xl font-semibold text-[#1F1C18]">
              Sign in to view your Naboa orders
            </h2>
            <p className="text-sm text-[#5C544B]">
              Track MTN MoMo, Airtel Money, and Cash on Delivery receipts along with your assigned Mbale courier details.
            </p>
          </div>
          {authError && (
            <p className="text-xs text-[#B85231]">{authError}</p>
          )}
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#B85231] text-white text-sm font-semibold hover:bg-[#9A4123] transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-[#E4DBCD] bg-white p-8 text-center space-y-3">
          <p className="text-sm text-[#5C544B]">{error}</p>
          <button
            type="button"
            onClick={loadOrders}
            className="px-4 py-2 rounded-lg bg-[#B85231] text-white text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-52 rounded-xl bg-[#F3ECE1] animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#E4DBCD] bg-white p-10 text-center space-y-4">
          <p className="text-sm text-[#5C544B]">
            You have not placed any orders yet.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'products' })}
            className="px-5 py-2.5 rounded-lg bg-[#B85231] text-white text-sm font-medium hover:bg-[#9A4123] cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <article
              key={ord.id}
              className="rounded-2xl border border-[#E4DBCD] bg-white overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E4DBCD] flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-mono font-semibold text-[#1F1C18] tabular-nums">
                    {ord.orderNumber}
                  </span>
                  <span className="text-[#5C544B] text-xs tabular-nums">
                    {new Date(ord.createdAt).toLocaleString('en-UG', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-medium text-[#1B4332]">
                    Status: {ord.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#1F1C18] tabular-nums">
                    {formatUgx(ord.totalUgx)}
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-xs font-semibold text-[#5C544B]">
                    Order Items
                  </h3>
                  <div className="divide-y divide-[#E4DBCD]/70">
                    {ord.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F3ECE1] shrink-0">
                          <ResilientImage
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate({
                                page: 'product',
                                slug: item.productSlug,
                              })
                            }
                            className="text-sm font-medium text-[#1F1C18] hover:text-[#B85231] truncate block cursor-pointer"
                          >
                            {item.productName}
                          </button>
                          <p className="text-xs text-[#5C544B]">
                            {item.shopName} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-[#1F1C18] tabular-nums">
                          {formatUgx(item.lineTotalUgx)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4 text-xs border-t md:border-t-0 md:border-l border-[#E4DBCD] pt-4 md:pt-0 md:pl-6">
                  {ord.payment && (
                    <div className="space-y-1">
                      <p className="font-semibold text-[#5C544B]">Payment</p>
                      <p className="text-[#1F1C18] font-medium">
                        {ord.payment.method === 'mtn_momo'
                          ? 'MTN MoMo'
                          : ord.payment.method === 'airtel_money'
                            ? 'Airtel Money'
                            : 'Cash on Delivery'}{' '}
                        · {ord.payment.status === 'paid' ? 'Paid' : 'Pay on Delivery'}
                      </p>
                      <p className="font-mono text-[#5C544B]">
                        Ref: {ord.payment.transactionRef}
                      </p>
                    </div>
                  )}

                  {ord.delivery && (
                    <div className="space-y-1 pt-3 border-t border-[#E4DBCD]/70">
                      <p className="font-semibold text-[#5C544B] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
                        Delivery & Courier
                      </p>
                      <p className="text-[#1F1C18] font-medium">
                        {ord.delivery.courierName} ({ord.delivery.courierVehicle})
                      </p>
                      <p className="font-mono text-[#5C544B]">
                        {ord.delivery.courierPhone} · {ord.delivery.courierPlate}
                      </p>
                      <p className="text-[#5C544B]">
                        {ord.delivery.deliveryAddress}
                      </p>
                      <p className="text-[#5C544B] tabular-nums">
                        Delivery fee:{' '}
                        {ord.delivery.deliveryFeeUgx === 0
                          ? 'Free'
                          : formatUgx(ord.delivery.deliveryFeeUgx)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
