import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  defaultAddress: text('default_address'),
  role: text('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Category
export const category = pgTable('category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Shop
export const shop = pgTable('shop', {
  id: serial('id').primaryKey(),
  ownerUserId: integer('owner_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  categoryId: integer('category_id')
    .references(() => category.id, { onDelete: 'restrict' })
    .notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  unitLocation: text('unit_location').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  openingHours: text('opening_hours').notNull(),
  imageUrl: text('image_url').notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Product
export const product = pgTable(
  'product',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id')
      .references(() => shop.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: integer('category_id')
      .references(() => category.id, { onDelete: 'restrict' })
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    priceUgx: integer('price_ugx').notNull(),
    stockQty: integer('stock_qty').notNull().default(0),
    unitLabel: text('unit_label').notNull().default('1 unit'),
    imageUrl: text('image_url').notNull(),
    isTrending: boolean('is_trending').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check('product_price_positive', sql`${table.priceUgx} > 0`),
    check('product_stock_non_negative', sql`${table.stockQty} >= 0`),
  ]
);

// 5. Order (table named 'orders' to avoid SQL reserved keyword 'order')
export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    status: text('status').notNull().default('confirmed'),
    subtotalUgx: integer('subtotal_ugx').notNull(),
    deliveryFeeUgx: integer('delivery_fee_ugx').notNull(),
    totalUgx: integer('total_ugx').notNull(),
    deliveryAddress: text('delivery_address').notNull(),
    deliveryZone: text('delivery_zone').notNull(),
    customerPhone: text('customer_phone').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check('orders_subtotal_non_negative', sql`${table.subtotalUgx} >= 0`),
    check('orders_delivery_fee_non_negative', sql`${table.deliveryFeeUgx} >= 0`),
    check('orders_total_positive', sql`${table.totalUgx} > 0`),
  ]
);

// 6. Order Items
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    productId: integer('product_id')
      .references(() => product.id, { onDelete: 'restrict' })
      .notNull(),
    shopId: integer('shop_id')
      .references(() => shop.id, { onDelete: 'restrict' })
      .notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceUgx: integer('unit_price_ugx').notNull(),
    lineTotalUgx: integer('line_total_ugx').notNull(),
  },
  (table) => [
    check('order_items_qty_positive', sql`${table.quantity} > 0`),
    check('order_items_unit_price_positive', sql`${table.unitPriceUgx} > 0`),
    check('order_items_line_total_positive', sql`${table.lineTotalUgx} > 0`),
  ]
);

// 7. Payment
export const payment = pgTable(
  'payment',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    method: text('method').notNull(),
    providerPhone: text('provider_phone'),
    amountUgx: integer('amount_ugx').notNull(),
    status: text('status').notNull().default('pending'),
    transactionRef: text('transaction_ref').notNull().unique(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check('payment_amount_positive', sql`${table.amountUgx} > 0`),
  ]
);

// 8. Delivery Man
export const deliveryMan = pgTable('delivery_man', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull().unique(),
  vehicleType: text('vehicle_type').notNull(),
  plateNumber: text('plate_number').notNull().unique(),
  zone: text('zone').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

// 9. Deliveries
export const deliveries = pgTable(
  'deliveries',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    deliveryManId: integer('delivery_man_id')
      .references(() => deliveryMan.id, { onDelete: 'restrict' })
      .notNull(),
    deliveryAddress: text('delivery_address').notNull(),
    deliveryFeeUgx: integer('delivery_fee_ugx').notNull(),
    status: text('status').notNull().default('assigned'),
    estimatedMinutes: integer('estimated_minutes').notNull().default(35),
    dispatchedAt: timestamp('dispatched_at').defaultNow().notNull(),
    deliveredAt: timestamp('delivered_at'),
  },
  (table) => [
    check('deliveries_fee_non_negative', sql`${table.deliveryFeeUgx} >= 0`),
  ]
);

// 10. Reviews
export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .references(() => product.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    rating: integer('rating').notNull(),
    title: text('title').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check('reviews_rating_range', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shops: many(shop),
  orders: many(orders),
  reviews: many(reviews),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  shops: many(shop),
  products: many(product),
}));

export const shopRelations = relations(shop, ({ one, many }) => ({
  owner: one(users, {
    fields: [shop.ownerUserId],
    references: [users.id],
  }),
  category: one(category, {
    fields: [shop.categoryId],
    references: [category.id],
  }),
  products: many(product),
  orderItems: many(orderItems),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  shop: one(shop, {
    fields: [product.shopId],
    references: [shop.id],
  }),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payment: one(payment, {
    fields: [orders.id],
    references: [payment.orderId],
  }),
  delivery: one(deliveries, {
    fields: [orders.id],
    references: [deliveries.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(product, {
    fields: [orderItems.productId],
    references: [product.id],
  }),
  shop: one(shop, {
    fields: [orderItems.shopId],
    references: [shop.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(orders, {
    fields: [payment.orderId],
    references: [orders.id],
  }),
}));

export const deliveryManRelations = relations(deliveryMan, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  deliveryMan: one(deliveryMan, {
    fields: [deliveries.deliveryManId],
    references: [deliveryMan.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(product, {
    fields: [reviews.productId],
    references: [product.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));
