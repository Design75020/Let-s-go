import { serverFetch } from '@/lib/api';
import RestaurantsClient from '@/components/restaurants/RestaurantsClient';

export const metadata = {
  title: "Restaurants — Commandez en ligne",
  description: "Découvrez tous nos restaurants partenaires et commandez vos repas préférés en ligne. Livraison rapide partout.",
  openGraph: {
    title: "Restaurants Let's Go Food",
    description: "Commandez en ligne chez les meilleurs restaurants.",
  },
};

export const revalidate = 60; // ISR: revalidate every 60s

async function getRestaurants() {
  try {
    return await serverFetch('/restaurants?is_open=true');
  } catch {
    return [];
  }
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* SEO-friendly H1 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>
          Nos restaurants
        </h1>
        <p className="text-muted-foreground mt-1">
          {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} disponible{restaurants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Client component for interactivity (search, filter) */}
      <RestaurantsClient initialRestaurants={restaurants} />
    </div>
  );
}
