import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export type AppRoute =
  | { page: 'home' }
  | { page: 'shops' }
  | { page: 'shop'; slug: string }
  | { page: 'products'; category?: string; shop?: string }
  | { page: 'product'; slug: string }
  | { page: 'orders' };

interface HeaderProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export function Header({ route, onNavigate }: HeaderProps) {
  const { itemCount, setDrawerOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; active: boolean; target: AppRoute }[] = [
    { label: 'Home', active: route.page === 'home', target: { page: 'home' } },
    {
      label: 'Shops',
      active: route.page === 'shops' || route.page === 'shop',
      target: { page: 'shops' },
    },
    {
      label: 'Products',
      active: route.page === 'products' || route.page === 'product',
      target: { page: 'products' },
    },
    {
      label: 'Orders',
      active: route.page === 'orders',
      target: { page: 'orders' },
    },
  ];

  const handleNav = (target: AppRoute) => {
    setMobileOpen(false);
    onNavigate(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E4DBCD]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav({ page: 'home' })}
          className="font-display text-xl font-bold tracking-tight text-[#1F1C18] hover:text-[#B85231] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Naboa Shopping Centre
        </button>

        {/* Zone 2: 4 clean single-line text links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C544B]"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNav(item.target)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                item.active
                  ? 'border-[#B85231] text-[#1F1C18] font-semibold'
                  : 'border-transparent hover:text-[#1F1C18] hover:border-[#E4DBCD]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#265943] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums">Cart ({itemCount})</span>
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg border border-[#E4DBCD] text-[#1F1C18] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E4DBCD] bg-[#FAF7F2] px-4 py-3 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNav(item.target)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                item.active
                  ? 'bg-[#F3ECE1] text-[#B85231] font-semibold'
                  : 'text-[#1F1C18] hover:bg-[#F3ECE1]/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
