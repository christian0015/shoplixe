// models/User.ts
import mongoose, { Schema, models, model } from 'mongoose';

const HistoryEntrySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: null }, // WhatsApp uniquement, jamais pour l'auth
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    hasShop: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },

    favorites: {
      shops: { type: [Schema.Types.ObjectId], ref: 'Shop', default: [] },
      products: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
    },

    history: { type: [HistoryEntrySchema], default: [] },
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema);
