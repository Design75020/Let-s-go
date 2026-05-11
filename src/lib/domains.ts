/**
 * Utility for cross-domain navigation in the LetsGoFood ecosystem.
 * Handles switching between Acquisition, Product, Merchant, and Ops layers.
 */

export type DomainType = 'landing' | 'app' | 'merchant' | 'driver' | 'admin' | 'crm' | 'saas';

export const navigateToDomain = (domain: DomainType) => {
  const hostname = window.location.hostname.toLowerCase();
  const isProduction = hostname.endsWith('letsgofood.fr');
  const isPreview = hostname.includes('.run.app') || hostname.includes('localhost') || hostname.includes('vercel.app');

  if (isProduction) {
    const subdomainMap: Record<DomainType, string> = {
      landing: 'www',
      app: 'app',
      merchant: 'merchant',
      driver: 'driver',
      admin: 'admin',
      crm: 'crm',
      saas: 'saas'
    };
    window.location.href = `https://${subdomainMap[domain]}.letsgofood.fr`;
    return;
  }

  if (isPreview) {
    // In preview mode, we use query parameters to switch views within the same deployment
    const url = new URL(window.location.href);
    url.searchParams.set('view', domain);
    window.location.href = url.toString();
    return;
  }

  // Fallback
  console.warn(`[LetsGoFood] Unrecognized environment for navigation to ${domain}`);
};
