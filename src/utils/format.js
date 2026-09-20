/**
 * Small formatting helpers shared across pages.
 */

/** Turns a phone number like "+91 00000 00000" into a tel: link value. */
export function toTelHref(phone) {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

/** Turns a phone number into a wa.me WhatsApp link. */
export function toWhatsAppHref(phone, message = '') {
  const digits = phone.replace(/[^\d]/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

/** Turns an ISO date ("2026-01-12") into "12 Jan 2026". Returns the
 * input unchanged if it isn't a valid date (e.g. still empty). */
export function formatDateLabel(isoDate) {
  if (!isoDate) return '';
  try {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
