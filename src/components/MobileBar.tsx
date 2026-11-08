import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useApp } from "../context";
import { UNIFIED_PHONE, WHATSAPP } from "../data/content";

/** Mobile sticky bottom bar — exactly three actions: call · book · WhatsApp. */
export function MobileBar() {
  const { t, openBooking } = useApp();
  return (
    <nav
      aria-label={t({ ar: "إجراءات سريعة", en: "Quick actions" })}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-silver bg-[#F4F5F7] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch gap-2 px-3 py-2">
        <a
          href={`tel:${UNIFIED_PHONE.tel}`}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-silver text-ind"
          aria-label={t({ ar: "اتصل بالرقم الموحد", en: "Call the unified number" })}
        >
          <Phone className="h-5 w-5" />
          <span className="text-[11px] font-ui" style={{ lineHeight: 1.2 }}>{t({ ar: "اتصال", en: "Call" })}</span>
        </a>
        <button
          onClick={() => openBooking()}
          className="flex min-h-12 flex-[1.7] items-center justify-center gap-2 rounded-lg bg-ind text-[15px] font-ui text-zirc"
        >
          <CalendarCheck className="h-5 w-5" />
          {t({ ar: "احجز موعدك", en: "Book a visit" })}
        </button>
        <a
          href={`https://wa.me/${WHATSAPP.wa}`}
          className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-silver text-ind"
          aria-label={t({ ar: "محادثة واتساب", en: "WhatsApp chat" })}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[11px] font-ui" style={{ lineHeight: 1.2 }}>{t({ ar: "واتساب", en: "WhatsApp" })}</span>
        </a>
      </div>
    </nav>
  );
}
