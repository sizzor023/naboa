import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  createProductReview,
  getAllCategories,
  getHomeData,
  getProductBySlug,
  getProductsList,
  getShopBySlug,
  getShopsList,
  getUserOrders,
  placeOrderTransaction,
} from './src/db/queries.ts';
import type { PaymentMethod } from './src/lib/constants.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/home', async (_req, res) => {
  try {
    const data = await getHomeData();
    res.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load home data.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ categories });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load categories.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/shops', async (req, res) => {
  try {
    const categorySlug =
      typeof req.query.category === 'string' ? req.query.category : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const shops = await getShopsList({ categorySlug, q });
    res.json({ shops });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load shops.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/shops/:slug', async (req, res) => {
  try {
    const result = await getShopBySlug(req.params.slug);
    if (!result) {
      return res.status(404).json({ error: 'Shop not found.' });
    }
    res.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load shop.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const categorySlug =
      typeof req.query.category === 'string' ? req.query.category : undefined;
    const shopSlug =
      typeof req.query.shop === 'string' ? req.query.shop : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
    const products = await getProductsList({
      categorySlug,
      shopSlug,
      q,
      sort,
    });
    res.json({ products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load products.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const detail = await getProductBySlug(req.params.slug);
    if (!detail) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(detail);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load product.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/products/:id/reviews', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product identifier.' });
    }

    const rating = Number(req.body?.rating);
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const comment =
      typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    if (title.length < 2 || title.length > 100) {
      return res
        .status(400)
        .json({ error: 'Review headline must be 2 to 100 characters.' });
    }
    if (comment.length < 5 || comment.length > 800) {
      return res
        .status(400)
        .json({ error: 'Review comment must be 5 to 800 characters.' });
    }

    const result = await createProductReview({
      productId,
      userId: req.dbUser.id,
      rating,
      title,
      comment,
    });

    if (result.notFound) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(201).json({ review: result.review });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit review.';
    res.status(500).json({ error: message });
  }
});

app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  res.json({ user: req.dbUser });
});

app.get('/api/orders', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const orders = await getUserOrders(req.dbUser.id);
    res.json({ orders });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load orders.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/orders', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (rawItems.length === 0 || rawItems.length > 40) {
      return res
        .status(400)
        .json({ error: 'Cart must contain between 1 and 40 items.' });
    }

    const items: { productId: number; quantity: number }[] = [];
    for (const item of rawItems) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 50
      ) {
        return res
          .status(400)
          .json({ error: 'Each item must have a valid product and quantity (1–50).' });
      }
      items.push({ productId, quantity });
    }

    const deliveryZoneId =
      typeof req.body?.deliveryZoneId === 'string'
        ? req.body.deliveryZoneId.trim()
        : '';
    const deliveryAddress =
      typeof req.body?.deliveryAddress === 'string'
        ? req.body.deliveryAddress.trim()
        : '';
    const customerPhone =
      typeof req.body?.customerPhone === 'string'
        ? req.body.customerPhone.trim()
        : '';
    const paymentMethod = req.body?.paymentMethod as PaymentMethod;
    const providerPhone =
      typeof req.body?.providerPhone === 'string'
        ? req.body.providerPhone.trim()
        : undefined;
    const notes =
      typeof req.body?.notes === 'string' ? req.body.notes.trim().slice(0, 300) : undefined;

    if (!deliveryZoneId) {
      return res.status(400).json({ error: 'Please select a Mbale delivery zone.' });
    }
    if (deliveryAddress.length < 4 || deliveryAddress.length > 240) {
      return res
        .status(400)
        .json({ error: 'Please enter a delivery address or landmark in Mbale.' });
    }
    if (customerPhone.length < 9 || customerPhone.length > 20) {
      return res
        .status(400)
        .json({ error: 'Please provide a valid Uganda contact phone number.' });
    }
    if (
      paymentMethod !== 'mtn_momo' &&
      paymentMethod !== 'airtel_money' &&
      paymentMethod !== 'cash_on_delivery'
    ) {
      return res.status(400).json({ error: 'Invalid payment method selected.' });
    }
    if (
      (paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') &&
      (!providerPhone || providerPhone.length < 9)
    ) {
      return res.status(400).json({
        error: 'Please enter the mobile money phone number to receive the prompt.',
      });
    }

    const receipt = await placeOrderTransaction({
      userId: req.dbUser.id,
      items,
      deliveryZoneId,
      deliveryAddress,
      customerPhone,
      paymentMethod,
      providerPhone,
      notes,
    });

    res.status(201).json(receipt);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_ZONE') {
        return res.status(400).json({ error: 'Selected delivery zone is invalid.' });
      }
      if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
        return res.status(404).json({ error: 'One of the products in your cart was not found.' });
      }
      if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
        const name = error.message.split(':')[1] || 'Item';
        return res.status(409).json({
          error: `Insufficient stock remaining for ${name}. Please adjust quantity.`,
        });
      }
    }
    const message =
      error instanceof Error ? error.message : 'Unable to place order.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Naboa Shopping Centre server running on port ${port}`);
  });
}

startServer();
