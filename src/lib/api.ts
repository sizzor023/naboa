import type { PaymentMethod } from './constants';
import type {
  Category,
  HomeData,
  OrderReceipt,
  Product,
  ProductDetail,
  Review,
  Shop,
  UserOrder,
} from '../types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === 'string'
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function fetchHome(): Promise<HomeData> {
  const res = await fetch('/api/home');
  return parseJson<HomeData>(res);
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const data = await parseJson<{ categories: Category[] }>(res);
  return data.categories;
}

export async function fetchShops(params?: {
  category?: string;
  q?: string;
}): Promise<Shop[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params?.q) {
    query.set('q', params.q);
  }
  const qs = query.toString();
  const res = await fetch(`/api/shops${qs ? `?${qs}` : ''}`);
  const data = await parseJson<{ shops: Shop[] }>(res);
  return data.shops;
}

export async function fetchShopDetail(slug: string): Promise<{
  shop: Shop;
  products: Product[];
}> {
  const res = await fetch(`/api/shops/${encodeURIComponent(slug)}`);
  return parseJson<{ shop: Shop; products: Product[] }>(res);
}

export async function fetchProducts(params?: {
  category?: string;
  shop?: string;
  q?: string;
  sort?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params?.shop && params.shop !== 'all') {
    query.set('shop', params.shop);
  }
  if (params?.q) {
    query.set('q', params.q);
  }
  if (params?.sort) {
    query.set('sort', params.sort);
  }
  const qs = query.toString();
  const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`);
  const data = await parseJson<{ products: Product[] }>(res);
  return data.products;
}

export async function fetchProductDetail(slug: string): Promise<{
  product: ProductDetail;
  reviews: Review[];
  ratingSummary: { average: number; count: number };
}> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
  return parseJson(res);
}

export async function submitProductReview(
  productId: number,
  token: string,
  payload: { rating: number; title: string; comment: string }
): Promise<Review> {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ review: Review }>(res);
  return data.review;
}

export async function placeOrder(
  token: string,
  payload: {
    items: { productId: number; quantity: number }[];
    deliveryZoneId: string;
    deliveryAddress: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
    providerPhone?: string;
    notes?: string;
  }
): Promise<OrderReceipt> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseJson<OrderReceipt>(res);
}

export async function fetchMyOrders(token: string): Promise<UserOrder[]> {
  const res = await fetch('/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await parseJson<{ orders: UserOrder[] }>(res);
  return data.orders;
}
