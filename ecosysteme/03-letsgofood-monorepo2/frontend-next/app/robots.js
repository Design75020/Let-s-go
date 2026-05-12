export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/restaurants', '/restaurants/'],
        disallow: [
          '/login',
          '/register',
          '/cart',
          '/my-orders',
          '/orders/',
          '/profile',
          '/loyalty',
          '/admin',
          '/owner',
          '/driver',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://app.letsgofood.fr/sitemap.xml',
    host: 'https://app.letsgofood.fr',
  };
}
