// models/Review.ts
import { Schema, models, model } from 'mongoose';

const ReviewSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['shop', 'product'], required: true },
    // Référence polymorphe : pointe vers Shop._id ou Product._id selon targetType.
    // Pas de `ref`/`refPath` ici — la résolution et le populate manuel sont gérés
    // explicitement dans lib/review-actions.ts.
    targetId: { type: Schema.Types.ObjectId, required: true },

    // Si targetType === 'shop' : notation service séparée du produit.
    serviceRating: { type: Number, min: 1, max: 5, default: null },
    communicationRating: { type: Number, min: 1, max: 5, default: null },
    reliabilityRating: { type: Number, min: 1, max: 5, default: null },

    // Si targetType === 'product' : uniquement la qualité.
    qualityRating: { type: Number, min: 1, max: 5, default: null },

    comment: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

// Un utilisateur ne peut laisser qu'un seul avis par cible (shop ou produit)
ReviewSchema.index({ author: 1, targetType: 1, targetId: 1 }, { unique: true });
ReviewSchema.index({ targetType: 1, targetId: 1 });

export default models.Review || model('Review', ReviewSchema);
