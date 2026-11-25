import type { AppRoute } from './Header';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#E4DBCD] bg-[#F3ECE1]/60 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-display text-lg font-semibold text-[#1F1C18]">
            Naboa Shopping Centre
          </p>
          <p className="text-xs text-[#5C544B]">
            Plot 18–24 Naboa Road, Mbale City, Uganda · Payments via MTN MoMo, Airtel Money & Cash on Delivery
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#5C544B]"
        >
          <button
            type="button"
            onClick={() => onNavigate({ page: 'home' })}
            className="hover:text-[#1F1C18] cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'shops' })}
            className="hover:text-[#1F1C18] cursor-pointer"
          >
            Shop Directory
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'products' })}
            className="hover:text-[#1F1C18] cursor-pointer"
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'orders' })}
            className="hover:text-[#1F1C18] cursor-pointer"
          >
            Orders
          </button>
        </nav>
      </div>
    </footer>
  );
}
