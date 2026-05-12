import { serverFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import RestaurantDetailClient from '@/components/restaurants/RestaurantDetailClient';

export const revalidate = 60;

async function getRestaurant(id) {
  try {
    return await serverFetch(`/restaurants/${id}`);
  } catch {
    return null;
  }
}

async function getMenu(id) {
  try {
    return await serverFetch(`/restaurants/${id}/menu?apply_margin=true`);
  } catch {
    return [];
  }
}

// Dynamic SEO meta tags per restaurant
export async function generateMetadata({ params }) {
  const restaurant = await getRestaurant(params.id);
  if (!restaurant) return { title: 'Restaurant introuvable' };

  return {
    title: `Commander chez ${restaurant.name} — Livraison rapide`,
    description: `${restaurant.description || ''} Commandez en ligne chez ${restaurant.name}. Livraison en ${restaurant.delivery_time || '30 min'}. Frais de livraison : ${restaurant.delivery_fee?.toFixed(2) || '0.00'} €.`,
    openGraph: {
      title: `${restaurant.name} — Let's Go Food`,
      description: restaurant.description || `Commandez chez ${restaurant.name} sur Let's Go Food.`,
      images: restaurant.image_url ? [{ url: restaurant.image_url }] : [],
    },

  };
}

export default async function RestaurantDetailPage({ params }) {
  const [restaurant, menuItems] = await Promise.all([
    getRestaurant(params.id),
    getMenu(params.id),
  ]);

  if (!restaurant) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image_url,
    servesCuisine: restaurant.cuisine_type,
    priceRange: '€€',
    ...(restaurant.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating,
        bestRating: 5,
      }
    } : {}),
    potentialAction: {
      '@type': 'OrderAction',
      target: `https://app.letsgofood.fr/restaurants/${restaurant.id}`,
    },
  };

  return (
    <>
      <Script
        id="restaurant-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantDetailClient
        restaurant={restaurant}
        initialMenuItems={menuItems}
      />
    </>
  );
}
