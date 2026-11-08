import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsLeftRight, Quote } from "lucide-react";
import { useApp, type Bi } from "../context";
import { Button, Container, Img, Reveal, SectionHead, Badge } from "./ui";
import { BA_IMAGES, IMAGES } from "../data/images";
import { BRANCHES, CHARTER, CHARTER_MATRIX_ROWS } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 05 · Itqan Standard Charter ───────────────────────── */
export function Charter() {
  const { t, isAr } = useApp();
  const cities = [
    { id: "ruh", code: "RUH" },
    { id: "jed", code: "JED" },
    { id: "dxb", code: "DXB" },
    { id: "auh", code: "AUH" },
    { id: "bah", code: "BAH" },
  ];
  return (
    <section id="charter" className="bg-mist py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <Reveal className="lg:w-[42%]">
            <div className="relative lg:sticky lg:top-32">
              <div className="overflow-hidden rounded-lg border border-silver">
                <Img asset={IMAGES.reception} className="aspect-[4/5] w-full object-cover" />
              </div>
              <figure className="relative -mt-14 mx-4 rounded-lg bg-ind p-6 text-zirc shadow-xl shadow-night/20 sm:mx-8 lg:absolute lg:-bottom-8 lg:-end-8 lg:mx-0 lg:mt-0 lg:w-[88%]">
                <Quote className="mb-3 h-6 w-6 text-turq" />
                <blockquote className="font-display text-xl leading-relaxed lg:text-2xl" style={{ lineHeight: isAr ? 1.7 : 1.3 }}>
                  {t({
                    ar: "إن الله يحب إذا عمل أحدكم عملًا أن يتقنه",
                    en: "Allah loves that when one of you does a work, he perfects it.",
                  })}
                </blockquote>
                <figcaption className="mt-3 border-t border-turq/50 pt-3 text-xs text-silver">
                  {t({ ar: "حديث شريف — القيمة التي سُمّيت بها المجموعة", en: "Prophetic tradition — the value this group is named after" })}
                </figcaption>
              </figure>
            </div>
          </Reveal>

          <div className="lg:w-[58%] lg:pt-2">
            <SectionHead
              index="02"
              eyebrow={{ ar: "ميثاق إتقان", en: "The Itqan Standard Charter" }}
              title={{ ar: "معيار سريري واحد [[لا يتغير]]", en: "One clinical standard that [[never changes]]" }}
              lead={{
                ar: "أربعة التزامات مكتوبة تُطبَّق بالحرف في كل فرع، وتخضع لتدقيق داخلي دوري تُرفع نتائجه إلى المشرف الطبي العام.",
                en: "Four written commitments applied word for word in every branch, audited internally on a regular cycle and reported to the Chief Medical Officer.",
              }}
            />
            <ol className="mt-10 border-t border-silver">
              {CHARTER.map((c, i) => (
                <Reveal key={c.n} delay={i * 0.06}>
                  <li className="flex gap-5 border-b border-silver py-6">
                    <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ind text-base text-ind" style={{ lineHeight: 1 }}>
                      {c.n}
                    </span>
                    <div>
                      <h3 className="font-title text-lg text-night">{t(c.title)}</h3>
                      <p className="mt-1 text-[15px] text-soft">{t(c.desc)}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* Conformity matrix */}
        <Reveal className="mt-20 lg:mt-24">
          <div className="overflow-hidden rounded-lg border border-silver bg-zirc">
            <div className="flex flex-col justify-between gap-2 border-b border-silver p-5 sm:flex-row sm:items-center lg:px-8">
              <h3 className="font-title text-lg text-night">
                {t({ ar: "مصفوفة المطابقة بين الفروع", en: "Branch conformity matrix" })}
              </h3>
              <span className="text-xs text-soft">
                {t({ ar: "تدقيق داخلي نموذجي // PLACEHOLDER", en: "Sample internal audit // PLACEHOLDER" })}
              </span>
            </div>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-silver text-soft">
                    <th className="px-5 py-3 text-start font-ui lg:px-8">{t({ ar: "البند", en: "Item" })}</th>
                    {cities.map((c) => {
                      const b = BRANCHES.find((x) => x.id === c.id)!;
                      return (
                        <th key={c.id} className="px-3 py-3 text-center font-ui">
                          <span className="num block text-ind">{c.code}</span>
                          <span className="block text-[11px] font-normal text-soft">{t(b.city)}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {CHARTER_MATRIX_ROWS.map((r: Bi) => (
                    <tr key={r.en} className="border-b border-silver last:border-0 hover:bg-mist/60">
                      <td className="px-5 py-3.5 text-night lg:px-8">{t(r)}</td>
                      {cities.map((c) => (
                        <td key={c.id} className="px-3 py-3.5 text-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ind text-zirc">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── 06 · Before / After ───────────────────────── */
interface Case {
  id: string;
  type: Bi;
  branch: string;
  duration: Bi;
  materials: Bi;
  note: Bi;
  before: ReactNode;
  after: ReactNode;
}

const baImg = (a: (typeof BA_IMAGES)["implant"]["before"]) => (
  <Img asset={a} className="h-full w-full object-cover" />
);

const CASES: Case[] = [
  {
    id: "implant", type: { ar: "زراعة سن", en: "Dental implant" }, branch: "ruh",
    duration: { ar: "5 أشهر", en: "5 months" },
    materials: { ar: "زرعة تيتانيوم سويسرية + تاج زركونيا", en: "Swiss titanium implant + zirconia crown" },
    note: { ar: "تخطيط موجّه ثلاثي الأبعاد وجراحة بفتحة صغيرة.", en: "3D-guided planning and minimally invasive surgery." },
    before: baImg(BA_IMAGES.implant.before),
    after: baImg(BA_IMAGES.implant.after),
  },
  {
    id: "zirconia", type: { ar: "عدسات زركونيا", en: "Zirconia veneers" }, branch: "dxb",
    duration: { ar: "3 زيارات · 14 يومًا", en: "3 visits · 14 days" },
    materials: { ar: "عدسات زركونيا مصنّعة بالمختبر المركزي", en: "Zirconia veneers made in the central lab" },
    note: { ar: "تصميم رقمي للابتسامة بموافقة المراجع قبل التصنيع.", en: "Digital smile design approved by the patient before fabrication." },
    before: baImg(BA_IMAGES.veneers.before),
    after: baImg(BA_IMAGES.veneers.after),
  },
  {
    id: "aligner", type: { ar: "تقويم شفاف", en: "Clear aligners" }, branch: "bah",
    duration: { ar: "9 أشهر", en: "9 months" },
    materials: { ar: "تقويم شفاف مخصص + مرفقات ضوئية", en: "Custom clear aligners + bonded attachments" },
    note: { ar: "محاكاة رقمية مسبقة لمسار حركة الأسنان.", en: "Digital pre-simulation of the tooth movement path." },
    before: baImg(BA_IMAGES.aligners.before),
    after: baImg(BA_IMAGES.aligners.after),
  },
  {
    id: "whitening", type: { ar: "تبييض", en: "Whitening" }, branch: "ruh",
    duration: { ar: "جلسة واحدة · 60 دقيقة", en: "1 session · 60 min" },
    materials: { ar: "تبييض مكتبي بإشراف الطبيب", en: "Clinician-supervised in-office whitening" },
    note: { ar: "درجة اللون: A3 إلى B1 على مقياس VITA — تختلف الاستجابة.", en: "Shade: A3 to B1 on the VITA scale — response varies." },
    before: baImg(BA_IMAGES.whitening.before),
    after: baImg(BA_IMAGES.whitening.after),
  },
];

function CompareSlider({ before, after }: { before: ReactNode; after: ReactNode }) {
  const { t } = useApp();
  const [pos, setPos] = useState(50);
  return (
    <div dir="ltr" className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-lg border border-silver bg-mist">
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>
      <span className="absolute start-3 top-3 rounded-lg bg-night/80 px-3 py-1 text-xs font-ui text-zirc backdrop-blur">
        {t({ ar: "قبل", en: "Before" })}
      </span>
      <span className="absolute end-3 top-3 rounded-lg bg-ind/90 px-3 py-1 text-xs font-ui text-zirc backdrop-blur">
        {t({ ar: "بعد", en: "After" })}
      </span>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-zirc" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-silver bg-zirc text-ind shadow-lg">
          <ChevronsLeftRight className="h-5 w-5" />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={t({ ar: "منزلق المقارنة بين قبل وبعد", en: "Before and after comparison slider" })}
        className="cmp absolute inset-0 h-full w-full opacity-0"
      />
    </div>
  );
}

export function BeforeAfter() {
  const { t, openBooking } = useApp();
  const [active, setActive] = useState(0);
  const c = CASES[active];
  const branch = BRANCHES.find((b) => b.id === c.branch)!;
  return (
    <section id="results" className="bg-zirc py-20 lg:py-28">
      <Container>
        <SectionHead
          index="03"
          eyebrow={{ ar: "قبل وبعد", en: "Before & after" }}
          title={{ ar: "نتائج سريرية [[موثقة]] بمعيار واحد", en: "Standardized, [[documented]] clinical results" }}
          lead={{
            ar: "أربع حالات من الرياض ودبي والمنامة، تُوثَّق بالزاوية والإضاءة نفسها. اسحب المنزلق للمقارنة.",
            en: "Four cases from Riyadh, Dubai and Manama, documented with identical angle and lighting. Drag the slider to compare.",
          }}
        />
        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="lg:w-[62%]">
            <AnimatePresence mode="wait">
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CompareSlider before={c.before} after={c.after} />
              </motion.div>
            </AnimatePresence>
            <p className="mt-4 text-xs text-soft">
              {t({
                ar: "صور تعبيرية للعرض — تختلف النتائج من حالة لأخرى.",
                en: "Illustrative images — results vary between cases.",
              })}
            </p>
          </div>

          <div className="lg:w-[38%]">
            <div role="tablist" className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-silver lg:px-0 lg:pb-0">
              {CASES.map((x, i) => {
                const b = BRANCHES.find((y) => y.id === x.branch)!;
                return (
                  <button
                    key={x.id}
                    role="tab"
                    aria-selected={i === active}
                    onClick={() => setActive(i)}
                    className={cn(
                      "flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-start transition-colors lg:rounded-none lg:border-0 lg:border-b lg:border-silver lg:px-3 lg:py-4",
                      i === active ? "border-ind bg-ind text-zirc lg:bg-mist lg:text-night" : "border-silver text-night hover:bg-mist",
                    )}
                  >
                    <span className={cn("num text-xs", i === active ? "text-silver lg:text-turq" : "text-turq")}>0{i + 1}</span>
                    <span className="font-title whitespace-nowrap text-[15px] lg:text-base">{t(x.type)}</span>
                    <span className={cn("ms-auto whitespace-nowrap text-xs", i === active ? "text-silver lg:text-turq" : "text-turq")}>{t(b.city)}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.dl
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 rounded-lg border border-silver bg-mist p-5 text-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <dt className="text-soft">{t({ ar: "الفرع", en: "Branch" })}</dt>
                  <dd><Badge>{t(branch.lockup)}</Badge></dd>
                </div>
                {[
                  { k: { ar: "مدة العلاج", en: "Duration" }, v: c.duration },
                  { k: { ar: "المواد", en: "Materials" }, v: c.materials },
                  { k: { ar: "ملاحظة سريرية", en: "Clinical note" }, v: c.note },
                ].map((r) => (
                  <div key={r.k.en} className="border-t border-silver py-3">
                    <dt className="text-xs text-soft">{t(r.k)}</dt>
                    <dd className="mt-0.5 text-night">{t(r.v)}</dd>
                  </div>
                ))}
              </motion.dl>
            </AnimatePresence>
            <Button
              onClick={() => openBooking({ branchId: c.branch })}
              className="mt-4 w-full"
            >
              {t({ ar: "احجز تقييمًا في هذا الفرع", en: "Book an assessment at this branch" })}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
