/**
 * Utility for cross-domain navigation in the LetsGoFood ecosystem.
 * Handles switching between Acquisition, Product, Merchant, and Ops layers.
 */

import { DomainType } from '../types';

export const navigateToDomain = (domain: DomainType, navigate?: any) => {
  const hostname = window.location.hostname.toLowerCase();
  const isProduction = hostname.endsWith('letsgofood.fr');
  
  if (isProduction) {
    const subdomainMap: Record<DomainType, string> = {
      landing: 'www',
      app: 'app',
      merchant: 'merchant',
      driver: 'driver',
      admin: 'admin',
      crm: 'crm',
      saas: 'saas',
      agent: 'agent'
    };
    window.location.href = `https://${subdomainMap[domain]}.letsgofood.fr`;
    return;
  }

  // Preview / AI Studio / webcontainer logic
  if (navigate) {
    // If not production, use search params for routing simulate subdomains
    navigate({
      pathname: '/',
      search: `?view=${domain}`
    }, { replace: true });
  } else {
    // Fallback for non-react usage
    const url = new URL(window.location.href);
    url.searchParams.set('view', domain);
    window.location.href = url.toString();
  }
};
