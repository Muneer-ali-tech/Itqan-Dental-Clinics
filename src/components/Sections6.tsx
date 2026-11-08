import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle, Mail, Phone, Plus, ShieldCheck } from "lucide-react";
import { useApp } from "../context";
import { Button, Container, Logo, Reveal, SectionHead, Eyebrow, Rich } from "./ui";
import { BRANCHES, COUNTRIES, EMAIL, FAQ, LICENSES, NAV, UNIFIED_PHONE, WHATSAPP } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 15 · FAQ ───────────────────────── */
export function Faq() {
  const { t, openBooking } = useApp();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-zirc py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="lg:w-[36%]">
            <div className="lg:sticky lg:top-32">
              <SectionHead
                index="12"
                eyebrow={{ ar: "الأسئلة الشائعة المؤسسية", en: "Network FAQ" }}
                title={{ ar: "إجابات [[واضحة]] عن الشبكة", en: "[[Clear]] answers about the network" }}
                lead={{
                  ar: "نقل الملفات بين المدن، توحيد الأسعار، والتغطية التأمينية المشتركة.",
                  en: "File transfers between cities, unified pricing and shared insurance coverage.",
                }}
              />
              <Reveal className="mt-8">
                <div className="rounded-lg border border-silver bg-mist p-5">
                  <div className="font-title text-base text-night">{t({ ar: "لم تجد إجابتك؟", en: "Didn't find your answer?" })}</div>
                  <p className="mt-1 text-sm text-soft">{t({ ar: "فريق التنسيق المركزي يرد خلال ساعات العمل.", en: "The central coordination team replies during working hours." })}</p>
                  <Button variant="ghost" className="mt-4 w-full" onClick={() => openBooking()}>
                    {t({ ar: "تحدّث مع فريق التنسيق", en: "Speak with coordination" })}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
          <div className="lg:w-[64%]">
            <ul className="border-t border-ind">
              {FAQ.map((f, i) => {
                const on = open === i;
                return (
                  <li key={f.q.en} className="border-b border-silver">
                    <h3>
                      <button
                        onClick={() => setOpen(on ? -1 : i)}
                        aria-expanded={on}
                        className="flex w-full items-start gap-4 py-6 text-start"
                      >
                        <span className="num pt-1 text-sm text-turq">0{i + 1}</span>
                        <span className={cn("font-title flex-1 text-base transition-colors sm:text-lg", on ? "text-ind" : "text-night")}>{t(f.q)}</span>
                        <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-300", on ? "rotate-45 border-ind bg-ind text-zirc" : "border-silver text-ind")}>
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-7 text-[15px] text-soft sm:ps-12 sm:text-base">{t(f.a)}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 16 · Universal call-to-mastery ───────────────────────── */
export function FinalCta() {
  const { t, openBooking } = useApp();
  return (
    <section id="book" className="relative overflow-hidden bg-ind py-20 text-zirc lg:py-28">
      <div className="star-pattern-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <Container className="relative">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="lg:w-1/2">
            <Eyebrow index="13" onDark>{t({ ar: "الدعوة الموحدة للحجز", en: "Universal call to mastery" })}</Eyebrow>
            <h2 className="font-display text-[30px] text-zirc sm:text-4xl lg:text-[48px]">
              <Rich text={t({ ar: "احجز موعدك الأول في [[ثوانٍ]]", en: "Book your first visit in [[seconds]]" })} />
            </h2>
            <p className="mt-5 max-w-lg text-base text-silver lg:text-lg">
              {t({
                ar: "اختر فرعك، وسيتولى فريق التنسيق المركزي البقية: ملف واحد، ورقم حجز موحد، ومتابعة في أي فرع.",
                en: "Choose your branch and the central coordination team handles the rest: one file, one booking reference, follow-up in any branch.",
              })}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="light" onClick={() => openBooking()} className="sm:min-w-52">
                {t({ ar: "ابدأ الحجز", en: "Start booking" })}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Button>
              <Button href={`https://wa.me/${WHATSAPP.wa}`} variant="outline-light">
                <MessageCircle className="h-5 w-5" />
                {t({ ar: "واتساب", en: "WhatsApp" })}
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-3 text-sm font-ui text-silver">{t({ ar: "اختر فرعك للحجز المباشر", en: "Choose your branch to book directly" })}</div>
            <ul className="border-t border-turq/50">
              {BRANCHES.map((b, i) => (
                <li key={b.id} className="border-b border-turq/30">
                  <button
                    onClick={() => openBooking({ branchId: b.id })}
                    className="group flex w-full items-center gap-4 px-2 py-4 text-start transition-colors hover:bg-zirc/5"
                  >
                    <span className="num w-6 text-sm text-turq">0{i + 1}</span>
                    <span className="flex-1">
                      <span className="font-title block text-lg text-zirc">{t(b.city)}</span>
                      <span className="block text-sm text-silver">{t(b.name)}</span>
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-silver/50 text-zirc transition-colors group-hover:bg-zirc group-hover:text-ind">
                      <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 17 · Footer ───────────────────────── */
export function Footer() {
  const { t } = useApp();
  const noop = (e: React.MouseEvent) => e.preventDefault();
  const links = [
    { ar: "سياسة الخصوصية", en: "Privacy policy" },
    { ar: "حماية البيانات الصحية (PDPL · GDPR)", en: "Health-data protection (PDPL · GDPR)" },
    { ar: "الشروط والأحكام", en: "Terms & conditions" },
    { ar: "سياسة الإعلان الصحي", en: "Health advertising policy" },
    { ar: "إمكانية الوصول", en: "Accessibility" },
  ];
  return (
    <footer className="bg-night pb-28 pt-16 text-silver lg:pb-10 lg:pt-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="lg:w-[30%]">
            <Logo onDark />
            <p className="mt-5 text-sm">
              {t({
                ar: "عيادات إتقان لطب الأسنان — معيارٌ واحد للإتقان في كل فرع. صرح طبي مؤسسي في المملكة العربية السعودية والإمارات العربية المتحدة ومملكة البحرين.",
                en: "Itqan Dental Clinics — one standard of mastery in every branch. An institutional dental group in Saudi Arabia, the UAE and Bahrain.",
              })}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href={`tel:${UNIFIED_PHONE.tel}`} className="num flex items-center gap-3 text-zirc hover:text-silver" dir="ltr"><Phone className="h-4 w-4 text-turq" />{UNIFIED_PHONE.display}</a>
              <a href={`https://wa.me/${WHATSAPP.wa}`} className="num flex items-center gap-3 text-zirc hover:text-silver" dir="ltr"><MessageCircle className="h-4 w-4 text-turq" />{WHATSAPP.display}</a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-zirc hover:text-silver" dir="ltr"><Mail className="h-4 w-4 text-turq" />{EMAIL}</a>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-10 sm:flex-row sm:gap-8">
            {COUNTRIES.map((c) => (
              <div key={c.id} className="flex-1">
                <div className="mb-4 border-b border-turq/40 pb-3 font-title text-base text-zirc">{t(c.name)}</div>
                <ul className="space-y-3 text-sm">
                  {BRANCHES.filter((b) => b.country === c.id).map((b) => (
                    <li key={b.id}>
                      <span className="block text-zirc">{t(b.city)}</span>
                      <span className="text-silver">{t(b.name)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-lg border border-silver/20 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-ui text-zirc">
            <ShieldCheck className="h-5 w-5 text-turq" />
            {t({ ar: "التراخيص الصحية", en: "Health licences" })}
          </div>
          <ul className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            {LICENSES.map((l) => (
              <li key={l.reg} className="text-sm">
                <span className="num block text-zirc">{l.reg}</span>
                <span className="block text-xs">{t(l.country)}</span>
                <span className="num block text-xs text-silver/80">{l.no} // PLACEHOLDER</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-silver/20 pt-8 lg:flex-row lg:items-start lg:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.en}><a href="#" onClick={noop} className="hover:text-zirc">{t(l)}</a></li>
            ))}
            {NAV.slice(1, 3).map((n) => (
              <li key={n.id}><a href={`#${n.id}`} className="hover:text-zirc">{t(n.label)}</a></li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="flex items-center gap-2 text-sm text-silver">
              {t({ ar: "تم تطوير هذا الموقع من قبل", en: "This website was developed by" })}
              <a
                href="https://wa.me/967785539898"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t({ ar: "تواصل مع منير علي عبر واتساب", en: "Contact Munir Ali on WhatsApp" })}
                className="group inline-flex items-baseline gap-1.5"
              >
                <span
                  className="font-display inline-block border-b border-silver pb-[1px] text-base text-turq transition-colors duration-200 group-hover:border-turq group-hover:text-zirc"
                  style={{ lineHeight: 1.35 }}
                >
                  {t({ ar: "منير علي", en: "Munir Ali" })}
                </span>
                <MessageCircle className="h-4 w-4 translate-y-[2px] text-turq transition-transform duration-200 group-hover:scale-110" aria-hidden />
              </a>
            </p>
            <p className="num text-xs text-silver/70">© 2026 Itqan Dental Clinics. {t({ ar: "جميع الحقوق محفوظة", en: "All rights reserved" })}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
