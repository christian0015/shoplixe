// app/[shopSlug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getShopBySlug, getProductsByShop } from '@/lib/public-data';
import { getReviews } from '@/lib/review-actions';
import { getSession } from '@/lib/session';
import { getTheme } from '@/lib/themes';
import { ShopHeader } from '@/components/ShopHeader';
import { ProductGrid } from '@/components/ProductGrid';
import { ReviewSection } from '@/components/ReviewSection';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) return {};

  return {
    title: `${shop.name} — VitrineMa`,
    description: shop.description || `Découvrez les produits de ${shop.name} sur VitrineMa.`,
    openGraph: {
      title: shop.name,
      description: shop.description,
      images: shop.cover ? [shop.cover] : [],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${shop.slug}`,
    },
  };
}

export default async function ShopPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  const [products, session, reviews] = await Promise.all([
    getProductsByShop(shop._id, { onlyAvailable: true }),
    getSession(),
    getReviews('shop', shop._id),
  ]);

  let favoriteShopIds: string[] = [];
  let favoriteProductIds: string[] = [];
  if (session) {
    await connectDB();
    const user = await User.findById(session.userId).lean() as unknown as {
      favorites: { shops: unknown[]; products: unknown[] };
    } | null;
    if (user) {
      favoriteShopIds = user.favorites.shops.map(String);
      favoriteProductIds = user.favorites.products.map(String);
    }
  }

  const theme = getTheme(shop.theme, shop.accentColor);

  return (
    <main style={{ backgroundColor: theme.bg, minHeight: '100vh' }}>
      <ShopHeader
        shop={shop}
        theme={theme}
        accentColor={shop.accentColor}
        template={shop.template}
        secondaryImage={products[0]?.images?.[0] ?? null}
        isAuthenticated={Boolean(session)}
        isFavorite={favoriteShopIds.includes(shop._id)}
      />

      <div className="px-4 md:px-8 pb-20">
        <ProductGrid
          products={products}
          template={shop.template}
          theme={theme}
          accentColor={shop.accentColor}
          shopSlug={shop.slug}
          isAuthenticated={Boolean(session)}
          favoriteIds={favoriteProductIds}
          backgroundImage={shop.cover}
        />

        <ReviewSection
          targetType="shop"
          targetId={shop._id}
          initialReviews={reviews}
          ratingSummary={{
            service: shop.serviceRating ?? 0,
            communication: shop.communicationRating ?? 0,
            reliability: shop.reliabilityRating ?? 0,
            overall: shop.rating ?? 0,
            count: shop.reviewsCount ?? 0,
          }}
          isAuthenticated={Boolean(session)}
          currentUserId={session?.userId}
        />
      </div>
    </main>
  );
}
