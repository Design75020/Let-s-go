const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://letsgofood-monorepo2-production.up.railway.app';

export default async function sitemap() {
  const baseUrl = 'https://app.letsgofood.fr';

  // Static public pages
  const staticPages = [
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Dynamic restaurant pages
  let restaurantPages = [];
  try {
    const res = await fetch(`${API_URL}/api/restaurants?limit=500`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (res.ok) {
      const data = await res.json();
      const restaurants = Array.isArray(data) ? data : (data.items || data.restaurants || []);
      restaurantPages = restaurants.map((r) => ({
        url: `${baseUrl}/restaurants/${r.id}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Sitemap: failed to fetch restaurants', err);
  }

  return [...staticPages, ...restaurantPages];
}
