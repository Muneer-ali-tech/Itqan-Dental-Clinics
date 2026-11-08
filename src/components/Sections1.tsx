import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { ArrowRight, CalendarCheck, MapPin, ShieldCheck, FileLock2 } from "lucide-react";
import { useApp } from "../context";
import { Button, Container, Img, Reveal, Rich, SectionHead, StarMark } from "./ui";
import { IMAGES } from "../data/images";
import { SPECIALTIES } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 02 · Hero ───────────────────────── */
export function Hero() {
  const { t, openBooking } = useApp();
  return (
    <section id="top" className="relative overflow-hidden bg-zirc">
      <div className="star-pattern pointer-events-none absolute inset-y-0 start-0 hidden w-1/3 opacity-40 lg:block" aria-hidden />
      <Container className="relative pb-14 pt-10 lg:pb-24 lg:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          <div className="lg:w-[46%]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center gap-3 text-[13px] font-ui text-soft">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="pulse-ring absolute inset-0 rounded-full bg-turq" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-turq" />
                </span>
                {t({ ar: "السعودية · الإمارات · البحرين — 12+ فرعًا", en: "Saudi Arabia · UAE · Bahrain — 12+ branches" })}
              </div>
              <h1 className="font-display text-[34px] sm:text-5xl lg:text-[56px] text-night">
                <Rich
                  text={t({
                    ar: "معيارٌ واحد لـ[[الإتقان]] في كل فرع",
                    en: "One standard of [[mastery]] in every branch",
                  })}
                />
              </h1>
              <p className="mt-6 max-w-xl text-base text-soft lg:text-lg">
                {t({
                  ar: "صرح طبي مؤسسي لطب الأسنان التخصصي، يوحّد البروتوكولات السريرية والمواد والمختبرات والسجل الطبي بين الرياض وجدة ودبي وأبوظبي والمنامة، لتجد الرعاية نفسها أينما كنت.",
                  en: "An institutional dental group that unifies clinical protocols, materials, laboratories and patient records across Riyadh, Jeddah, Dubai, Abu Dhabi and Manama, so you find the same care wherever you are.",
                })}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => openBooking()} className="sm:min-w-52">
                  <CalendarCheck className="h-5 w-5" />
                  {t({ ar: "احجز موعدك الأول", en: "Book your first visit" })}
                </Button>
                <Button href="#locator" variant="ghost">
                  <MapPin className="h-5 w-5" />
                  {t({ ar: "استكشف الفروع", en: "Explore branches" })}
                </Button>
              </div>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-silver pt-6 text-sm text-soft">
              {[
                { i: ShieldCheck, l: { ar: "مرخّصة من ثلاث جهات صحية", en: "Licensed by three health authorities" } },
                { i: FileLock2, l: { ar: "ملف سريري مشفّر وموحد", en: "One encrypted clinical record" } },
              ].map((f) => (
                <div key={f.l.en} className="flex items-center gap-2.5">
                  <f.i className="h-5 w-5 text-turq" />
                  {t(f.l)}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="relative lg:w-[54%]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-lg border border-silver bg-mist">
              <Img asset={IMAGES.hero} eager className="aspect-[4/3] w-full object-cover object-[60%_50%] lg:aspect-[5/4]" />
              <div className="absolute end-3 top-3 flex items-center gap-2 rounded-lg bg-zirc/95 px-3 py-1.5 text-xs font-ui text-ind backdrop-blur sm:end-5 sm:top-5">
                <span className="h-2 w-2 rounded-full bg-turq" />
                {t({ ar: "استشارة رقمية مباشرة", en: "Live digital consultation" })}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="relative -mt-8 mx-4 flex items-center gap-4 rounded-lg border border-silver bg-zirc p-4 shadow-xl shadow-night/10 sm:mx-6 lg:absolute lg:-bottom-8 lg:-start-10 lg:mx-0 lg:mt-0 lg:w-[330px]"
            >
              <StarMark className="h-12 w-12 shrink-0" />
              <div>
                <div className="font-title text-[15px] text-night">
                  {t({ ar: "ملف واحد، ثلاث دول", en: "One file, three countries" })}
                </div>
                <div className="text-[13px] text-soft">
                  {t({ ar: "يتبعك بين الفروع بموافقتك", en: "Follows you between branches, with your consent" })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 03 · Metrics ───────────────────────── */
function Counter({ to, decimals = 0, suffix = "", prefix = "" }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="num">
      {prefix}
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function Metrics() {
  const { t } = useApp();
  const items = [
    { to: 12, suffix: "+", label: { ar: "فرعًا عاملًا في ثلاث دول", en: "operating branches in three countries" } },
    { to: 480, suffix: "K+", label: { ar: "زيارة مراجِع موثقة سنويًا", en: "documented patient visits each year" } },
    { to: 3, suffix: "", label: { ar: "تراخيص صحية: MOH · DHA · NHRA", en: "health licences: MOH · DHA · NHRA" } },
    { to: 99.1, decimals: 1, suffix: "%", label: { ar: "رضا سريري وفق استبيان داخلي", en: "clinical satisfaction, internal survey" } },
  ];
  return (
    <section aria-label="Network metrics" className="bg-ind">
      <Container className="py-14 lg:py-20">
        <div className="mb-10 flex items-center gap-3 text-[13px] font-ui text-silver">
          <span aria-hidden className="h-px w-8 bg-turq" />
          {t({ ar: "مؤشرات الانتشار والاتساق السريري", en: "Network scale & clinical consistency" })}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-0">
          {items.map((m, i) => (
            <Reveal key={m.label.en} delay={i * 0.08}>
              <div className={cn("lg:px-8", i > 0 && "lg:border-s lg:border-turq/40", i === 0 && "lg:ps-0")}>
                <div className="font-display text-[40px] text-zirc sm:text-5xl lg:text-[56px]" style={{ lineHeight: 1.1 }}>
                  <Counter to={m.to} decimals={m.decimals} suffix={m.suffix} />
                </div>
                <div className="mt-3 text-sm text-silver">{t(m.label)}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-12 border-t border-turq/30 pt-5 text-xs text-silver/80">
          {t({
            ar: "بيانات نموذجية للعرض التقديمي // PLACEHOLDER. تُحدَّث بالأرقام المدققة قبل النشر وفق ضوابط الإعلان الصحي.",
            en: "Illustrative presentation data // PLACEHOLDER. To be replaced by audited figures before publication, in line with health-advertising rules.",
          })}
        </p>
      </Container>
    </section>
  );
}

/* ───────────────────────── 04 · Seven pillars ───────────────────────── */
export function Pillars() {
  const { t, other, openBooking } = useApp();
  return (
    <section id="pillars" className="bg-zirc py-20 lg:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead
            index="01"
            eyebrow={{ ar: "التخصصات السريرية السبعة", en: "The seven clinical pillars" }}
            title={{ ar: "سبعة تخصصات، [[بروتوكول]] واحد", en: "Seven specialties, one [[protocol]]" }}
            lead={{
              ar: "كل تخصص يُدار برئيس قسم، ويعمل وفق دليل سريري موحد يُطبَّق بالمعايير نفسها في كل فرع.",
              en: "Each specialty is led by a department head and follows a single clinical manual, applied to the same standard in every branch.",
            }}
          />
          <Reveal>
            <Button onClick={() => openBooking()} variant="ghost" className="shrink-0">
              {t({ ar: "احجز استشارة تقييم", en: "Book an assessment" })}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Button>
          </Reveal>
        </div>

        <ul className="mt-12 border-t border-silver">
          {SPECIALTIES.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.05 }}
              className="border-b border-silver"
            >
              <button
                type="button"
                onClick={() => openBooking({ specialtyId: s.id })}
                className="group relative flex w-full items-start gap-4 px-2 py-6 text-start transition-colors duration-300 hover:bg-mist sm:gap-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-6 lg:py-8"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-[3px] origin-top scale-y-0 bg-turq transition-transform duration-300 group-hover:scale-y-100"
                />
                <span className="num pt-1 text-sm text-turq lg:col-span-1">0{i + 1}</span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-silver bg-zirc text-ind transition-colors group-hover:border-ind group-hover:bg-ind group-hover:text-zirc lg:col-span-1 lg:justify-self-start">
                  <s.icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1 lg:col-span-4">
                  <span className="font-title block text-lg text-night lg:text-xl">{t(s.name)}</span>
                  <span className="mt-1 block text-[13px] text-turq">{other(s.name)}</span>
                </span>
                <span className="hidden text-[15px] text-soft lg:col-span-4 lg:block">{t(s.desc)}</span>
                <span className="hidden items-center justify-end gap-3 text-sm font-ui text-ind lg:col-span-2 lg:flex">
                  {t(s.tag)}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </span>
              </button>
              <p className="-mt-3 px-2 pb-6 ps-[calc(0.5rem+3.25rem+1rem)] text-sm text-soft sm:ps-[calc(0.5rem+3.25rem+1.5rem)] lg:hidden">
                {t(s.desc)}
              </p>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
