import type { DeliveryZoneOption, PaymentMethod } from './lib/constants';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface Shop {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  unitLocation: string;
  phone: string;
  email: string;
  openingHours: string;
  imageUrl: string;
  isFeatured: boolean;
  categoryId?: number;
  categoryName: string;
  categorySlug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceUgx: number;
  stockQty: number;
  unitLabel: string;
  imageUrl: string;
  isTrending: boolean;
  shopId: number;
  shopName: string;
  shopSlug: string;
  categoryName: string;
  categorySlug: string;
}

export interface ProductDetail extends Product {
  shopLocation: string;
  shopPhone: string;
  shopEmail: string;
  categoryId: number;
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  reviewerName: string;
}

export interface HomeData {
  categories: Category[];
  featuredShops: Shop[];
  trendingProducts: Product[];
  deliveryZones: DeliveryZoneOption[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderReceipt {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    subtotalUgx: number;
    deliveryFeeUgx: number;
    totalUgx: number;
    deliveryAddress: string;
    deliveryZone: string;
    customerPhone: string;
    createdAt: string;
  };
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPriceUgx: number;
    lineTotalUgx: number;
  }[];
  payment: {
    id: number;
    method: PaymentMethod;
    providerPhone: string | null;
    amountUgx: number;
    status: string;
    transactionRef: string;
  };
  delivery: {
    id: number;
    deliveryAddress: string;
    deliveryFeeUgx: number;
    status: string;
    estimatedMinutes: number;
    courier: {
      id: number;
      fullName: string;
      phone: string;
      vehicleType: string;
      plateNumber: string;
    };
  };
}

export interface UserOrder {
  id: number;
  orderNumber: string;
  status: string;
  subtotalUgx: number;
  deliveryFeeUgx: number;
  totalUgx: number;
  deliveryAddress: string;
  deliveryZone: string;
  customerPhone: string;
  notes: string | null;
  createdAt: string;
  items: {
    id: number;
    productId: number;
    productName: string;
    productSlug: string;
    productImage: string;
    shopName: string;
    shopSlug: string;
    quantity: number;
    unitPriceUgx: number;
    lineTotalUgx: number;
  }[];
  payment: {
    method: PaymentMethod;
    providerPhone: string | null;
    amountUgx: number;
    status: string;
    transactionRef: string;
  } | null;
  delivery: {
    deliveryAddress: string;
    deliveryFeeUgx: number;
    status: string;
    estimatedMinutes: number;
    courierName: string;
    courierPhone: string;
    courierVehicle: string;
    courierPlate: string;
  } | null;
}
