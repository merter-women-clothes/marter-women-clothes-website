export function trackMeta(event, parameters = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', event, parameters);
}

export function trackContact(method) {
  trackMeta('Contact', { contact_method: method });
}
