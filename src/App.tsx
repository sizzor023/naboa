import { useCallback, useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { fetchHome } from './lib/api';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import type { HomeData } from './types';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header, type AppRoute } from './components/Header';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShopDetailPage } from './pages/ShopDetailPage';
import { ShopsPage } from './pages/ShopsPage';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function parseUrlRoute(): AppRoute {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (path === '/shops') return { page: 'shops' };
  if (path.startsWith('/shops/')) {
    const slug = decodeURIComponent(path.replace('/shops/', '').split('/')[0]);
    if (slug) return { page: 'shop', slug };
  }
  if (path === '/products') {
    return {
      page: 'products',
      category: params.get('category') || undefined,
      shop: params.get('shop') || undefined,
    };
  }
  if (path.startsWith('/products/')) {
    const slug = decodeURIComponent(
      path.replace('/products/', '').split('/')[0]
    );
    if (slug) return { page: 'product', slug };
  }
  if (path === '/orders') return { page: 'orders' };
  return { page: 'home' };
}

function buildRouteUrl(route: AppRoute): string {
  switch (route.page) {
    case 'home':
      return '/';
    case 'shops':
      return '/shops';
    case 'shop':
      return `/shops/${encodeURIComponent(route.slug)}`;
    case 'products': {
      const qs = new URLSearchParams();
      if (route.category && route.category !== 'all') {
        qs.set('category', route.category);
      }
      if (route.shop && route.shop !== 'all') {
        qs.set('shop', route.shop);
      }
      const str = qs.toString();
      return `/products${str ? `?${str}` : ''}`;
    }
    case 'product':
      return `/products/${encodeURIComponent(route.slug)}`;
    case 'orders':
      return '/orders';
  }
}

function MarketplaceShell({ hasMapsKey }: { hasMapsKey: boolean }) {
  const [route, setRoute] = useState<AppRoute>(() => parseUrlRoute());
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [ordersRefreshSignal, setOrdersRefreshSignal] = useState(0);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const loadHome = useCallback(async () => {
    setHomeLoading(true);
    setHomeError(null);
    try {
      const data = await fetchHome();
      setHomeData(data);
    } catch (err: unknown) {
      setHomeError(
        err instanceof Error ? err.message : 'Unable to load directory.'
      );
    } finally {
      setHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  useEffect(() => {
    const handlePopState = () => setRoute(parseUrlRoute());
    const handleQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    const url = buildRouteUrl(nextRoute);
    window.history.pushState(null, '', url);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleOrderCompleted = useCallback(() => {
    setOrdersRefreshSignal((prev) => prev + 1);
    loadHome();
  }, [loadHome]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1C18]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header route={route} onNavigate={navigate} />

      <main className="flex-1">
        {route.page === 'home' && (
          <HomePage
            data={homeData}
            loading={homeLoading}
            error={homeError}
            onRetry={loadHome}
            onNavigate={navigate}
            hasMapsKey={hasMapsKey}
          />
        )}
        {route.page === 'shops' && <ShopsPage onNavigate={navigate} />}
        {route.page === 'shop' && (
          <ShopDetailPage slug={route.slug} onNavigate={navigate} />
        )}
        {route.page === 'products' && (
          <ProductsPage
            initialCategory={route.category}
            initialShop={route.shop}
            onNavigate={navigate}
          />
        )}
        {route.page === 'product' && (
          <ProductDetailPage slug={route.slug} onNavigate={navigate} />
        )}
        {route.page === 'orders' && (
          <OrdersPage
            refreshSignal={ordersRefreshSignal}
            onNavigate={navigate}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer
        hasMapsKey={hasMapsKey}
        onNavigate={navigate}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}

export default function App() {
  const hasMapsKey = Boolean(MAPS_API_KEY);

  return (
    <AuthProvider>
      <CartProvider>
        {hasMapsKey ? (
          <APIProvider
            apiKey={MAPS_API_KEY}
            libraries={['places', 'marker']}
            language="en"
            region="UG"
          >
            <MarketplaceShell hasMapsKey={true} />
          </APIProvider>
        ) : (
          <MarketplaceShell hasMapsKey={false} />
        )}
      </CartProvider>
    </AuthProvider>
  );
}
