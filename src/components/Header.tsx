import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, X, MessageCircle, ArrowRight } from "lucide-react";
import { useApp, type RegionId } from "../context";
import { cn } from "../utils/cn";
import { Button, Logo, WRAP } from "./ui";
import { COUNTRIES, NAV, SPECIALTIES, UNIFIED_PHONE, WHATSAPP } from "../data/content";

export function LangToggle({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { lang, setLang } = useApp();
  const seg = (l: "ar" | "en", label: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      aria-label={l === "ar" ? "العربية" : "English"}
      className={cn(
        "num flex items-center justify-center rounded-md font-ui transition-colors duration-200",
        size === "sm" ? "h-7 w-9 text-xs" : "h-8 w-10 text-[13px]",
        lang === l ? "bg-ind text-zirc" : "text-ind hover:bg-mist",
      )}
      style={{ lineHeight: 1 }}
    >
      {label}
    </button>
  );
  return (
    <div
      dir="ltr"
      role="group"
      aria-label="Language"
      className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-silver bg-zirc p-0.5", className)}
    >
      {seg("ar", "AR")}
      <span className="h-3 w-px bg-silver" aria-hidden />
      {seg("en", "EN")}
    </div>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RegionSelector({ variant = "bar" }: { variant?: "bar" | "menu" }) {
  const { t, region, setRegion, setMenuOpen } = useApp();
  const pick = (r: RegionId) => {
    setRegion(r);
    setMenuOpen(false);
    window.setTimeout(() => scrollToId("locator"), 120);
  };
  if (variant === "menu") {
    return (
      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(c.id)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-ui transition-colors",
              region === c.id ? "border-ind bg-ind text-zirc" : "border-silver text-ind hover:border-ind",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", region === c.id ? "bg-silver" : "bg-turq")} />
            {t(c.short)}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t({ ar: "محدد الفروع", en: "Branch selector" })}>
      {COUNTRIES.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => pick(c.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-ui transition-colors",
            region === c.id ? "bg-zirc text-ind" : "text-silver hover:text-zirc",
          )}
          style={{ lineHeight: 1.5 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-turq" />
          {t(c.short)}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t, openBooking, menuOpen, setMenuOpen } = useApp();
  const [dd, setDd] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-silver bg-zirc/95 backdrop-blur-md">
        {/* Desktop utility strip */}
        <div className="hidden bg-ind lg:block">
          <div className={cn(WRAP, "flex h-10 items-center justify-between")}>
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-ui text-silver">{t({ ar: "اختر دولتك:", en: "Your country:" })}</span>
              <RegionSelector />
            </div>
            <div className="flex items-center gap-6 text-[12px] text-silver">
              <span className="num">MOH · DHA · NHRA</span>
              <a href={`tel:${UNIFIED_PHONE.tel}`} className="num flex items-center gap-2 text-zirc hover:text-silver" dir="ltr">
                <Phone className="h-3.5 w-3.5" /> {UNIFIED_PHONE.display}
              </a>
            </div>
          </div>
        </div>

        {/* Mobile header — logo · language capsule · hamburger (no booking button) */}
        <div className="lg:hidden">
          <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
            <a href="#top" className="h-10 max-w-[140px] min-w-0 shrink" aria-label={t({ ar: "عيادات إتقان", en: "Itqan Dental Clinics" })}>
              <Logo compact className="h-10" />
            </a>
            <div className="flex shrink-0 items-center gap-2">
              <LangToggle size="sm" />
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={t({ ar: "القائمة", en: "Menu" })}
                aria-expanded={menuOpen}
                className="flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-silver text-ind"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop main bar */}
        <div className={cn(WRAP, "hidden h-[76px] items-center justify-between gap-8 lg:flex")}>
          <a href="#top" aria-label={t({ ar: "عيادات إتقان", en: "Itqan Dental Clinics" })}>
            <Logo />
          </a>
          <nav className="flex items-center gap-1" aria-label="Primary">
            {NAV.map((n) =>
              n.id === "pillars" ? (
                <div key={n.id} className="relative" onMouseEnter={() => setDd(true)} onMouseLeave={() => setDd(false)}>
                  <button
                    type="button"
                    onClick={() => setDd((v) => !v)}
                    aria-expanded={dd}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-ui text-night transition-colors hover:bg-mist"
                  >
                    {t(n.label)}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", dd && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {dd && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute start-0 top-full z-50 w-[560px] pt-2"
                      >
                        <div className="rounded-lg border border-silver bg-zirc p-3 shadow-xl shadow-night/10">
                          <div className="grid grid-cols-2 gap-1">
                            {SPECIALTIES.map((s, i) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setDd(false);
                                  openBooking({ specialtyId: s.id });
                                }}
                                className="group flex items-start gap-3 rounded-lg p-3 text-start transition-colors hover:bg-mist"
                              >
                                <span className="num mt-0.5 text-xs text-turq">0{i + 1}</span>
                                <span className="text-sm text-night" style={{ lineHeight: 1.6 }}>
                                  {t(s.name)}
                                </span>
                              </button>
                            ))}
                          </div>
                          <a
                            href="#pillars"
                            onClick={() => setDd(false)}
                            className="mt-2 flex items-center justify-between rounded-lg border-t border-silver px-3 pt-3 text-sm font-ui text-ind"
                          >
                            {t({ ar: "عرض التخصصات السبعة", en: "View all seven specialties" })}
                            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  className="rounded-lg px-3 py-2 text-[15px] font-ui text-night transition-colors hover:bg-mist"
                >
                  {t(n.label)}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Button onClick={() => openBooking()} className="min-h-11 px-5">
              {t({ ar: "احجز موعدك", en: "Book a visit" })}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

export function MobileMenu() {
  const { t, menuOpen, setMenuOpen, openBooking } = useApp();
  const close = () => setMenuOpen(false);
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="menu"
          role="dialog"
          aria-modal="true"
          aria-label={t({ ar: "القائمة الرئيسية", en: "Main menu" })}
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-[#F4F5F7]/98 backdrop-blur-md lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 sm:px-6">
            <div className="h-10 max-w-[140px] min-w-0 shrink">
              <Logo compact className="h-10" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LangToggle size="sm" />
              <button
                type="button"
                onClick={close}
                aria-label={t({ ar: "إغلاق القائمة", en: "Close menu" })}
                className="flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg border border-silver text-ind"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-6 pb-10 pt-4 sm:px-10">
            <nav className="border-t border-silver" aria-label="Mobile">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={close}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.045 }}
                  className="flex min-h-14 items-center gap-4 border-b border-silver py-3 text-night"
                >
                  <span className="num w-6 text-sm text-turq">0{i + 1}</span>
                  <span className="font-title text-xl">{t(n.label)}</span>
                  <ArrowRight className="ms-auto h-5 w-5 text-silver rtl:-scale-x-100" />
                </motion.a>
              ))}
            </nav>

            <div className="mt-8">
              <div className="mb-3 text-[13px] font-ui text-soft">
                {t({ ar: "اختر الدولة والفرع", en: "Choose your country & branch" })}
              </div>
              <RegionSelector variant="menu" />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button onClick={() => openBooking()} className="w-full">
                {t({ ar: "احجز موعدك", en: "Book a visit" })}
              </Button>
              <div className="flex gap-3">
                <Button href={`tel:${UNIFIED_PHONE.tel}`} variant="ghost" className="flex-1">
                  <Phone className="h-4 w-4" />
                  <span className="num" dir="ltr">
                    {UNIFIED_PHONE.display}
                  </span>
                </Button>
                <Button href={`https://wa.me/${WHATSAPP.wa}`} variant="ghost" className="flex-1">
                  <MessageCircle className="h-4 w-4" />
                  {t({ ar: "واتساب", en: "WhatsApp" })}
                </Button>
              </div>
            </div>
            <p className="mt-auto pt-10 text-center text-sm text-soft">
              {t({ ar: "معيارٌ واحد للإتقان في كل فرع", en: "One standard of mastery." })}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
