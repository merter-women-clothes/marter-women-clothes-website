export function trackMeta(event, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', event, parameters);
}

export function trackGoogle(event, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, parameters);
}

export function trackContact(method) {
  trackMeta('Contact', { contact_method: method });

  const eventName = method === 'whatsapp' ? 'whatsapp_click' : `${method}_click`;
  trackGoogle(eventName, { contact_method: method });
}
