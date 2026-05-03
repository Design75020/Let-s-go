/**
 * Tracking Utility for LetsGoFood CRM
 * Captures ref, src, and zone from URL and sends events to backend.
 */

export interface TrackingParams {
  ref: string | null;
  src: string | null;
  zone: string | null;
  camp: string | null;
}

export const getTrackingParams = (): TrackingParams => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Try to get from URL
  let ref = urlParams.get('ref');
  let src = urlParams.get('src');
  let zone = urlParams.get('zone');
  let camp = urlParams.get('camp');

  // If not in URL, check localStorage
  if (!ref) ref = localStorage.getItem('lgf_ref');
  if (!src) src = localStorage.getItem('lgf_src');
  if (!zone) zone = localStorage.getItem('lgf_zone');
  if (!camp) camp = localStorage.getItem('lgf_camp');

  // Update localStorage if we found new values
  if (urlParams.get('ref')) localStorage.setItem('lgf_ref', urlParams.get('ref')!);
  if (urlParams.get('src')) localStorage.setItem('lgf_src', urlParams.get('src')!);
  if (urlParams.get('zone')) localStorage.setItem('lgf_zone', urlParams.get('zone')!);
  if (urlParams.get('camp')) localStorage.setItem('lgf_camp', urlParams.get('camp')!);

  return { ref, src, zone, camp };
};

export const trackEvent = async (type: 'visit' | 'click' | 'lead' | 'order', customParams?: Partial<TrackingParams>) => {
  const params = getTrackingParams();
  const payload = {
    type,
    ...params,
    ...customParams,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Tracking failed:', err);
  }
};
