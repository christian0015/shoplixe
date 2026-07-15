// app/[shopSlug]/[productSlug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/public-data';
import { addToHistory } from '@/lib/user-actions';
import { getReviews } from '@/lib/review-actions';
import { getSession } from '@/lib/session';
import { getTheme } from '@/lib/themes';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import { ReviewSection } from '@/components/ReviewSection';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug, productSlug } = await params;
  const data = await getProductBySlug(shopSlug, productSlug);
  if (!data) return {};
  const { product } = data;

  return {
    title: `${product.name} — VitrineMa`,
    description: product.description || product.name,
    openGraph: {
      title: product.name,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}) {
  const { shopSlug, productSlug } = await params;
  const data = await getProductBySlug(shopSlug, productSlug);
  if (!data) notFound();
  const { product, shop } = data;

  const session = await getSession();
  await addToHistory(product._id);
  const reviews = await getReviews('product', product._id);

  let isFavorite = false;
  if (session) {
    await connectDB();
    const user = await User.findById(session.userId).lean() as unknown as {
      favorites: { products: unknown[] };
    } | null;
    if (user) isFavorite = user.favorites.products.map(String).includes(product._id);
  }

  const theme = getTheme(shop.theme, shop.accentColor);
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;
  const waLink = `https://wa.me/${shop.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Bonjour, je suis intéressé(e) par ${product.name} à ${displayPrice} MAD`
  )}`;

  return (
    <main style={{ backgroundColor: theme.bg, minHeight: '100vh' }} className="px-4 md:px-8 py-6 pb-28">
      <Link href={`/${shop.slug}`} className="text-sm" style={{ color: theme.textMuted }}>
        ← Retour à la boutique
      </Link>

      <div className="mt-4 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100">
          {product.images[0] && (
            <Image src={product.images[0]} alt={product.name} fill priority className="object-cover" />
          )}
          <div className="absolute top-3 left-3">
            <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={Boolean(session)} />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-display font-bold text-2xl" style={{ color: theme.text }}>
            {product.name}
          </h1>

          {product.reviewsCount > 0 && <StarRatingDisplay value={product.rating} count={product.reviewsCount} />}

          <div className="flex items-center gap-3 font-mono">
            {hasPromo && (
              <span className="line-through opacity-50" style={{ color: theme.textMuted }}>
                {product.price} MAD
              </span>
            )}
            <span className="text-2xl font-semibold" style={{ color: shop.accentColor || theme.accent }}>
              {displayPrice} MAD
            </span>
          </div>

          {product.description && <p style={{ color: theme.textMuted }}>{product.description}</p>}

          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 px-6 py-3 rounded-2xl font-medium text-white"
            style={{ backgroundColor: shop.accentColor || theme.accent }}
          >
            Commander sur WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <ReviewSection
          targetType="product"
          targetId={product._id}
          initialReviews={reviews}
          ratingSummary={{ quality: product.rating ?? 0, count: product.reviewsCount ?? 0 }}
          isAuthenticated={Boolean(session)}
          currentUserId={session?.userId}
        />
      </div>
    </main>
  );
}
