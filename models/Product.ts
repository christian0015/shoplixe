// models/Product.ts
import { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    promoPrice: { type: Number, default: null },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    tags: { type: [String], default: [] },
    available: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    // Avis (dénormalisé) — un produit n'est jugé que sur sa qualité, jamais mélangé
    // avec la note "service" de la boutique.
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ shop: 1, slug: 1 }, { unique: true });
ProductSchema.index({ shop: 1, available: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default models.Product || model('Product', ProductSchema);
