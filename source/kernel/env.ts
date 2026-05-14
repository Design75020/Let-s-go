
/**
 * LetsGoFood Kernel Environment Configuration
 */

export const DEV_HOSTS = [
  'localhost',
  '127.0.0.1',
  'github.dev',
  'app.github.dev',
  'githubpreview',
  'vercel.app',
  'webcontainer.io',
  'stackblitz.io',
  'bolt.new'
];

export const PROD_DOMAINS = [
  'letsgofood.fr'
];

export const APP_MAPPING: Record<string, string> = {
  'letsgofood.fr': 'landing',
  'app.letsgofood.fr': 'client',
  'merchant.letsgofood.fr': 'merchant',
  'driver.letsgofood.fr': 'driver',
  'admin.letsgofood.fr': 'admin',
  'saas.letsgofood.fr': 'admin',
  'crm.letsgofood.fr': 'admin'
};
