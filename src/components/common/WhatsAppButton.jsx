import { site } from '../../data/site';
import { toWhatsAppHref } from '../../utils/format';
import './WhatsAppButton.css';

// The floating button's own fixed greeting — deliberately distinct
// from Plan Your Trip's dynamically-built message (see
// pages/PlanTrip/index.jsx's buildMessage()), since this is a quick,
// no-form-filled "just say hi" entry point, not a trip request.
const GREETING = 'Hello Shivdev Holidays! I would like to know more about your cab and travel services.';

/**
 * Small floating WhatsApp button, fixed to the bottom-right corner —
 * a second, lighter-weight contact option alongside the header's
 * "Call Now" and the full Plan Your Trip form, for a visitor who just
 * wants to say hello before filling anything in. Reuses the same
 * centralized site.contact.whatsapp number and toWhatsAppHref() every
 * other WhatsApp link on the site already uses (see site.js), so
 * there's exactly one place to update the business number.
 */
export function WhatsAppButton() {
  const href = toWhatsAppHref(site.contact.whatsapp, GREETING);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Chat with Shivdev Holidays on WhatsApp"
      title="Chat with Shivdev Holidays on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.017 2.003c-5.523 0-10 4.477-10 10 0 1.762.464 3.483 1.345 5L2 22.003l5.146-1.35a9.96 9.96 0 0 0 4.871 1.25h.004c5.523 0 10-4.477 10-10 0-2.673-1.04-5.186-2.929-7.075a9.933 9.933 0 0 0-7.075-2.925zm5.907 15.907a8.28 8.28 0 0 1-5.911 2.448h-.003a8.28 8.28 0 0 1-4.226-1.157l-.303-.18-3.055.801.815-2.978-.197-.306a8.264 8.264 0 0 1-1.267-4.412c0-4.582 3.73-8.312 8.317-8.312a8.26 8.26 0 0 1 5.878 2.435 8.259 8.259 0 0 1 2.434 5.879 8.282 8.282 0 0 1-2.482 5.782z" />
      </svg>
    </a>
  );
}
