// lib/actionswappers/fyp.ts
'use server';

import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export async function fetchFypProductsAction(page = 1, limit = 8) {
  await connectDB();
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({ available: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('shop', 'slug name city logo')
      .lean(),
    Product.countDocuments({ available: true }),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    hasMore: skip + products.length < total,
    page,
  };
}