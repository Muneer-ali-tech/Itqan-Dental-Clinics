import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarClock, Gem, ScanLine, Sparkles, Users, X } from "lucide-react";
import { useApp, useIsDesktop } from "../context";
import { Img, Rich, StarMark } from "./ui";
import { IMAGES } from "../data/images";

const KEY = "itqan_offer_dismissed";
const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

const PRICES = [
  { c: "SAR", v: "500" },
  { c: "AED", v: "500" },
  { c: "BHD", v: "50" },
]; // PLACEHOLDER

export function OfferPopup() {
  const { t, isAr, openBooking, bookingOpen, menuOpen, chatOpen, setOfferShown } = useApp();
  const desktop = useIsDesktop();
  const [triggered, setTriggered] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(read);
  const closeRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // 30% scroll trigger
  useEffect(() => {
    if (dismissed || triggered) return;
    const check = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.3) setTriggered(true);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [dismissed, triggered]);

  const visible = triggered && !dismissed && !bookingOpen && !menuOpen && (desktop || !chatOpen);

  useEffect(() => {
    setOfferShown(visible);
    return () => setOfferShown(false);
  }, [visible, setOfferShown]);

  // Publish the mobile bar height so the chat launcher can float above it.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible || desktop) {
      root.style.setProperty("--offer-h", "0px");
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const apply = () => root.style.setProperty("--offer-h", `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--offer-h", "0px");
    };
  }, [visible, desktop]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    if (desktop) closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss, desktop]);

  const book = () => {
    dismiss();
    openBooking({ specialtyId: "preventive", family: true });
  };

  const benefits = [
    { i: ScanLine, l: { ar: "فحص رقمي ثلاثي الأبعاد شامل", en: "Comprehensive 3D digital examination" } },
    { i: Sparkles, l: { ar: "تنظيف مجهري معتمد", en: "Certified micro-cleaning" } },
    { i: Users, l: { ar: "لكافة أفراد العائلة في موعد واحد", en: "For the whole family in one visit" } },
    { i: CalendarClock, l: { ar: "صالحة في جميع الفروع الـ 12+", en: "Valid across all 12+ branches" } },
  ];

  return (
    <AnimatePresence>
      {visible && desktop && (
        <motion.div
          key="offer-desktop"
          className="fixed inset-0 z-[48] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-title"
        >
          <div className="absolute inset-0 bg-night/70 backdrop-blur-md" onClick={dismiss} aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative flex w-full max-w-[960px] overflow-hidden rounded-lg border border-silver/40 bg-zirc shadow-2xl shadow-night/60"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 z-20 h-1 bg-turq" />
            <button
              ref={closeRef}
              onClick={dismiss}
              aria-label={t({ ar: "إغلاق العرض", en: "Close offer" })}
              className="absolute end-4 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-lg border border-silver bg-zirc text-ind transition-colors hover:bg-ind hover:text-zirc"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Indigo statement panel */}
            <div className="relative flex w-[46%] flex-col justify-between overflow-hidden bg-ind p-10 text-zirc">
              <div className="star-pattern-dark absolute inset-0 opacity-70" aria-hidden />
              <StarMark onDark className="absolute -bottom-20 -start-20 h-72 w-72 opacity-15" />
              <div className="relative">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 rounded-lg border border-turq px-3 py-1.5 text-xs font-ui text-zirc"
                >
                  <Gem className="h-3.5 w-3.5 text-turq" />
                  {t({ ar: "امتياز الشبكة الموحد", en: "Unified network privilege" })}
                </motion.span>
                <motion.h2
                  id="offer-title"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="font-display mt-6 text-[32px] text-zirc"
                >
                  <Rich text={t({ ar: "باقة إتقان [[الوقائية]] الشاملة", en: "The Itqan [[Preventive]] Package" })} />
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-[15px] text-silver"
                >
                  {t({
                    ar: "لجميع الفروع: فحص رقمي ثلاثي الأبعاد وتنظيف مجهري معتمد لكافة أفراد العائلة.",
                    en: "Across every branch: a 3D digital examination and certified micro-cleaning for every family member.",
                  })}
                </motion.p>
              </div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="relative mt-10">
                <div className="mb-3 text-xs text-silver">{t({ ar: "للفرد الواحد، بعملة بلدك", en: "Per person, in your local currency" })}</div>
                <div className="flex gap-2" dir="ltr">
                  {PRICES.map((p) => (
                    <div key={p.c} className="flex-1 rounded-lg border border-silver/40 bg-night/40 px-3 py-3 text-center">
                      <div className="num text-[11px] text-silver">{p.c}</div>
                      <div className="font-display num text-2xl text-zirc" style={{ lineHeight: 1.2 }}>{p.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-silver/80">
                  {t({ ar: "بيانات العرض نموذجية // PLACEHOLDER — الشروط والأحكام تسري.", en: "Offer data is illustrative // PLACEHOLDER — terms and conditions apply." })}
                </div>
              </motion.div>
            </div>

            {/* Details panel */}
            <div className="flex flex-1 flex-col">
              <div className="relative h-44 shrink-0 overflow-hidden bg-mist">
                <Img asset={IMAGES.reception} className="h-full w-full object-cover" />
                <span className="absolute bottom-3 start-3 flex items-center gap-2 rounded-lg bg-zirc/95 px-3 py-1.5 text-xs font-ui text-ind backdrop-blur">
                  <BadgeCheck className="h-4 w-4 text-turq" />
                  {t({ ar: "ملف سريري موحد بين الفروع", en: "One clinical file across branches" })}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8">
                <div className="text-xs font-ui text-soft">{t({ ar: "ما تتضمنه الباقة", en: "What's included" })}</div>
                <ul className="mt-3 space-y-3">
                  {benefits.map((b, i) => (
                    <motion.li
                      key={b.l.en}
                      initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className="flex items-center gap-3 text-[15px] text-night"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-silver text-turq">
                        <b.i className="h-4 w-4" />
                      </span>
                      {t(b.l)}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <button
                    onClick={book}
                    className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-ind px-6 text-base font-ui text-zirc transition-colors hover:bg-ind-hover"
                  >
                    {t({ ar: "احجز باقتك الآن", en: "Reserve your package" })}
                    <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
                  </button>
                  <div className="mt-3 flex items-center justify-between text-xs text-soft">
                    <span>{t({ ar: "تقسيط متاح عبر Tabby وTamara", en: "Instalments available via Tabby & Tamara" })}</span>
                    <button onClick={dismiss} className="text-ind underline-offset-4 hover:underline">
                      {t({ ar: "ربما لاحقًا", en: "Maybe later" })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {visible && !desktop && (
        <motion.div
          key="offer-mobile"
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 90 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          ref={barRef}
          className="fixed inset-x-3 z-[48] sm:inset-x-6"
          style={{ bottom: 76 }}
          role="complementary"
          aria-label={t({ ar: "عرض مميز", en: "Featured offer" })}
        >
          <div className="relative overflow-hidden rounded-lg border border-silver bg-zirc shadow-2xl shadow-night/30">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-turq" />
            <div className="flex gap-3 p-4 pt-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ind">
                <StarMark onDark className="h-8 w-8" />
              </span>
              <div className="min-w-0 flex-1 pe-9">
                <div className="text-[11px] font-ui text-turq">{t({ ar: "امتياز الشبكة الموحد", en: "Network privilege" })}</div>
                <div className="font-title text-[15px] text-night">{t({ ar: "باقة إتقان الوقائية الشاملة لجميع الفروع", en: "Itqan Preventive Package, all branches" })}</div>
                <p className="mt-0.5 text-xs text-soft" style={{ lineHeight: 1.6 }}>
                  {t({ ar: "فحص رقمي ثلاثي الأبعاد وتنظيف مجهري لكافة أفراد العائلة.", en: "3D digital exam and micro-cleaning for the whole family." })}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-silver bg-mist px-4 py-3">
              <div className="num text-xs text-ind" dir="ltr">
                SAR 500 · AED 500 · BHD 50
              </div>
              <button onClick={book} className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-ind px-5 text-sm font-ui text-zirc">
                {t({ ar: "احجز الباقة", en: "Reserve" })}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </div>
            <button
              onClick={dismiss}
              aria-label={t({ ar: "إغلاق العرض", en: "Close offer" })}
              className="absolute end-1 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-ind"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-silver bg-zirc">
                <X className="h-4 w-4" />
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
