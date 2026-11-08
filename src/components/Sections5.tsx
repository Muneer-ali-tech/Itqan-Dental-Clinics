import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Building2, Car, CheckCircle2, Clock, MapPin, Phone, Navigation, ShieldCheck, Users, Briefcase, KeyRound } from "lucide-react";
import { useApp } from "../context";
import { Button, Container, Reveal, SectionHead, StarMark, Eyebrow, Rich } from "./ui";
import { BRANCHES, COUNTRIES, INSURERS } from "../data/content";
import { cn } from "../utils/cn";

/* ───────────────────────── 12 · Insurance & financing ───────────────────────── */
const CUR = {
  SAR: { min: 500, max: 20000, step: 100, dec: 0, def: 4000 },
  AED: { min: 500, max: 20000, step: 100, dec: 0, def: 4000 },
  BHD: { min: 50, max: 2000, step: 10, dec: 0, def: 400 },
} as const;
type CurKey = keyof typeof CUR;

function Calculator() {
  const { t, openBooking } = useApp();
  const [cur, setCur] = useState<CurKey>("SAR");
  const [amount, setAmount] = useState<number>(CUR.SAR.def);
  const [provider, setProvider] = useState<"tabby" | "tamara">("tabby");
  const parts = provider === "tabby" ? 4 : 3;
  const c = CUR[cur];
  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: cur === "BHD" ? 3 : 2, maximumFractionDigits: cur === "BHD" ? 3 : 2 });
  const per = amount / parts;

  const changeCur = (k: CurKey) => {
    setCur(k);
    setAmount(CUR[k].def);
  };

  return (
    <div className="rounded-lg border border-silver bg-zirc p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-title text-lg text-night">{t({ ar: "حاسبة التقسيط", en: "Instalment calculator" })}</h3>
        <div role="group" className="flex gap-1 rounded-lg border border-silver p-0.5">
          {(Object.keys(CUR) as CurKey[]).map((k) => (
            <button
              key={k}
              onClick={() => changeCur(k)}
              aria-pressed={cur === k}
              className={cn("num rounded-md px-3 py-1.5 text-xs font-ui transition-colors", cur === k ? "bg-ind text-zirc" : "text-ind hover:bg-mist")}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between text-sm text-soft">
          <label htmlFor="amt">{t({ ar: "قيمة خطة العلاج", en: "Treatment plan value" })}</label>
          <span className="font-display num text-3xl text-ind" style={{ lineHeight: 1 }}>
            {cur} {amount.toLocaleString("en-US")}
          </span>
        </div>
        <input
          id="amt"
          type="range"
          className="plain mt-5 w-full"
          min={c.min}
          max={c.max}
          step={c.step}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="num mt-2 flex justify-between text-xs text-soft">
          <span>{c.min.toLocaleString("en-US")}</span>
          <span>{c.max.toLocaleString("en-US")}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {(["tabby", "tamara"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            aria-pressed={provider === p}
            className={cn("rounded-lg border px-4 py-3 text-start transition-colors", provider === p ? "border-ind bg-ind text-zirc" : "border-silver text-night hover:border-ind")}
          >
            <span className="font-title block text-base capitalize">{p === "tabby" ? "Tabby" : "Tamara"}</span>
            <span className={cn("text-xs", provider === p ? "text-silver" : "text-soft")}>
              {t({ ar: `${p === "tabby" ? 4 : 3} دفعات`, en: `${p === "tabby" ? 4 : 3} payments` })}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-mist p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-soft">{t({ ar: "قيمة الدفعة التقديرية", en: "Estimated instalment" })}</div>
            <div className="font-display num text-3xl text-night" style={{ lineHeight: 1.2 }}>
              {cur} {fmt(per)}
            </div>
          </div>
          <div className="num text-sm text-soft">× {parts}</div>
        </div>
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {Array.from({ length: parts }).map((_, i) => (
            <motion.span key={`${provider}-${i}`} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.06 }} className={cn("h-2 flex-1 origin-bottom rounded-sm", i === 0 ? "bg-ind" : "bg-silver")} />
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-soft">
        {t({
          ar: "تقدير توضيحي // PLACEHOLDER. تخضع الأهلية والشروط والموافقة لمزوّد خدمة التقسيط.",
          en: "Illustrative estimate // PLACEHOLDER. Eligibility, terms and approval are subject to the instalment provider.",
        })}
      </p>
      <Button onClick={() => openBooking()} className="mt-5 w-full">
        {t({ ar: "احجز استشارة لخطة علاج شفافة", en: "Book a consultation for a transparent plan" })}
      </Button>
    </div>
  );
}

export function Insurance() {
  const { t } = useApp();
  return (
    <section id="insurance" className="bg-zirc py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          <div className="lg:w-1/2">
            <SectionHead
              index="09"
              eyebrow={{ ar: "التأمين الخليجي الموحد والفوترة الشفافة", en: "Unified regional insurance & transparent billing" }}
              title={{ ar: "فاتورة [[واضحة]] قبل أن تبدأ العلاج", en: "A [[clear]] bill before treatment begins" }}
              lead={{
                ar: "ربط مباشر مع كبرى شركات التأمين، وموافقات مسبقة يتولاها فريق مركزي، وتقسيط بالريال والدرهم والدينار.",
                en: "Direct links with leading insurers, pre-authorisations handled by a central team, and instalments in riyal, dirham and dinar.",
              }}
            />
            <ul className="mt-10 border-t border-silver">
              {INSURERS.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05}>
                  <li className="flex items-center justify-between border-b border-silver py-5">
                    <div className="flex items-center gap-4">
                      <span className="num w-6 text-sm text-turq">0{i + 1}</span>
                      <span className="font-display text-2xl text-night">{t(s.name)}</span>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-ui text-soft">
                      <CheckCircle2 className="h-4 w-4 text-turq" />
                      {t({ ar: "فوترة مباشرة", en: "Direct billing" })}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <p className="mt-4 text-xs text-soft">
              {t({
                ar: "تختلف التغطية بحسب وثيقة كل مراجِع وشبكة الفرع. أسماء الشركات للتوضيح // PLACEHOLDER.",
                en: "Coverage varies by each patient's policy and branch network. Insurer names are illustrative // PLACEHOLDER.",
              })}
            </p>
          </div>
          <Reveal className="lg:w-1/2">
            <Calculator />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 13 · Family dental pass ───────────────────────── */
export function FamilyPass() {
  const { t, openBooking } = useApp();
  const [plan, setPlan] = useState<"family" | "corporate">("family");
  const plans = {
    family: {
      name: { ar: "عضوية العائلة", en: "Family pass" },
      price: "SAR 1,800 / AED 1,750 / BHD 180",
      per: { ar: "سنويًا · حتى 5 أفراد", en: "per year · up to 5 members" },
      features: [
        { ar: "فحص رقمي ثلاثي الأبعاد لكل فرد مرتين سنويًا", en: "3D digital examination for every member, twice a year" },
        { ar: "تنظيف مجهري معتمد لكل الأفراد", en: "Certified micro-polishing for all members" },
        { ar: "أولوية الحجز في جميع الفروع", en: "Priority booking in every branch" },
        { ar: "خصم على علاجات الأطفال والتقويم", en: "Reduced fees on pediatric care and orthodontics" },
      ],
    },
    corporate: {
      name: { ar: "عضوية الشركات", en: "Corporate pass" },
      price: "SAR 650 / AED 640 / BHD 65",
      per: { ar: "للموظف سنويًا · من 20 موظفًا", en: "per employee per year · from 20 staff" },
      features: [
        { ar: "فحص وقائي سنوي للموظفين في أقرب فرع", en: "Annual preventive check at the nearest branch" },
        { ar: "لوحة متابعة للموارد البشرية بلا بيانات سريرية", en: "HR dashboard with no clinical data shown" },
        { ar: "جلسات توعية صحية في مقر الشركة", en: "On-site oral health awareness sessions" },
        { ar: "فوترة شهرية موحدة بعملة الدولة", en: "Single monthly invoice in local currency" },
      ],
    },
  } as const;
  const p = plans[plan];
  return (
    <section id="pass" className="relative overflow-hidden bg-ind py-20 text-zirc lg:py-28">
      <div className="star-pattern-dark pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <Container className="relative">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-20">
          <Reveal className="lg:w-1/2">
            <motion.div
              whileHover={{ rotate: -1.5, y: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative mx-auto aspect-[1.586] w-full max-w-[460px] overflow-hidden rounded-lg border border-turq bg-night p-6 shadow-2xl shadow-night/50 sm:p-8"
            >
              <div className="star-pattern-dark absolute inset-0 opacity-60" aria-hidden />
              <StarMark onDark className="absolute -bottom-12 -end-12 h-56 w-56 opacity-25" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-2xl text-zirc">{t({ ar: "إتقان", en: "Itqan" })}</div>
                    <div className="text-[11px] font-ui text-silver">{t({ ar: "بطاقة عضوية العائلة", en: "Family Dental Pass" })}</div>
                  </div>
                  <StarMark onDark className="h-10 w-10" />
                </div>
                <div>
                  <div className="num mb-3 text-lg text-zirc" dir="ltr" style={{ letterSpacing: "0.18em" }}>
                    ITQ • 0000 • 0000
                  </div>
                  <div className="flex items-end justify-between text-xs text-silver">
                    <div>
                      <div className="text-[10px]">{t({ ar: "حامل البطاقة", en: "Cardholder" })}</div>
                      <div className="text-sm text-zirc">{t({ ar: "عائلة نموذجية", en: "Sample family" })}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-[10px]">{t({ ar: "صالحة في", en: "Valid at" })}</div>
                      <div className="num text-sm text-zirc">12+ {t({ ar: "فرعًا", en: "branches" })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>

          <Reveal delay={0.1} className="lg:w-1/2">
            <Eyebrow index="10" onDark>{t({ ar: "بطاقة عضوية عائلة إتقان", en: "Itqan Family Dental Pass" })}</Eyebrow>
            <h2 className="font-display text-[28px] text-zirc sm:text-4xl lg:text-[44px]">
              <Rich text={t({ ar: "رعاية وقائية [[سنوية]] تتبع العائلة", en: "[[Annual]] preventive care that follows the family" })} />
            </h2>
            <div role="tablist" className="mt-8 inline-flex rounded-lg border border-turq/60 p-1">
              {(["family", "corporate"] as const).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={plan === k}
                  onClick={() => setPlan(k)}
                  className={cn("flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-ui transition-colors", plan === k ? "bg-zirc text-ind" : "text-silver hover:text-zirc")}
                >
                  {k === "family" ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  {t(plans[k].name)}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={plan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="mt-6">
                  <div className="font-display num text-2xl text-zirc sm:text-3xl" style={{ lineHeight: 1.3 }}>{p.price}</div>
                  <div className="mt-1 text-sm text-silver">{t(p.per)}</div>
                </div>
                <ul className="mt-6 space-y-3 border-t border-turq/40 pt-6">
                  {p.features.map((f) => (
                    <li key={f.en} className="flex items-start gap-3 text-[15px] text-zirc/90">
                      <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-turq" />
                      {t(f)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="light" onClick={() => openBooking({ specialtyId: "preventive", family: true })}>
                {t({ ar: "اطلب عضوية العائلة", en: "Request the family pass" })}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Button>
              <span className="text-xs text-silver">{t({ ar: "أسعار نموذجية // PLACEHOLDER — الشروط تسري", en: "Sample pricing // PLACEHOLDER — terms apply" })}</span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── 14 · Locator ───────────────────────── */
export function Locator() {
  const { t, region, setRegion, openBooking } = useApp();
  const list = useMemo(() => BRANCHES.filter((b) => region === "all" || b.country === region), [region]);
  const [sel, setSel] = useState("ruh");
  useEffect(() => {
    if (!list.find((b) => b.id === sel)) setSel(list[0].id);
  }, [list, sel]);
  const b = BRANCHES.find((x) => x.id === sel) ?? list[0];
  const d = 0.011;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${b.lon - d * 1.6}%2C${b.lat - d * 0.8}%2C${b.lon + d * 1.6}%2C${b.lat + d * 0.8}&layer=mapnik&marker=${b.lat}%2C${b.lon}`;
  const tabs = [{ id: "all" as const, label: { ar: "كل الفروع", en: "All branches" } }, ...COUNTRIES.map((c) => ({ id: c.id, label: c.short }))];

  return (
    <section id="locator" className="bg-mist py-20 lg:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead
            index="11"
            eyebrow={{ ar: "محدد الفروع والوصول السريع", en: "Branch locator & concierge" }}
            title={{ ar: "فرع [[قريب]] منك في كل مدينة", en: "A [[nearby]] branch in every city" }}
            lead={{
              ar: "مواقف سيارات مخصصة وخدمة صف السيارات (Valet) في فروع مختارة.",
              en: "Dedicated parking and valet service at selected branches.",
            }}
          />
          <div role="tablist" className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                aria-selected={region === tb.id}
                onClick={() => setRegion(tb.id)}
                className={cn("min-h-11 shrink-0 rounded-lg border px-4 text-sm font-ui transition-colors", region === tb.id ? "border-ind bg-ind text-zirc" : "border-silver text-night hover:border-ind")}
              >
                {t(tb.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col overflow-hidden rounded-lg border border-silver bg-zirc lg:mt-12 lg:flex-row">
          <ul className="no-scrollbar flex max-h-none shrink-0 flex-col lg:max-h-[560px] lg:w-[34%] lg:overflow-y-auto lg:border-e lg:border-silver">
            {list.map((x, i) => (
              <li key={x.id} className="border-b border-silver last:border-b-0">
                <button
                  onClick={() => setSel(x.id)}
                  aria-pressed={sel === x.id}
                  className={cn("relative flex w-full items-start gap-4 p-5 text-start transition-colors", sel === x.id ? "bg-mist" : "hover:bg-mist/60")}
                >
                  <span aria-hidden className={cn("absolute inset-y-0 start-0 w-[3px] bg-turq transition-transform", sel === x.id ? "scale-y-100" : "scale-y-0")} />
                  <span className="num pt-0.5 text-sm text-turq">0{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-title block text-base text-night">{t(x.city)}</span>
                    <span className="block text-sm text-soft">{t(x.name)}</span>
                  </span>
                  {x.valet && <KeyRound className="mt-1 h-4 w-4 shrink-0 text-turq" aria-label="Valet" />}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex-1">
            <div className="relative h-[280px] bg-mist sm:h-[340px] lg:h-[350px]">
              <iframe
                key={b.id}
                title={t(b.lockup)}
                src={map}
                loading="lazy"
                className="h-full w-full border-0 grayscale-[35%]"
              />
              <div className="pointer-events-none absolute start-3 top-3 flex items-center gap-2 rounded-lg bg-ind px-3 py-1.5 text-xs font-ui text-zirc">
                <MapPin className="h-3.5 w-3.5 text-turq" />
                {t(b.city)}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-ind sm:text-2xl">{t(b.lockup)}</h3>
                  <span className="rounded-lg border border-turq/60 px-2.5 py-0.5 text-xs font-ui text-turq">
                    {t(COUNTRIES.find((c) => c.id === b.country)!.short)}
                  </span>
                </div>
                <dl className="mt-5 flex flex-col gap-4 text-sm sm:grid sm:grid-cols-2">
                  {[
                    { i: MapPin, v: b.address },
                    { i: Clock, v: b.hours },
                    { i: Car, v: b.parking },
                    { i: Building2, v: { ar: b.valet ? "خدمة صف السيارات (Valet) متوفرة" : "خدمة صف السيارات غير متوفرة حاليًا", en: b.valet ? "Valet service available" : "Valet service not currently available" } },
                  ].map((r, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <r.i className="mt-0.5 h-5 w-5 shrink-0 text-turq" />
                      <dd className="text-night">{t(r.v)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => openBooking({ branchId: b.id })} className="flex-1">
                    {t({ ar: "احجز في هذا الفرع", en: "Book at this branch" })}
                  </Button>
                  <Button href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lon}`} variant="ghost" className="flex-1">
                    <Navigation className="h-4 w-4" />
                    {t({ ar: "الاتجاهات", en: "Directions" })}
                  </Button>
                  <Button href={`tel:${b.phone.replace(/\s/g, "")}`} variant="ghost" className="flex-1">
                    <Phone className="h-4 w-4" />
                    <span className="num" dir="ltr">{b.phone}</span>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-soft">
          <ShieldCheck className="h-4 w-4 text-turq" />
          {t({ ar: "العناوين وأرقام الهاتف نموذجية // PLACEHOLDER.", en: "Addresses and phone numbers are illustrative // PLACEHOLDER." })}
        </p>
      </Container>
    </section>
  );
}
