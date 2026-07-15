// models/Shop.ts
import { Schema, models, model } from 'mongoose';

const PointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  { _id: false }
);

const ShopSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, unique: true, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    logo: { type: String, default: null },
    cover: { type: String, default: null },

    category: {
      type: String,
      enum: ['fashion', 'tech', 'food', 'beauty', 'home', 'crafts', 'services', 'other'],
      required: true,
    },

    theme: {
      type: String,
      enum: ['minimal', 'luxury', 'beauty', 'tech', 'food', 'fashion'],
      default: 'minimal',
    },
    template: { type: String, enum: ['bento', 'grid', 'magazine', 'liquidGlass', 'flux3d'], default: 'grid' },
    accentColor: { type: String, default: null },

    whatsappNumber: { type: String, required: true },
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },

    city: { type: String, default: null },
    district: { type: String, default: null },
    location: { type: PointSchema, default: () => ({ type: 'Point', coordinates: [0, 0] }) },

    isVerified: { type: Boolean, default: false },

    // Avis (dénormalisé, recalculé par lib/review-actions.ts).
    // `rating` = moyenne des 3 critères ci-dessous (note "service" globale de la boutique).
    // Un mauvais produit dans le catalogue n'affecte jamais ces chiffres.
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    serviceRating: { type: Number, default: 0 },
    communicationRating: { type: Number, default: 0 },
    reliabilityRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ShopSchema.index({ owner: 1 });
ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ category: 1 });
ShopSchema.index({ name: 'text', description: 'text' });

export default models.Shop || model('Shop', ShopSchema);
