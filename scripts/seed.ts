
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

  // Create users
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

  const imane = await User.create({
    email: 'imane@vitrine.ma',
    passwordHash,
    name: 'Imane Tazi',
    phone: '212600000030',
    hasShop: true,
    newsletter: true,
  });

  const mehdi = await User.create({
    email: 'mehdi@vitrine.ma',
    passwordHash,
    name: 'Mehdi Benjelloun',
    phone: '212600000040',
    hasShop: true,
    newsletter: false,
  });

  // Create 5 shops
  const fashionShop = await Shop.create({
    owner: yasmine._id,
    slug: 'yasmine-fashion',
    name: 'Yasmine Fashion',
    description: 'Prêt-à-porter féminin, pièces uniques importées d\'Italie et de France. Collections exclusives pour femmes modernes.',
    logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200',
    cover: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    category: 'fashion',
    theme: 'luxury',
    template: 'magazine',
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
    description: 'Cosmétiques et soins naturels marocains : argan, ghassoul, rhassoul, huiles essentielles. Produits bio et équitables.',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
    cover: 'https://hips.hearstapps.com/hmg-prod/images/best-hair-products-652ff0542c0bb.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=1120:*',
    category: 'beauty',
    theme: 'beauty',
    template: 'bento',
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
    description: 'Accessoires et gadgets tech au meilleur prix. Smartphones, ordinateurs, accessoires gaming et plus.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
    category: 'tech',
    theme: 'tech',
    template: 'flux3d',
    whatsappNumber: '212600000002',
    city: 'Rabat',
    district: 'Agdal',
    location: { type: 'Point', coordinates: [-6.8498, 34.0209] },
    isVerified: false,
  });

  const homeShop = await Shop.create({
    owner: imane._id,
    slug: 'maison-maghreb',
    name: 'Maison Maghreb',
    description: 'Décoration intérieure et artisanat marocain. Meubles, tapis, luminaires et objets d\'art traditionnels et modernes.',
    logo: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=200',
    cover: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200',
    category: 'home',
    theme: 'minimal',
    template: 'magazine',
    whatsappNumber: '212600000004',
    instagram: 'https://instagram.com/maisonmaghreb',
    city: 'Marrakech',
    district: 'Gueliz',
    location: { type: 'Point', coordinates: [-8.0052, 31.6348] },
    isVerified: true,
  });

  const foodShop = await Shop.create({
    owner: mehdi._id,
    slug: 'saveurs-du-maroc',
    name: 'Saveurs du Maroc',
    description: 'Épicerie fine et produits gastronomiques marocains. Épices, huiles, conserves, pâtisseries et spécialités régionales.',
    logo: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200',
    cover: 'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=1200',
    category: 'food',
    theme: 'food',
    template: 'grid',
    whatsappNumber: '212600000005',
    city: 'Fès',
    district: 'Fès Jdid',
    location: { type: 'Point', coordinates: [-4.9811, 34.0334] },
    isVerified: true,
  });

  // Fashion products (11 products)
  const fashionProducts = await Product.insertMany([
    {
      shop: fashionShop._id,
      slug: 'robe-brodee-ceremonie',
      name: 'Robe brodée cérémonie',
      price: 350,
      promoPrice: 280,
      images: [
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600',
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600'
      ],
      available: true,
      order: 0,
    },
    {
      shop: fashionShop._id,
      slug: 'kaftan-soiree-luxe',
      name: 'Kaftan de soirée luxe',
      price: 900,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=600',
        'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'
      ],
      available: true,
      order: 1,
    },
    {
      shop: fashionShop._id,
      slug: 'sac-main-cuir-italien',
      name: 'Sac à main cuir italien',
      price: 420,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'
      ],
      available: true,
      order: 2,
    },
    {
      shop: fashionShop._id,
      slug: 'foulard-soie-imprime',
      name: 'Foulard soie imprimé',
      price: 150,
      promoPrice: 110,
      images: [
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
      ],
      available: true,
      order: 3,
    },
    {
      shop: fashionShop._id,
      slug: 'ceinture-doree-strass',
      name: 'Ceinture dorée strass',
      price: 90,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600',
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'
      ],
      available: true,
      order: 4,
    },
    {
      shop: fashionShop._id,
      slug: 'escarpins-talons-hauts',
      name: 'Escarpins talons hauts',
      price: 380,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'
      ],
      available: true,
      order: 5,
    },
    {
      shop: fashionShop._id,
      slug: 'veste-brodee-cachemire',
      name: 'Veste brodée cachemire',
      price: 520,
      promoPrice: 450,
      images: [
        'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600',
        'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600'
      ],
      available: true,
      order: 6,
    },
    {
      shop: fashionShop._id,
      slug: 'jupe-plissee-midi',
      name: 'Jupe plissée midi',
      price: 280,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600',
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600'
      ],
      available: true,
      order: 7,
    },
    {
      shop: fashionShop._id,
      slug: 'blazer-coupe-classique',
      name: 'Blazer coupe classique',
      price: 650,
      promoPrice: 590,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'
      ],
      available: true,
      order: 8,
    },
    {
      shop: fashionShop._id,
      slug: 'robe-casual-fleurie',
      name: 'Robe casual fleurie',
      price: 220,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600'
      ],
      available: true,
      order: 9,
    },
    {
      shop: fashionShop._id,
      slug: 'pantalon-large-lin',
      name: 'Pantalon large lin',
      price: 310,
      promoPrice: 270,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'
      ],
      available: true,
      order: 10,
    },
  ]);

  // Beauty products (11 products)
  const beautyProducts = await Product.insertMany([
    {
      shop: beautyShop._id,
      slug: 'huile-argan-pure-bio',
      name: "Huile d'argan pure bio",
      price: 120,
      promoPrice: null,
      images: [
        'https://www.fleurancenature.fr/dw/image/v2/BFMK_PRD/on/demandware.static/-/Sites-FN/default/dw279f40bd/images/large/Beaute/Soins-corps/Huile_Argan_1.jpg?sw=488&sh=488',
        'https://www.fleurancenature.fr/dw/image/v2/BFMK_PRD/on/demandware.static/-/Sites-FN/default/dw279f40bd/images/large/Beaute/Soins-corps/Huile_Argan_1.jpg?sw=488&sh=488'
      ],
      available: true,
      order: 0,
    },
    {
      shop: beautyShop._id,
      slug: 'savon-noir-traditionnel',
      name: 'Savon noir traditionnel',
      price: 45,
      promoPrice: 35,
      images: [
        'https://tse4.mm.bing.net/th/id/OIP.1Gths2rxEtSzv6vt7iYMIAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
        'https://tse4.mm.bing.net/th/id/OIP.1Gths2rxEtSzv6vt7iYMIAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
      ],
      available: true,
      order: 1,
    },
    {
      shop: beautyShop._id,
      slug: 'ghassoul-poudre-pur',
      name: 'Ghassoul en poudre pur',
      price: 60,
      promoPrice: null,
      images: [
        'https://traditionnature.fr/cdn/shop/files/reglisse_poudre_mockup_842x.png?v=1749824813',
        'https://traditionnature.fr/cdn/shop/files/reglisse_poudre_mockup_842x.png?v=1749824813'
      ],
      available: true,
      order: 2,
    },
    {
      shop: beautyShop._id,
      slug: 'coffret-soin-visage',
      name: 'Coffret soin visage',
      price: 280,
      promoPrice: 220,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'
      ],
      available: true,
      order: 3,
    },
    {
      shop: beautyShop._id,
      slug: 'rouge-levres-naturel',
      name: 'Rouge à lèvres naturel',
      price: 95,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600',
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600'
      ],
      available: true,
      order: 4,
    },
    {
      shop: beautyShop._id,
      slug: 'eau-fleur-oranger',
      name: "Eau de fleur d'oranger",
      price: 55,
      promoPrice: null,
      images: [
        'https://maroc-argan.fr/1305-large_default/eau-fleurs-oranger.jpg',
        'https://maroc-argan.fr/1305-large_default/eau-fleurs-oranger.jpg'
      ],
      available: true,
      order: 5,
    },
    {
      shop: beautyShop._id,
      slug: 'masque-argile-rhassoul',
      name: 'Masque argile rhassoul',
      price: 75,
      promoPrice: 60,
      images: [
        'https://th.bing.com/th/id/OIP.JoZyeRrWm7o0dtCvFr3IGQAAAA?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
        'https://th.bing.com/th/id/OIP.JoZyeRrWm7o0dtCvFr3IGQAAAA?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
      ],
      available: true,
      order: 6,
    },
    {
      shop: beautyShop._id,
      slug: 'serum-vitamine-c',
      name: 'Sérum vitamine C',
      price: 180,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600'
      ],
      available: true,
      order: 7,
    },
    {
      shop: beautyShop._id,
      slug: 'baume-corporel-argan',
      name: 'Baume corporel à l\'argan',
      price: 140,
      promoPrice: 120,
      images: [
        'https://th.bing.com/th/id/OIP.DhLNIZ3uPEmnAL0wF9KUUQHaHa?w=165&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
        'https://th.bing.com/th/id/OIP.DhLNIZ3uPEmnAL0wF9KUUQHaHa?w=165&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
      ],
      available: true,
      order: 8,
    },
    {
      shop: beautyShop._id,
      slug: 'gommage-corporel-menthe',
      name: 'Gommage corporel à la menthe',
      price: 85,
      promoPrice: null,
      images: [
        'https://th.bing.com/th/id/OIP.iuXXCTNjMKl1INJC5sGo2gHaHa?w=180&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
        'https://th.bing.com/th/id/OIP.iuXXCTNjMKl1INJC5sGo2gHaHa?w=180&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
      ],
      available: true,
      order: 9,
    },
    {
      shop: beautyShop._id,
      slug: 'huile-essentielle-lavande',
      name: 'Huile essentielle lavande',
      price: 65,
      promoPrice: null,
      images: [
        'https://th.bing.com/th/id/OIP.DzwV_4bDeV0WcOzPpH5vKgHaE8?w=253&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
        'https://th.bing.com/th/id/OIP.DzwV_4bDeV0WcOzPpH5vKgHaE8?w=253&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
      ],
      available: true,
      order: 10,
    },
  ]);

  // Tech products (11 products)
  const techProducts = await Product.insertMany([
    {
      shop: techShop._id,
      slug: 'ecouteurs-sans-fil-pro',
      name: 'Écouteurs sans fil Pro',
      price: 249,
      promoPrice: 199,
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
      ],
      available: true,
      order: 0,
    },
    {
      shop: techShop._id,
      slug: 'chargeur-rapide-65w',
      name: 'Chargeur rapide 65W GaN',
      price: 179,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'
      ],
      available: true,
      order: 1,
    },
    {
      shop: techShop._id,
      slug: 'coque-iphone-magsafe',
      name: 'Coque iPhone MagSafe',
      price: 89,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600'
      ],
      available: true,
      order: 2,
    },
    {
      shop: techShop._id,
      slug: 'support-telephone-voiture',
      name: 'Support téléphone voiture',
      price: 65,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'
      ],
      available: true,
      order: 3,
    },
    {
      shop: techShop._id,
      slug: 'batterie-externe-20000mah',
      name: 'Batterie externe 20000mAh',
      price: 219,
      promoPrice: 179,
      images: [
        'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600',
        'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600'
      ],
      available: true,
      order: 4,
    },
    {
      shop: techShop._id,
      slug: 'clavier-sans-fil-bluetooth',
      name: 'Clavier sans fil Bluetooth',
      price: 159,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'
      ],
      available: true,
      order: 5,
    },
    {
      shop: techShop._id,
      slug: 'souris-gaming-ergonomique',
      name: 'Souris gaming ergonomique',
      price: 129,
      promoPrice: 99,
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'
      ],
      available: true,
      order: 6,
    },
    {
      shop: techShop._id,
      slug: 'cable-usb-c-3m',
      name: 'Câble USB-C 3m',
      price: 35,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'
      ],
      available: true,
      order: 7,
    },
    {
      shop: techShop._id,
      slug: 'adaptateur-otg-usb-c',
      name: 'Adaptateur OTG USB-C',
      price: 45,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'
      ],
      available: true,
      order: 8,
    },
    {
      shop: techShop._id,
      slug: 'hub-usb-7-ports',
      name: 'Hub USB 7 ports',
      price: 199,
      promoPrice: 169,
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'
      ],
      available: true,
      order: 9,
    },
    {
      shop: techShop._id,
      slug: 'webcam-4k-streaming',
      name: 'Webcam 4K streaming',
      price: 299,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
      ],
      available: true,
      order: 10,
    },
  ]);

  // Home & decor products (11 products)
  const homeProducts = await Product.insertMany([
    {
      shop: homeShop._id,
      slug: 'tapis-berbere-traditionnel',
      name: 'Tapis berbère traditionnel',
      price: 450,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 0,
    },
    {
      shop: homeShop._id,
      slug: 'lampe-cuir-mosaique',
      name: 'Lampe cuir mosaïque',
      price: 190,
      promoPrice: 160,
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'
      ],
      available: true,
      order: 1,
    },
    {
      shop: homeShop._id,
      slug: 'poterie-fes-artisanale',
      name: 'Poterie Fès artisanale',
      price: 85,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 2,
    },
    {
      shop: homeShop._id,
      slug: 'panier-tress%C3%A9-palmier',
      name: 'Panier tressé palmier',
      price: 110,
      promoPrice: 90,
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'
      ],
      available: true,
      order: 3,
    },
    {
      shop: homeShop._id,
      slug: 'miroir-ornemental-dore',
      name: 'Miroir ornemental doré',
      price: 320,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 4,
    },
    {
      shop: homeShop._id,
      slug: 'coussin-brode-berbere',
      name: 'Coussin brodé berbère',
      price: 65,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'
      ],
      available: true,
      order: 5,
    },
    {
      shop: homeShop._id,
      slug: 'table-basse-c%C3%A9ramique',
      name: 'Table basse cérAmique',
      price: 890,
      promoPrice: 790,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 6,
    },
    {
      shop: homeShop._id,
      slug: 'ventilateur-plafond-bois',
      name: 'Ventilateur plafond bois',
      price: 220,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'
      ],
      available: true,
      order: 7,
    },
    {
      shop: homeShop._id,
      slug: 'porte-bijoux-filigrane',
      name: 'Porte-bijoux filigrane',
      price: 140,
      promoPrice: 120,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 8,
    },
    {
      shop: homeShop._id,
      slug: 'bougeoir-cuivre-ancien',
      name: 'Bougeoir cuivre ancien',
      price: 75,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600'
      ],
      available: true,
      order: 9,
    },
    {
      shop: homeShop._id,
      slug: 'cadre-zellige-artisanal',
      name: 'Cadre zellige artisanal',
      price: 250,
      promoPrice: 210,
      images: [
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600'
      ],
      available: true,
      order: 10,
    },
  ]);

  // Food products (11 products)
  const foodProducts = await Product.insertMany([
    {
      shop: foodShop._id,
      slug: 'saffran-taliouine-igp',
      name: 'Safran Taliouine IGP',
      price: 180,
      promoPrice: 150,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 0,
    },
    {
      shop: foodShop._id,
      slug: 'huile-argan-cuisine',
      name: 'Huile d\'argan cuisine',
      price: 95,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600',
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600'
      ],
      available: true,
      order: 1,
    },
    {
      shop: foodShop._id,
      slug: 'ras-el-hanout-premium',
      name: 'Ras el-hanout premium',
      price: 55,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 2,
    },
    {
      shop: foodShop._id,
      slug: 'amandes-blanches-c%C3%A9r%C3%A9monie',
      name: 'Amandes blanches cérémonie',
      price: 75,
      promoPrice: 65,
      images: [
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600',
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600'
      ],
      available: true,
      order: 3,
    },
    {
      shop: foodShop._id,
      slug: 'miel-jbel-sargho',
      name: 'Miel Jbel Sargho',
      price: 120,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 4,
    },
    {
      shop: foodShop._id,
      slug: 'olives-cerfignolle-marocaines',
      name: 'Olives cerfignolle marocaines',
      price: 40,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600',
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600'
      ],
      available: true,
      order: 5,
    },
    {
      shop: foodShop._id,
      slug: 'couscous-semis-complet',
      name: 'Couscous semi-complet',
      price: 30,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 6,
    },
    {
      shop: foodShop._id,
      slug: 'tajine-souff%C3%A9-fabrication',
      name: 'Tajine soufflé fabrication',
      price: 250,
      promoPrice: 220,
      images: [
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600',
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600'
      ],
      available: true,
      order: 7,
    },
    {
      shop: foodShop._id,
      slug: 'conserves-c%C5%93ur-artichaut',
      name: 'Conserves cœurs d\'artichaut',
      price: 65,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 8,
    },
    {
      shop: foodShop._id,
      slug: 'confiture-fraise-or',
      name: 'Confiture fraise-or',
      price: 50,
      promoPrice: null,
      images: [
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600',
        'https://images.unsplash.com/photo-1556912995-4c8e2c3e1a6a?w=600'
      ],
      available: true,
      order: 9,
    },
    {
      shop: foodShop._id,
      slug: 'p%C3%A2tisserie-briouats-amande',
      name: 'Pâtisserie briouats amande',
      price: 85,
      promoPrice: 70,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600'
      ],
      available: true,
      order: 10,
    },
  ]);

  // Reviews
  await Review.create([
    // Shop reviews
    { author: sara._id, targetType: 'shop', targetId: fashionShop._id, serviceRating: 5, communicationRating: 5, reliabilityRating: 4, comment: 'Superbe boutique, livraison rapide.' },
    { author: karim._id, targetType: 'shop', targetId: fashionShop._id, serviceRating: 4, communicationRating: 4, reliabilityRating: 5, comment: 'Très professionnel.' },
    { author: sara._id, targetType: 'shop', targetId: beautyShop._id, serviceRating: 5, communicationRating: 4, reliabilityRating: 5, comment: 'Produits authentiques.' },
    { author: karim._id, targetType: 'shop', targetId: beautyShop._id, serviceRating: 4, communicationRating: 5, reliabilityRating: 4, comment: 'Bonne communication WhatsApp.' },
    { author: sara._id, targetType: 'shop', targetId: techShop._id, serviceRating: 4, communicationRating: 3, reliabilityRating: 4, comment: 'Bons prix, un peu lent à répondre.' },
    { author: yasmine._id, targetType: 'shop', targetId: techShop._id, serviceRating: 5, communicationRating: 4, reliabilityRating: 5, comment: 'Vendeur sérieux, recommandé.' },
    { author: sara._id, targetType: 'shop', targetId: homeShop._id, serviceRating: 5, communicationRating: 5, reliabilityRating: 5, comment: 'Magnifiques objets d\'art, livraison soignée.' },
    { author: mehdi._id, targetType: 'shop', targetId: homeShop._id, serviceRating: 4, communicationRating: 4, reliabilityRating: 4, comment: 'Belle sélection artisanale.' },
    { author: karim._id, targetType: 'shop', targetId: foodShop._id, serviceRating: 5, communicationRating: 4, reliabilityRating: 5, comment: 'Produits frais et de qualité.' },
    { author: imane._id, targetType: 'shop', targetId: foodShop._id, serviceRating: 4, communicationRating: 5, reliabilityRating: 4, comment: 'Excellents épices et conserves.' },

    // Product reviews - Fashion
    { author: sara._id, targetType: 'product', targetId: fashionProducts[0]._id, qualityRating: 4, comment: 'Très jolie robe, mais taille un peu grand.' },
    { author: karim._id, targetType: 'product', targetId: fashionProducts[0]._id, qualityRating: 5, comment: 'Qualité au rendez-vous.' },
    { author: sara._id, targetType: 'product', targetId: fashionProducts[3]._id, qualityRating: 5, comment: 'Foulard magnifique, soie authentique.' },
    { author: imane._id, targetType: 'product', targetId: fashionProducts[1]._id, qualityRating: 5, comment: 'Kaftan superbe pour une soirée.' },
    { author: mehdi._id, targetType: 'product', targetId: fashionProducts[2]._id, qualityRating: 4, comment: 'Sac en cuir de bonne qualité.' },

    // Product reviews - Beauty
    { author: yasmine._id, targetType: 'product', targetId: beautyProducts[0]._id, qualityRating: 5, comment: 'Huile pure, très efficace.' },
    { author: karim._id, targetType: 'product', targetId: beautyProducts[1]._id, qualityRating: 4, comment: 'Bon savon traditionnel.' },
    { author: sara._id, targetType: 'product', targetId: beautyProducts[3]._id, qualityRating: 5, comment: 'Coffret parfait en cadeau.' },
    { author: imane._id, targetType: 'product', targetId: beautyProducts[2]._id, qualityRating: 4, comment: 'Ghassoul pur, excellent.' },
    { author: mehdi._id, targetType: 'product', targetId: beautyProducts[4]._id, qualityRating: 4, comment: 'Rouge à lèvres naturel, bonne tenue.' },

    // Product reviews - Tech
    { author: yasmine._id, targetType: 'product', targetId: techProducts[0]._id, qualityRating: 4, comment: 'Bon son, autonomie correcte.' },
    { author: karim._id, targetType: 'product', targetId: techProducts[4]._id, qualityRating: 5, comment: 'Tient vraiment la charge annoncée.' },
    { author: sara._id, targetType: 'product', targetId: techProducts[2]._id, qualityRating: 3, comment: 'Correct sans plus.' },
    { author: imane._id, targetType: 'product', targetId: techProducts[1]._id, qualityRating: 4, comment: 'Charge rapide efficace.' },
    { author: mehdi._id, targetType: 'product', targetId: techProducts[3]._id, qualityRating: 4, comment: 'Support pratique et stable.' },

    // Product reviews - Home
    { author: sara._id, targetType: 'product', targetId: homeProducts[0]._id, qualityRating: 5, comment: 'Magnifique tapis berbère.' },
    { author: karim._id, targetType: 'product', targetId: homeProducts[1]._id, qualityRating: 4, comment: 'Lampe superbe, un peu fragile.' },
    { author: yasmine._id, targetType: 'product', targetId: homeProducts[3]._id, qualityRating: 5, comment: 'Panier tressé de très belle facture.' },

    // Product reviews - Food
    { author: sara._id, targetType: 'product', targetId: foodProducts[0]._id, qualityRating: 5, comment: 'Safran d\'exception, arôme intense.' },
    { author: karim._id, targetType: 'product', targetId: foodProducts[3]._id, qualityRating: 4, comment: 'Amandes fraîches et croquantes.' },
    { author: imane._id, targetType: 'product', targetId: foodProducts[6]._id, qualityRating: 4, comment: 'Couscous de bonne qualité.' },
  ]);

  // Recalculate ratings
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

  // Recompute all shops
  for (const shopId of [fashionShop._id, beautyShop._id, techShop._id, homeShop._id, foodShop._id]) {
    await recomputeShop(shopId);
  }

  // Recompute all products that have reviews
  const allProducts = [...fashionProducts, ...beautyProducts, ...techProducts, ...homeProducts, ...foodProducts];
  for (const p of allProducts) {
    await recomputeProduct(p._id);
  }

  // Add favorites and history for Sara
  sara.favorites.shops.push(fashionShop._id, techShop._id, homeShop._id);
  sara.favorites.products.push(
    fashionProducts[1]._id, 
    beautyProducts[3]._id,
    techProducts[0]._id,
    homeProducts[1]._id,
    foodProducts[0]._id
  );
  sara.history.push(
    { product: fashionProducts[2]._id, viewedAt: new Date() },
    { product: techProducts[1]._id, viewedAt: new Date(Date.now() - 3600_000) },
    { product: beautyProducts[2]._id, viewedAt: new Date(Date.now() - 7200_000) },
    { product: homeProducts[3]._id, viewedAt: new Date(Date.now() - 10800_000) },
    { product: foodProducts[1]._id, viewedAt: new Date(Date.now() - 14400_000) }
  );
  await sara.save();

  // Add some favorites for Imane
  imane.favorites.shops.push(beautyShop._id, foodShop._id);
  imane.favorites.products.push(beautyProducts[0]._id, foodProducts[2]._id);
  await imane.save();

  // Add some favorites for Mehdi
  mehdi.favorites.shops.push(fashionShop._id, techShop._id);
  mehdi.favorites.products.push(fashionProducts[0]._id, techProducts[4]._id);
  await mehdi.save();

  console.log('Seed complete:');
  console.log('  Login (vendeuse, 2 boutiques): test@vitrine.ma / password123');
  console.log('  Login (vendeur, 1 boutique):   karim@vitrine.ma / password123');
  console.log('  Login (acheteuse):             sara@vitrine.ma / password123');
  console.log('  Login (vendeuse):              imane@vitrine.ma / password123');
  console.log('  Login (vendeur):               mehdi@vitrine.ma / password123');
  console.log(`  Shops: /${fashionShop.slug}, /${beautyShop.slug}, /${techShop.slug}, /${homeShop.slug}, /${foodShop.slug}`);
  console.log(`  Total products: ${allProducts.length}`);
  console.log(`  Total reviews: ${(await Review.countDocuments())}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
