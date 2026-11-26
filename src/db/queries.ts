import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import {
  DELIVERY_ZONES,
  type PaymentMethod,
} from '../lib/constants.ts';
import { db } from './index.ts';
import {
  category,
  deliveries,
  deliveryMan,
  orderItems,
  orders,
  payment,
  product,
  reviews,
  shop,
  users,
} from './schema.ts';
import { ensureSeeded } from './seed.ts';

export async function getHomeData() {
  try {
    await ensureSeeded();
    const [categories, featuredShops, trendingProducts] = await Promise.all([
      db.select().from(category).orderBy(category.id),
      db
        .select({
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          tagline: shop.tagline,
          unitLocation: shop.unitLocation,
          phone: shop.phone,
          email: shop.email,
          openingHours: shop.openingHours,
          imageUrl: shop.imageUrl,
          isFeatured: shop.isFeatured,
          categoryName: category.name,
          categorySlug: category.slug,
        })
        .from(shop)
        .innerJoin(category, eq(shop.categoryId, category.id))
        .where(eq(shop.isFeatured, true))
        .orderBy(shop.id),
      db
        .select({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceUgx: product.priceUgx,
          stockQty: product.stockQty,
          unitLabel: product.unitLabel,
          imageUrl: product.imageUrl,
          isTrending: product.isTrending,
          shopId: shop.id,
          shopName: shop.name,
          shopSlug: shop.slug,
          categoryName: category.name,
          categorySlug: category.slug,
        })
        .from(product)
        .innerJoin(shop, eq(product.shopId, shop.id))
        .innerJoin(category, eq(product.categoryId, category.id))
        .where(eq(product.isTrending, true))
        .orderBy(product.id),
    ]);

    return {
      categories,
      featuredShops,
      trendingProducts,
      deliveryZones: DELIVERY_ZONES,
    };
  } catch (error) {
    console.error('Failed to load home data:', error);
    throw new Error('Unable to load Naboa Shopping Centre directory.', {
      cause: error,
    });
  }
}

export async function getAllCategories() {
  try {
    await ensureSeeded();
    return await db.select().from(category).orderBy(category.id);
  } catch (error) {
    console.error('Failed to load categories:', error);
    throw new Error('Unable to load shop categories.', { cause: error });
  }
}

