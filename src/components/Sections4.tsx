import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CloudCheck, Quote } from "lucide-react";
import { useApp } from "../context";
import { Container, Img, Reveal, SectionHead } from "./ui";
import { IMAGES } from "../data/images";
import { JOURNEY, TESTIMONIALS } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 09 · Patient journey ───────────────────────── */
export function Journey() {
  const { t } = useApp();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % JOURNEY.length), 4800);
    return () => window.clearInterval(id);
  }, [touched]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };
  const step = JOURNEY[active];
  const nodes = ["RUH", "JED", "DXB", "AUH", "BAH"];

  return (
    <section id="journey" className="bg-mist py-20 lg:py-28">
      <Container>
        <SectionHead
          index="06"
          eyebrow={{ ar: "رحلة المراجع الموحدة", en: "The standardized patient journey" }}
          title={{ ar: "خمس خطوات، [[رحلة]] واحدة في كل مدينة", en: "Five steps, one [[journey]] in every city" }}
        />

        {/* Desktop — horizontal */}
        <div className="mt-14 hidden lg:block">
          <div className="relative">
            <div className="absolute inset-x-6 top-6 h-px bg-silver" aria-hidden />
            <motion.div
              aria-hidden
              className="absolute start-6 top-6 h-px bg-ind"
              animate={{ width: `calc((100% - 3rem) * ${active / (JOURNEY.length - 1)})` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <ol className="relative flex justify-between">
              {JOURNEY.map((s, i) => (
                <li key={s.title.en} className="w-1/5">
                  <button type="button" onClick={() => pick(i)} className="group flex w-full flex-col items-start gap-4 text-start" aria-current={i === active}>
                    <span
                      className={cn(
                        "num flex h-12 w-12 items-center justify-center rounded-full border text-sm transition-colors duration-300",
                        i < active && "border-ind bg-ind text-zirc",
                        i === active && "border-turq bg-ind text-zirc ring-4 ring-turq/25",
                        i > active && "border-silver bg-mist text-soft group-hover:border-ind",
                      )}
                    >
                      {i < active ? <Check className="h-5 w-5" /> : `0${i + 1}`}
                    </span>
                    <span className={cn("font-title text-base transition-colors", i === active ? "text-ind" : "text-soft")}>{t(s.title)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex gap-10 rounded-lg border border-silver bg-zirc p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex w-3/5 gap-6"
              >
                <span className="font-display num text-6xl text-silver" style={{ lineHeight: 1 }}>0{active + 1}</span>
                <div>
                  <h3 className="font-display text-3xl text-night">{t(step.title)}</h3>
                  <p className="mt-3 max-w-lg text-base text-soft">{t(step.desc)}</p>
                  <span className="mt-4 inline-block rounded-lg border border-turq/60 px-3 py-1 text-xs font-ui text-turq">{t(step.meta)}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Shared record mock */}
            <div className="w-2/5 rounded-lg border border-silver bg-mist p-5">
              <div className="flex items-center justify-between text-xs text-soft">
                <span className="flex items-center gap-2"><CloudCheck className="h-4 w-4 text-turq" />{t({ ar: "السجل المشترك", en: "Shared record" })}</span>
                <span className="num">ITQ-0000-0000</span>
              </div>
              <div className="mt-4 flex gap-2">
                {nodes.map((n, i) => (
                  <motion.div
                    key={n}
                    animate={{ opacity: i <= active ? 1 : 0.35 }}
                    className="num flex-1 rounded-lg border border-ind bg-ind py-2 text-center text-xs text-zirc"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-xs text-soft">
                {t({ ar: "يتوفر الملف للفريق المعالج في الفرع الذي تختاره، بموافقتك.", en: "Your file is available to the treating team at the branch you choose, with your consent." })}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile — vertical */}
        <ol className="mt-10 lg:hidden">
          {JOURNEY.map((s, i) => (
            <Reveal key={s.title.en}>
              <li className="relative flex gap-4 pb-8 last:pb-0">
                {i < JOURNEY.length - 1 && <span aria-hidden className="absolute start-[23px] top-12 h-[calc(100%-3rem)] w-px bg-silver" />}
                <span className="num z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ind text-sm text-zirc">0{i + 1}</span>
                <div className="pt-1.5">
                  <h3 className="font-title text-lg text-night">{t(s.title)}</h3>
                  <p className="mt-1 text-[15px] text-soft">{t(s.desc)}</p>
                  <span className="mt-2 inline-block rounded-lg border border-turq/60 px-2.5 py-0.5 text-xs font-ui text-turq">{t(s.meta)}</span>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ───────────────────────── 10 · Central labs & sterilization ───────────────────────── */
export function Labs() {
  const { t } = useApp();
  const stats = [
    { v: "3", l: { ar: "مختبرات رقمية مركزية", en: "central digital labs" } },
    { v: "3–5", l: { ar: "أيام عمل لتصنيع التركيبة", en: "working days per restoration" } },
    { v: "100%", l: { ar: "حزم الأدوات مُتتبَّعة", en: "instrument packs traced" } },
  ];
  const stages = [
    { ar: "غسل آلي", en: "Automated wash" },
    { ar: "فحص مجهري", en: "Magnified inspection" },
    { ar: "تغليف مختوم", en: "Sealed packing" },
    { ar: "تعقيم Class B", en: "Class B cycle" },
    { ar: "سجل التتبّع", en: "Traceability log" },
  ];
  return (
    <section id="labs" className="bg-zirc py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="lg:w-1/2">
            <SectionHead
              index="07"
              eyebrow={{ ar: "المختبرات المركزية والتعقيم الفائق", en: "Central digital labs & Class B sterilization" }}
              title={{ ar: "من المسح الرقمي إلى [[التركيبة]]، تحت سقف واحد", en: "From digital scan to [[restoration]], under one roof" }}
              lead={{
                ar: "تُصنَّع التيجان والعدسات والجراحات الموجَّهة في مختبرات المجموعة بمواصفات واحدة، فتصل إلى كل فرع بالدقة ذاتها.",
                en: "Crowns, veneers and surgical guides are manufactured in the group's own labs to one specification, arriving at every branch with the same precision.",
              }}
            />
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-silver bg-silver sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l.en} className="col-span-1 bg-zirc p-5 first:col-span-2 sm:first:col-span-1">
                  <div className="font-display num text-3xl text-ind" style={{ lineHeight: 1.2 }}>{s.v}</div>
                  <div className="mt-1 text-xs text-soft">{t(s.l)}</div>
                </div>
              ))}
              <div className="col-span-2 bg-zirc p-5 sm:col-span-1">
                <div className="font-display text-3xl text-ind" style={{ lineHeight: 1.2 }}>CAD/CAM</div>
                <div className="mt-1 text-xs text-soft">{t({ ar: "طحن زركونيا رقمي", en: "digital zirconia milling" })}</div>
              </div>
            </div>
          </div>
          <Reveal className="lg:w-1/2">
            <div className="overflow-hidden rounded-lg border border-silver">
              <Img asset={IMAGES.lab} className="aspect-square w-full object-cover sm:aspect-[4/3]" />
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <div className="rounded-lg bg-ind p-6 text-zirc lg:p-10">
            <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <h3 className="font-display text-2xl lg:text-3xl">{t({ ar: "مسار التعقيم الفائق", en: "The sterilization pathway" })}</h3>
              <span className="text-sm text-silver">{t({ ar: "الإجراء نفسه في كل فرع، وبالترتيب نفسه", en: "The same procedure, in the same order, in every branch" })}</span>
            </div>
            <ol className="flex flex-col gap-0 sm:flex-row">
              {stages.map((s, i) => (
                <li key={s.en} className="relative flex flex-1 items-center gap-4 border-turq/40 py-4 sm:flex-col sm:items-start sm:gap-3 sm:border-t sm:py-0 sm:pe-4 sm:pt-5 max-sm:border-b max-sm:last:border-b-0">
                  <span aria-hidden className="absolute -top-[5px] start-0 hidden h-[9px] w-[9px] rounded-full bg-turq sm:block" />
                  <span className="num text-sm text-turq">0{i + 1}</span>
                  <span className="font-title text-base">{t(s)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── 11 · Testimonials ───────────────────────── */
export function Testimonials() {
  const { t, isAr } = useApp();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = TESTIMONIALS.length;
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % n), 8000);
    return () => window.clearInterval(id);
  }, [paused, n]);
  const x = TESTIMONIALS[i];
  const go = (d: number) => {
    setPaused(true);
    setI((v) => (v + d + n) % n);
  };
  return (
    <section id="voices" className="bg-mist py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="lg:w-[34%]">
            <SectionHead
              index="08"
              eyebrow={{ ar: "تجارب المراجعين الإقليمية", en: "Regional patient experiences" }}
              title={{ ar: "عائلات تنقّلت بين المدن بـ[[ملف]] واحد", en: "Families who moved between cities with one [[file]]" }}
            />
            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => go(-1)} aria-label={t({ ar: "السابق", en: "Previous" })} className="flex h-12 w-12 items-center justify-center rounded-lg border border-silver text-ind transition-colors hover:border-ind hover:bg-zirc">
                <ArrowRight className="h-5 w-5 ltr:hidden" />
                <ArrowLeft className="h-5 w-5 rtl:hidden" />
              </button>
              <button onClick={() => go(1)} aria-label={t({ ar: "التالي", en: "Next" })} className="flex h-12 w-12 items-center justify-center rounded-lg bg-ind text-zirc transition-colors hover:bg-ind-hover">
                <ArrowLeft className="h-5 w-5 ltr:hidden" />
                <ArrowRight className="h-5 w-5 rtl:hidden" />
              </button>
              <span className="num ms-3 text-sm text-soft">0{i + 1} / 0{n}</span>
            </div>
          </div>

          <div className="lg:w-[66%]">
            <div className="relative min-h-[360px] rounded-lg border border-silver bg-zirc p-6 sm:p-10 lg:min-h-[400px]">
              <Quote className="h-10 w-10 text-turq" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="font-display mt-6 text-xl text-night sm:text-2xl lg:text-[28px]" style={{ lineHeight: isAr ? 1.8 : 1.4 }}>
                    {t(x.text)}
                  </p>
                  <div className="mt-8 flex flex-col gap-4 border-t border-silver pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-ind text-lg text-zirc" style={{ lineHeight: 1 }}>
                        {t(x.name).replace(/^(عائلة|السيدة|م\.|Eng\.|Ms\.|The)\s*/, "").charAt(0)}
                      </span>
                      <div>
                        <div className="font-title text-base text-night">{t(x.name)}</div>
                        <div className="text-sm text-soft">{t(x.role)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-ui text-ind" aria-label="route">
                      <span>{t(x.from)}</span>
                      <span className="flex items-center" aria-hidden>
                        <span className="h-1.5 w-1.5 rounded-full bg-turq" />
                        <span className="h-px w-10 bg-turq" />
                        <ArrowRight className="-ms-1 h-4 w-4 text-turq rtl:-scale-x-100" />
                      </span>
                      <span>{t(x.to)}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-4 text-xs text-soft">
              {t({
                ar: "تُنشر الآراء بموافقة أصحابها، ومحتواها نموذجي // PLACEHOLDER، ولا تمثّل ضمانًا لنتائج مماثلة.",
                en: "Experiences are shared with consent; content is illustrative // PLACEHOLDER and does not guarantee similar outcomes.",
              })}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
