import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { useApp } from "../context";
import { Button, Container, Img, Reveal, SectionHead, Eyebrow, Rich } from "./ui";
import { IMAGES } from "../data/images";
import { BRANCHES, DOCTORS } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 07 · CMO address ───────────────────────── */
export function CmoAddress() {
  const { t, openBooking } = useApp();
  const d = DOCTORS[0];
  return (
    <section id="founder" className="relative overflow-hidden bg-ind py-20 text-zirc lg:py-28">
      <div className="star-pattern-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <Container className="relative">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <Reveal className="lg:w-[38%]">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div aria-hidden className="absolute -bottom-4 -end-4 h-full w-full rounded-lg border border-turq" />
              <div className="relative overflow-hidden rounded-lg border border-silver/30 bg-night">
                <Img asset={IMAGES.founder} className="aspect-[4/5] w-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:w-[62%]">
            <Eyebrow index="04" onDark>
              {t({ ar: "كلمة المشرف الطبي العام والمؤسس", en: "Address from the Chief Medical Officer & Founder" })}
            </Eyebrow>
            <h2 className="font-display text-[28px] text-zirc sm:text-4xl lg:text-[44px]">
              <Rich text={t({ ar: "توحيد [[الجودة]] في منطقة بأكملها", en: "Unifying [[quality]] across an entire region" })} />
            </h2>
            <Quote className="mt-8 h-8 w-8 text-turq" />
            <div className="mt-3 space-y-4 text-base text-silver lg:text-lg">
              <p>
                {t({
                  ar: "أسّسنا إتقان على سؤال بسيط: لماذا يختلف مستوى الرعاية السنية بين مدينة وأخرى، وبين عيادة وأخرى في المجموعة الواحدة؟ الأسرة التي تنتقل بين الرياض ودبي والمنامة تستحق المعيار ذاته، والسجل ذاته، والاحترام ذاته.",
                  en: "We founded Itqan on a simple question: why does the level of dental care differ from one city to another, and from one clinic to another within the same group? A family moving between Riyadh, Dubai and Manama deserves the same standard, the same record and the same respect.",
                })}
              </p>
              <p>
                {t({
                  ar: "لذلك كتبنا ميثاقًا سريريًا واحدًا، وبنينا مختبرات مركزية، وربطنا الفروع بسجل مشفّر واحد. لا نَعِد بما لا يمكن قياسه؛ نَعِد بالالتزام، وبأن نُدقّق عملنا قبل أن يدقّقه غيرنا.",
                  en: "So we wrote one clinical charter, built central laboratories, and connected every branch to a single encrypted record. We do not promise what cannot be measured. We promise discipline, and to audit our own work before anyone else does.",
                })}
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-6 border-t border-turq/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-display text-2xl text-zirc">{t(d.name)}</div>
                <div className="mt-1 text-sm text-silver">{t(d.title)}</div>
                <div className="num mt-1 text-xs text-silver/80">{d.license} // PLACEHOLDER</div>
              </div>
              <Button variant="light" onClick={() => openBooking({ doctorId: d.id })}>
                {t({ ar: "احجز استشارة مع المؤسس", en: "Consult with the founder" })}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 08 · Board of medical directors ───────────────────────── */
export function Board() {
  const { t, openBooking } = useApp();
  const [active, setActive] = useState(0);
  const d = DOCTORS[active];
  const branch = BRANCHES.find((b) => b.id === d.branchId)!;
  const stripRef = useRef<HTMLDivElement>(null);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const strip = stripRef.current;
    const el = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !el) return;
    // Horizontal-only centering (never moves the page vertically); RTL-aware.
    const center = el.offsetLeft + el.offsetWidth / 2;
    const rtl = getComputedStyle(strip).direction === "rtl";
    const left = rtl
      ? center - strip.clientWidth / 2 - (strip.scrollWidth - strip.clientWidth)
      : center - strip.clientWidth / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const cta = t({
    ar: `حجز استشارة مع ${d.name.ar} في ${branch.city.ar}`,
    en: `Book a consultation with ${d.name.en} in ${branch.city.en}`,
  });

  return (
    <section id="board" className="bg-zirc py-20 lg:py-28">
      <Container>
        <SectionHead
          index="05"
          eyebrow={{ ar: "مجلس الاستشاريين ورؤساء الأقسام", en: "Board of Medical Directors" }}
          title={{ ar: "سبعة [[رؤساء أقسام]]، فرع لكل خبرة", en: "Seven department [[heads]], one branch for each expertise" }}
          lead={{
            ar: "اختر استشاريًا لتتعرف على فلسفته السريرية وزمالاته والفرع الذي يشرف عليه.",
            en: "Select a consultant to explore their clinical philosophy, fellowships and the branch they lead.",
          }}
        />

        {/* Mobile / tablet horizontal switcher */}
        <div
          ref={stripRef}
          className="no-scrollbar relative -mx-6 mt-10 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden"
          role="tablist"
          aria-label={t({ ar: "الاستشاريون", en: "Consultants" })}
        >
          {DOCTORS.map((x, i) => {
            const b = BRANCHES.find((y) => y.id === x.branchId)!;
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 rounded-lg border px-4 py-2.5 text-start transition-colors",
                  i === active ? "border-ind bg-ind text-zirc" : "border-silver text-night",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("num text-xs", i === active ? "text-silver" : "text-turq")}>0{i + 1}</span>
                  <span className="font-title whitespace-nowrap text-sm">{t(x.name)}</span>
                </span>
                <span className={cn("mt-0.5 block text-[11px]", i === active ? "text-silver" : "text-turq")}>{t(b.city)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 lg:mt-14 lg:grid lg:grid-cols-5 lg:gap-10">
          {/* Showcase — 60% */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-lg bg-ind text-zirc lg:flex lg:min-h-[640px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-night lg:aspect-auto lg:w-[46%]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={d.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Img asset={d.image} className="h-full w-full object-cover" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-lg bg-ind/90 px-3 py-2 text-xs backdrop-blur">
                  <span className="flex items-center gap-1.5 text-zirc">
                    <BadgeCheck className="h-4 w-4 text-turq" />
                    <span className="num">{d.license}</span>
                  </span>
                  <span className="num text-silver">
                    {d.years}+ {t({ ar: "سنة خبرة", en: "yrs" })}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-1 flex-col p-6 sm:p-8"
                >
                  <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-turq px-3 py-1 text-xs font-ui text-zirc">
                    <span className="h-1.5 w-1.5 rounded-full bg-turq" />
                    {t(branch.lockup)}
                  </span>
                  <h3 className="font-display mt-5 text-3xl text-zirc lg:text-[34px]">{t(d.name)}</h3>
                  <p className="mt-1 text-sm text-silver">{t(d.title)}</p>
                  <p className="mt-0.5 text-sm font-ui text-zirc">{t(d.specialty)}</p>

                  <figure className="mt-6 border-s-2 border-turq ps-4">
                    <Quote className="mb-1 h-5 w-5 text-turq" />
                    <blockquote className="font-display text-lg text-zirc lg:text-xl" style={{ lineHeight: 1.6 }}>
                      {t(d.quote)}
                    </blockquote>
                  </figure>

                  <div className="mt-6">
                    <div className="mb-2 text-xs font-ui text-silver">{t({ ar: "الزمالات والاعتمادات الدولية", en: "International fellowships & accreditations" })}</div>
                    <ul className="space-y-2 border-t border-turq/40 pt-3">
                      {d.fellowships.map((f) => (
                        <li key={f.en} className="flex items-start gap-2.5 text-sm text-zirc/90">
                          <span className="mt-2 h-1 w-3 shrink-0 bg-turq" aria-hidden />
                          {t(f)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="light"
                    className="mt-8 w-full justify-between text-start lg:mt-auto"
                    onClick={() => openBooking({ doctorId: d.id })}
                  >
                    <span>{cta}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" />
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Roster — 40% */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="mb-3 flex items-center justify-between border-b border-ind pb-3 text-xs font-ui text-soft">
              <span>{t({ ar: "الفهرس الإقليمي", en: "Regional roster" })}</span>
              <span className="num">07</span>
            </div>
            <ul role="tablist" aria-orientation="vertical">
              {DOCTORS.map((x, i) => {
                const b = BRANCHES.find((y) => y.id === x.branchId)!;
                const on = i === active;
                return (
                  <li key={x.id} className="border-b border-silver">
                    <button
                      role="tab"
                      aria-selected={on}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      className={cn(
                        "group relative flex w-full items-center gap-5 px-3 py-[18px] text-start transition-colors duration-300",
                        on ? "bg-mist" : "hover:bg-mist/60",
                      )}
                    >
                      <span aria-hidden className={cn("absolute inset-y-0 start-0 w-[3px] bg-turq transition-transform duration-300", on ? "scale-y-100" : "scale-y-0")} />
                      <span className={cn("num w-7 text-sm", on ? "text-ind" : "text-turq")}>0{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("font-title block truncate text-base", on ? "text-ind" : "text-night")}>{t(x.name)}</span>
                        <span className="block truncate text-[13px] text-soft">{t(x.specialty)}</span>
                      </span>
                      <span className="shrink-0 rounded-lg border border-turq/60 px-2.5 py-0.5 text-xs font-ui text-turq" style={{ lineHeight: 1.6 }}>
                        {t(b.city)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-soft">
              {t({
                ar: "الأسماء والاعتمادات نموذجية // PLACEHOLDER وتخضع للتحقق من الجهات المرخِّصة قبل النشر.",
                en: "Names and credentials are illustrative // PLACEHOLDER and subject to verification by licensing bodies before publication.",
              })}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
