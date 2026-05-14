
import { DEV_HOSTS, PROD_DOMAINS, APP_MAPPING } from './env';

/**
 * LetsGoFood Kernel Security Guard
 */

export function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  // 1. Check Dev Hosts (Includes logic for flexible matching like Codespaces)
  const isDev = DEV_HOSTS.some(devHost => host.includes(devHost));
  if (isDev) return true;

  // 2. Check Production Domains (EndsWith logic for strict subdomain security)
  const isProd = PROD_DOMAINS.some(prodDomain => host.endsWith(prodDomain));
  if (isProd) return true;

  return false;
}

export function getAppType(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, '');

  // 1. Return 'development' for any authorized dev host
  if (DEV_HOSTS.some(devHost => host.includes(devHost))) {
    return 'development';
  }

  // 2. Strict mapping for production subdomains
  return APP_MAPPING[host] || 'unauthorized';
}
