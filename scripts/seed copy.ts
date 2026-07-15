// scripts/seed.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { hashPassword } from '../lib/auth';
import User from '../models/User';
import Shop from '../models/Shop';
import Product from '../models/Product';
import Review from '../models/Review';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(uri);

  console.log('Cleaning existing seed data...');
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const passwordHash = await hashPassword('password123');

  const yasmine = await User.create({
    email: 'test@vitrine.ma',
    passwordHash,
    name: 'Yasmine Alaoui',
    phone: '212600000000',
    hasShop: true,
    newsletter: true,
  });

  const karim = await User.create({
    email: 'karim@vitrine.ma',
    passwordHash,
    name: 'Karim Bennis',
    phone: '212600000010',
    hasShop: true,
    newsletter: false,
  });

  const sara = await User.create({
    email: 'sara@vitrine.ma',
    passwordHash,
    name: 'Sara El Fassi',
    phone: '212600000020',
    hasShop: false,
    newsletter: true,
  });

  // Yasmine possède 2 boutiques, Karim 1 — pour tester le multi-boutiques par user.
  const fashionShop = await Shop.create({
    owner: yasmine._id,
    slug: 'yasmine-fashion',
    name: 'Yasmine Fashion',
    description: 'Prêt-à-porter féminin, pièces uniques importées.',
    logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200',
    cover: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    category: 'fashion',
    theme: 'luxury',
    template: 'bento',
    whatsappNumber: '212600000001',
    instagram: 'https://instagram.com/yasminefashion',
    city: 'Casablanca',
    district: 'Maarif',
    location: { type: 'Point', coordinates: [-7.6114, 33.5731] },
    isVerified: true,
  });

  const beautyShop = await Shop.create({
    owner: yasmine._id,
    slug: 'atlas-beaute',
    name: 'Atlas Beauté',
    description: 'Cosmétiques et soins naturels marocains (argan, ghassoul, rhassoul).',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
    cover: 'https://images.unsplash.com/photo-1522337094846-8a8a2b3c8b1f?w=1200',
    category: 'beauty',
    theme: 'beauty',
    template: 'grid',
    whatsappNumber: '212600000003',
    city: 'Casablanca',
    district: 'Bourgogne',
    location: { type: 'Point', coordinates: [-7.6198, 33.5891] },
    isVerified: false,
  });

  const techShop = await Shop.create({
    owner: karim._id,
    slug: 'atlas-tech',
    name: 'Atlas Tech',
    description: 'Accessoires et gadgets tech au meilleur prix.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
    category: 'tech',
    theme: 'tech',
    template: 'grid',
    whatsappNumber: '212600000002',
    city: 'Rabat',
    district: 'Agdal',
    location: { type: 'Point', coordinates: [-6.8498, 34.0209] },
    isVerified: false,
  });

  const fashionProducts = await Product.insertMany(
    [
      { name: 'Robe brodée', price: 350, promoPrice: 280 },
      { name: 'Kaftan de soirée', price: 900, promoPrice: null },
      { name: 'Sac à main cuir', price: 420, promoPrice: null },
      { name: 'Foulard soie', price: 150, promoPrice: 110 },
      { name: 'Ceinture dorée', price: 90, promoPrice: null },
      { name: 'Escarpins', price: 380, promoPrice: null },
      { name: 'Veste brodée', price: 520, promoPrice: 450 },
    ].map((p, i) => ({
      shop: fashionShop._id,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: p.name,
      price: p.price,
      promoPrice: p.promoPrice,
      // images: [`https://images.unsplash.com/photo-15${20 + i}00000000-000000000000?w=600`],
      images: ["https://i.pinimg.com/736x/c7/e5/f5/c7e5f525fa7eb65e4b1a2cc595ec36d9.jpg","https://wwd.com/wp-content/uploads/2024/02/bottega-veneta-ready-to-wear-fall-2024-0015.jpg", "https://c.imgz.jp/052/87072052/87072052_17_d_500.jpg"],
      available: true,
      order: i,
    }))
  );

  const beautyProducts = await Product.insertMany(
    [
      { name: "Huile d'argan pure", price: 120, promoPrice: null },
      { name: 'Savon noir traditionnel', price: 45, promoPrice: 35 },
      { name: 'Ghassoul en poudre', price: 60, promoPrice: null },
      { name: 'Coffret soin visage', price: 280, promoPrice: 220 },
      { name: 'Rouge à lèvres naturel', price: 95, promoPrice: null },
      { name: "Eau de fleur d'oranger", price: 55, promoPrice: null },
    ].map((p, i) => ({
      shop: beautyShop._id,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: p.name,
      price: p.price,
      promoPrice: p.promoPrice,
      images: ["https://chicagofragrance.com/cdn/shop/files/MD_Parfum_Mood_Pack-ingredient_E-merch_2400x3000_0fea01db-87ed-4740-8fc1-ef03df9e60fd.jpg?v=1728910097", "https://chicagofragrance.com/cdn/shop/files/MD_Parfum_Mood_Pack-ingredient_E-merch_2400x3000_0fea01db-87ed-4740-8fc1-ef03df9e60fd.jpg?v=1728910097"],
      available: true,
      order: i,
    }))
  );

  const techProducts = await Product.insertMany(
    [
      { name: 'Écouteurs sans fil', price: 249, promoPrice: 199 },
      { name: 'Chargeur rapide 65W', price: 179, promoPrice: null },
      { name: 'Coque iPhone', price: 89, promoPrice: null },
      { name: 'Support téléphone voiture', price: 65, promoPrice: null },
      { name: 'Batterie externe 20000mAh', price: 219, promoPrice: 179 },
      { name: 'Clavier sans fil', price: 159, promoPrice: null },
    ].map((p, i) => ({
      shop: techShop._id,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: p.name,
      price: p.price,
      promoPrice: p.promoPrice,
      images: ["https://m3.ngt.ma/21821-large_default/ordinateur-portable-gamer-asus-rog-zephyrus-g15-ga503rm-hq003w-90nr0812-m002r0.jpg", "https://lcdi.fr/cdn/shop/collections/LCDI-PHANTEKS-XT-PRO-ULTRA-TG-BLANC-5070-Ti.png?v=1749817192"],
      available: true,
      order: i,
    }))
  );

  // --- Avis (double note multi-critères) ---
  // Boutiques : service / communication / fiabilité séparés. Produits : qualité seule.
  await Review.create([
    { author: sara._id, targetType: 'shop', targetId: fashionShop._id, serviceRating: 5, communicationRating: 5, reliabilityRating: 4, comment: 'Superbe boutique, livraison rapide.' },
    { author: karim._id, targetType: 'shop', targetId: fashionShop._id, serviceRating: 4, communicationRating: 4, reliabilityRating: 5, comment: 'Très professionnel.' },
    { author: sara._id, targetType: 'shop', targetId: beautyShop._id, serviceRating: 5, communicationRating: 4, reliabilityRating: 5, comment: 'Produits authentiques.' },
    { author: karim._id, targetType: 'shop', targetId: beautyShop._id, serviceRating: 4, communicationRating: 5, reliabilityRating: 4, comment: 'Bonne communication WhatsApp.' },
    { author: sara._id, targetType: 'shop', targetId: techShop._id, serviceRating: 4, communicationRating: 3, reliabilityRating: 4, comment: 'Bons prix, un peu lent à répondre.' },
    { author: yasmine._id, targetType: 'shop', targetId: techShop._id, serviceRating: 5, communicationRating: 4, reliabilityRating: 5, comment: 'Vendeur sérieux, recommandé.' },

    { author: sara._id, targetType: 'product', targetId: fashionProducts[0]._id, qualityRating: 4, comment: 'Très jolie robe.' },
    { author: karim._id, targetType: 'product', targetId: fashionProducts[0]._id, qualityRating: 5, comment: 'Qualité au rendez-vous.' },
    { author: sara._id, targetType: 'product', targetId: fashionProducts[3]._id, qualityRating: 5, comment: 'Foulard magnifique.' },
    { author: yasmine._id, targetType: 'product', targetId: beautyProducts[0]._id, qualityRating: 5, comment: 'Huile pure, très efficace.' },
    { author: karim._id, targetType: 'product', targetId: beautyProducts[1]._id, qualityRating: 4, comment: 'Bon savon traditionnel.' },
    { author: sara._id, targetType: 'product', targetId: beautyProducts[3]._id, qualityRating: 5, comment: 'Coffret parfait en cadeau.' },
    { author: yasmine._id, targetType: 'product', targetId: techProducts[0]._id, qualityRating: 4, comment: 'Bon son, autonomie correcte.' },
    { author: karim._id, targetType: 'product', targetId: techProducts[4]._id, qualityRating: 5, comment: 'Tient vraiment la charge annoncée.' },
    { author: sara._id, targetType: 'product', targetId: techProducts[2]._id, qualityRating: 3, comment: 'Correct sans plus.' },
  ]);

  // Recalcul des moyennes dénormalisées (répliqué manuellement ici pour le seed,
  // même logique que lib/review-actions.ts::recomputeRating).
  async function recomputeShop(shopId: mongoose.Types.ObjectId) {
    const stats = await Review.aggregate([
      { $match: { targetType: 'shop', targetId: shopId } },
      { $group: { _id: null, service: { $avg: '$serviceRating' }, communication: { $avg: '$communicationRating' }, reliability: { $avg: '$reliabilityRating' }, count: { $sum: 1 } } },
    ]);
    const s = stats[0];
    if (!s) return;
    const round1 = (n: number) => Math.round(n * 10) / 10;
    const overall = round1((s.service + s.communication + s.reliability) / 3);
    await Shop.findByIdAndUpdate(shopId, {
      serviceRating: round1(s.service), communicationRating: round1(s.communication), reliabilityRating: round1(s.reliability),
      rating: overall, reviewsCount: s.count,
    });
  }

  async function recomputeProduct(productId: mongoose.Types.ObjectId) {
    const stats = await Review.aggregate([
      { $match: { targetType: 'product', targetId: productId } },
      { $group: { _id: null, quality: { $avg: '$qualityRating' }, count: { $sum: 1 } } },
    ]);
    const s = stats[0];
    if (!s) return;
    await Product.findByIdAndUpdate(productId, { rating: Math.round(s.quality * 10) / 10, reviewsCount: s.count });
  }

  for (const shopId of [fashionShop._id, beautyShop._id, techShop._id]) await recomputeShop(shopId);
  for (const p of [fashionProducts[0], fashionProducts[3], beautyProducts[0], beautyProducts[1], beautyProducts[3], techProducts[0], techProducts[4], techProducts[2]]) {
    await recomputeProduct(p._id);
  }

  // Favoris et historique factices sur Sara (utilisatrice sans boutique — profil "acheteuse").
  sara.favorites.shops.push(fashionShop._id, techShop._id);
  sara.favorites.products.push(fashionProducts[1]._id, beautyProducts[3]._id);
  sara.history.push(
    { product: fashionProducts[2]._id, viewedAt: new Date() },
    { product: techProducts[1]._id, viewedAt: new Date(Date.now() - 3600_000) },
    { product: beautyProducts[2]._id, viewedAt: new Date(Date.now() - 7200_000) }
  );
  await sara.save();

  console.log('Seed complete:');
  console.log('  Login (vendeuse, 2 boutiques): test@vitrine.ma / password123');
  console.log('  Login (vendeur, 1 boutique):   karim@vitrine.ma / password123');
  console.log('  Login (acheteuse):             sara@vitrine.ma / password123');
  console.log(`  Shops: /${fashionShop.slug}, /${beautyShop.slug}, /${techShop.slug}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