export async function getShopsList(filters?: { categorySlug?: string; q?: string }) {
  try {
    await ensureSeeded();
    const conditions = [];

    if (filters?.categorySlug && filters.categorySlug !== 'all') {
      conditions.push(eq(category.slug, filters.categorySlug));
    }

    if (filters?.q && filters.q.trim().length > 0) {
      const term = `%${filters.q.trim()}%`;
      conditions.push(
        or(
          ilike(shop.name, term),
          ilike(shop.tagline, term),
          ilike(shop.unitLocation, term)
        )
      );
    }

    const baseQuery = db
      .select({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        tagline: shop.tagline,
        description: shop.description,
        unitLocation: shop.unitLocation,
        phone: shop.phone,
        email: shop.email,
        openingHours: shop.openingHours,
        imageUrl: shop.imageUrl,
        isFeatured: shop.isFeatured,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(shop)
      .innerJoin(category, eq(shop.categoryId, category.id));

    const rows =
      conditions.length > 0
        ? await baseQuery.where(and(...conditions)).orderBy(shop.id)
        : await baseQuery.orderBy(shop.id);

    return rows;
  } catch (error) {
    console.error('Failed to load shops:', error);
    throw new Error('Unable to load shop directory.', { cause: error });
  }
}

export async function getShopBySlug(slug: string) {
  try {
    await ensureSeeded();
    const shopRows = await db
      .select({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        tagline: shop.tagline,
        description: shop.description,
        unitLocation: shop.unitLocation,
        phone: shop.phone,
        email: shop.email,
        openingHours: shop.openingHours,
        imageUrl: shop.imageUrl,
        isFeatured: shop.isFeatured,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(shop)
      .innerJoin(category, eq(shop.categoryId, category.id))
      .where(eq(shop.slug, slug))
      .limit(1);

    const foundShop = shopRows[0];
    if (!foundShop) return null;

    const shopProducts = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceUgx: product.priceUgx,
        stockQty: product.stockQty,
        unitLabel: product.unitLabel,
        imageUrl: product.imageUrl,
        isTrending: product.isTrending,
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(product)
      .innerJoin(shop, eq(product.shopId, shop.id))
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.shopId, foundShop.id))
      .orderBy(product.id);

    return {
      shop: foundShop,
      products: shopProducts,
    };
  } catch (error) {
    console.error('Failed to load shop details:', error);
    throw new Error('Unable to load shop profile.', { cause: error });
  }
}

export async function getProductsList(filters?: {
  categorySlug?: string;
  shopSlug?: string;
  q?: string;
  sort?: string;
}) {
  try {
    await ensureSeeded();
    const conditions = [];

    if (filters?.categorySlug && filters.categorySlug !== 'all') {
      conditions.push(eq(category.slug, filters.categorySlug));
    }

    if (filters?.shopSlug && filters.shopSlug !== 'all') {
      conditions.push(eq(shop.slug, filters.shopSlug));
    }

    if (filters?.q && filters.q.trim().length > 0) {
      const term = `%${filters.q.trim()}%`;
      conditions.push(
        or(
          ilike(product.name, term),
          ilike(product.description, term),
          ilike(shop.name, term)
        )
      );
    }

    const baseQuery = db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceUgx: product.priceUgx,
        stockQty: product.stockQty,
        unitLabel: product.unitLabel,
        imageUrl: product.imageUrl,
        isTrending: product.isTrending,
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(product)
      .innerJoin(shop, eq(product.shopId, shop.id))
      .innerJoin(category, eq(product.categoryId, category.id));

    const filteredQuery =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    if (filters?.sort === 'price_asc') {
      return await filteredQuery.orderBy(product.priceUgx, product.id);
    }
    if (filters?.sort === 'price_desc') {
      return await filteredQuery.orderBy(desc(product.priceUgx), product.id);
    }
    return await filteredQuery.orderBy(desc(product.isTrending), product.id);
  } catch (error) {
    console.error('Failed to load products:', error);
    throw new Error('Unable to load product catalogue.', { cause: error });
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await ensureSeeded();
    const productRows = await db
      .select({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceUgx: product.priceUgx,
        stockQty: product.stockQty,
        unitLabel: product.unitLabel,
        imageUrl: product.imageUrl,
        isTrending: product.isTrending,
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        shopLocation: shop.unitLocation,
        shopPhone: shop.phone,
        shopEmail: shop.email,
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      })
      .from(product)
      .innerJoin(shop, eq(product.shopId, shop.id))
      .innerJoin(category, eq(product.categoryId, category.id))
      .where(eq(product.slug, slug))
      .limit(1);

    const found = productRows[0];
    if (!found) return null;

    const productReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewerName: users.fullName,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, found.id))
      .orderBy(desc(reviews.createdAt));

    const totalReviews = productReviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              productReviews.reduce((acc, r) => acc + r.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    return {
      product: found,
      reviews: productReviews,
      ratingSummary: {
        average: avgRating,
        count: totalReviews,
      },
    };
  } catch (error) {
    console.error('Failed to load product detail:', error);
    throw new Error('Unable to load product details.', { cause: error });
  }
}

export async function createProductReview(params: {
  productId: number;
  userId: number;
  rating: number;
  title: string;
  comment: string;
}) {
  try {
    const existingProduct = await db
      .select({ id: product.id })
      .from(product)
      .where(eq(product.id, params.productId))
      .limit(1);

    if (!existingProduct[0]) {
      return { notFound: true as const };
    }

    const inserted = await db
      .insert(reviews)
      .values({
        productId: params.productId,
        userId: params.userId,
        rating: params.rating,
        title: params.title,
        comment: params.comment,
      })
      .returning();

    const author = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1);

    return {
      notFound: false as const,
      review: {
        id: inserted[0].id,
        rating: inserted[0].rating,
        title: inserted[0].title,
        comment: inserted[0].comment,
        createdAt: inserted[0].createdAt,
        reviewerName: author[0]?.fullName || 'Verified Shopper',
      },
    };
  } catch (error) {
    console.error('Failed to create review:', error);
    throw new Error('Unable to submit review at this time.', { cause: error });
  }
}

