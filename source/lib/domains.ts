/**
 * Utility for cross-domain navigation in the LetsGoFood ecosystem.
 * Handles switching between Acquisition, Product, Merchant, and Ops layers.
 */

import { useSearchParams } from 'react-router-dom';

export type DomainType = 'landing' | 'app' | 'merchant' | 'driver' | 'admin' | 'crm' | 'saas';

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
      saas: 'saas'
    };
    window.location.href = `https://${subdomainMap[domain]}.letsgofood.fr`;
    return;
  }

  // Preview / AI Studio / Vercel logic
  if (navigate) {
    // Force a fresh check by checking path
    const currentPath = window.location.pathname;
    const currentView = new URLSearchParams(window.location.search).get('view');
    
    if (currentPath !== '/' || currentView !== domain) {
      navigate({
        pathname: '/',
        search: `?view=${domain}`
      }, { replace: true });
    }
  } else {
    // Fallback for non-react usage
    const url = new URL(window.location.href);
    url.searchParams.set('view', domain);
    window.location.href = url.toString();
  }
};