export interface CheckoutItemInput {
  productId: number;
  quantity: number;
}

export async function placeOrderTransaction(params: {
  userId: number;
  items: CheckoutItemInput[];
  deliveryZoneId: string;
  deliveryAddress: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  providerPhone?: string;
  notes?: string;
}) {
  try {
    await ensureSeeded();

    const zone = DELIVERY_ZONES.find((z) => z.id === params.deliveryZoneId);
    if (!zone) {
      throw new Error('INVALID_ZONE');
    }

    return await db.transaction(async (tx) => {
      const productIds = params.items.map((i) => i.productId);
      const dbProducts = await tx
        .select()
        .from(product)
        .where(inArray(product.id, productIds));

      const productMap: Record<number, (typeof dbProducts)[number]> = {};
      for (const p of dbProducts) {
        productMap[p.id] = p;
      }

      let subtotalUgx = 0;
      const linePayloads: {
        productId: number;
        shopId: number;
        quantity: number;
        unitPriceUgx: number;
        lineTotalUgx: number;
        productName: string;
      }[] = [];

      for (const item of params.items) {
        const found = productMap[item.productId];
        if (!found) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }
        if (found.stockQty < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${found.name}`);
        }

        const updatedRows = await tx
          .update(product)
          .set({
            stockQty: sql`${product.stockQty} - ${item.quantity}`,
          })
          .where(
            and(
              eq(product.id, found.id),
              sql`${product.stockQty} >= ${item.quantity}`
            )
          )
          .returning();

        if (!updatedRows[0]) {
          throw new Error(`INSUFFICIENT_STOCK:${found.name}`);
        }

        const lineTotalUgx = found.priceUgx * item.quantity;
        subtotalUgx += lineTotalUgx;

        linePayloads.push({
          productId: found.id,
          shopId: found.shopId,
          quantity: item.quantity,
          unitPriceUgx: found.priceUgx,
          lineTotalUgx,
          productName: found.name,
        });
      }

      const deliveryFeeUgx = zone.feeUgx;
      const totalUgx = subtotalUgx + deliveryFeeUgx;
      const orderNumber = `NSC-${Date.now().toString().slice(-6)}-${Math.floor(
        10 + Math.random() * 89
      )}`;

      const createdOrderRows = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: params.userId,
          status:
            params.deliveryZoneId === 'pickup'
              ? 'ready_for_pickup'
              : 'confirmed',
          subtotalUgx,
          deliveryFeeUgx,
          totalUgx,
          deliveryAddress: params.deliveryAddress,
          deliveryZone: zone.label,
          customerPhone: params.customerPhone,
          notes: params.notes || null,
        })
        .returning();

      const createdOrder = createdOrderRows[0];

      await tx.insert(orderItems).values(
        linePayloads.map((lp) => ({
          orderId: createdOrder.id,
          productId: lp.productId,
          shopId: lp.shopId,
          quantity: lp.quantity,
          unitPriceUgx: lp.unitPriceUgx,
          lineTotalUgx: lp.lineTotalUgx,
        }))
      );

      const refPrefix =
        params.paymentMethod === 'mtn_momo'
          ? 'MTN'
          : params.paymentMethod === 'airtel_money'
            ? 'AIR'
            : 'COD';
      const transactionRef = `${refPrefix}-${createdOrder.id}-${Math.floor(
        100000 + Math.random() * 899999
      )}`;
      const isInstantMobileMoney =
        params.paymentMethod === 'mtn_momo' ||
        params.paymentMethod === 'airtel_money';

      const createdPaymentRows = await tx
        .insert(payment)
        .values({
          orderId: createdOrder.id,
          method: params.paymentMethod,
          providerPhone: isInstantMobileMoney
            ? params.providerPhone || params.customerPhone
            : null,
          amountUgx: totalUgx,
          status: isInstantMobileMoney ? 'paid' : 'cod_due',
          transactionRef,
          paidAt: isInstantMobileMoney ? new Date() : null,
        })
        .returning();

      const activeCouriers = await tx
        .select()
        .from(deliveryMan)
        .where(eq(deliveryMan.isActive, true))
        .orderBy(deliveryMan.id);

      const matchedCourier =
        activeCouriers.find((c) => c.zone === params.deliveryZoneId) ||
        activeCouriers[0];

      if (!matchedCourier) {
        throw new Error('NO_COURIER_AVAILABLE');
      }

      const createdDeliveryRows = await tx
        .insert(deliveries)
        .values({
          orderId: createdOrder.id,
          deliveryManId: matchedCourier.id,
          deliveryAddress: params.deliveryAddress,
          deliveryFeeUgx,
          status:
            params.deliveryZoneId === 'pickup' ? 'ready_at_desk' : 'assigned',
          estimatedMinutes: zone.etaMinutes,
        })
        .returning();

      await tx
        .update(users)
        .set({
          phone: params.customerPhone,
          defaultAddress: params.deliveryAddress,
        })
        .where(eq(users.id, params.userId));

      return {
        order: createdOrder,
        items: linePayloads,
        payment: createdPaymentRows[0],
        delivery: {
          ...createdDeliveryRows[0],
          courier: matchedCourier,
        },
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'INVALID_ZONE' ||
        error.message.startsWith('PRODUCT_NOT_FOUND:') ||
        error.message.startsWith('INSUFFICIENT_STOCK:') ||
        error.message === 'NO_COURIER_AVAILABLE'
      ) {
        throw error;
      }
    }
    console.error('Order transaction failed:', error);
    throw new Error('Unable to process your order right now.', { cause: error });
  }
}

export async function getUserOrders(userId: number) {
  try {
    await ensureSeeded();
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return [];
    }

    const orderIds = userOrders.map((o) => o.id);

    const [itemsRows, paymentRows, deliveryRows] = await Promise.all([
      db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.imageUrl,
          shopName: shop.name,
          shopSlug: shop.slug,
          quantity: orderItems.quantity,
          unitPriceUgx: orderItems.unitPriceUgx,
          lineTotalUgx: orderItems.lineTotalUgx,
        })
        .from(orderItems)
        .innerJoin(product, eq(orderItems.productId, product.id))
        .innerJoin(shop, eq(orderItems.shopId, shop.id))
        .where(inArray(orderItems.orderId, orderIds)),
      db.select().from(payment).where(inArray(payment.orderId, orderIds)),
      db
        .select({
          id: deliveries.id,
          orderId: deliveries.orderId,
          deliveryAddress: deliveries.deliveryAddress,
          deliveryFeeUgx: deliveries.deliveryFeeUgx,
          status: deliveries.status,
          estimatedMinutes: deliveries.estimatedMinutes,
          dispatchedAt: deliveries.dispatchedAt,
          courierName: deliveryMan.fullName,
          courierPhone: deliveryMan.phone,
          courierVehicle: deliveryMan.vehicleType,
          courierPlate: deliveryMan.plateNumber,
        })
        .from(deliveries)
        .innerJoin(deliveryMan, eq(deliveries.deliveryManId, deliveryMan.id))
        .where(inArray(deliveries.orderId, orderIds)),
    ]);

    return userOrders.map((ord) => ({
      ...ord,
      items: itemsRows.filter((item) => item.orderId === ord.id),
      payment: paymentRows.find((p) => p.orderId === ord.id) ?? null,
      delivery: deliveryRows.find((d) => d.orderId === ord.id) ?? null,
    }));
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    throw new Error('Unable to load your order history.', { cause: error });
  }
}
