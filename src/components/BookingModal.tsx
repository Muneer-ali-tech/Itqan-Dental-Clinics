import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Users, X, Minus, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { useApp, type BookingPreset, type Bi } from "../context";
import { Button, StarMark } from "./ui";
import { BRANCHES, COUNTRIES, DOCTORS, SPECIALTIES, TIME_SLOTS } from "../data/content";
import { bookingApi, type BookingOutcome } from "../lib/booking-api";
import { cn } from "../utils/cn";

interface Form {
  name: string;
  cc: string;
  phone: string;
  email: string;
  country: string;
  branchId: string;
  specialtyId: string;
  doctorId: string;
  date: string;
  time: string;
  family: boolean;
  members: number;
  consService: boolean;
}

function initialForm(p: BookingPreset): Form {
  const doc = DOCTORS.find((d) => d.id === p.doctorId);
  const branchId = p.branchId ?? doc?.branchId ?? "";
  const branch = BRANCHES.find((b) => b.id === branchId);
  const country = branch?.country ?? "";
  const cc = COUNTRIES.find((c) => c.id === country)?.code ?? "+966";
  return {
    name: "",
    cc,
    phone: "",
    email: "",
    country,
    branchId,
    specialtyId: p.specialtyId ?? doc?.specialtyId ?? "",
    doctorId: p.doctorId ?? "",
    date: "",
    time: "",
    family: p.family ?? false,
    members: 3,
    consService: false,
  };
}

const inputCls =
  "h-12 w-full rounded-lg border border-silver bg-zirc px-4 text-[15px] text-night outline-none transition-colors placeholder:text-soft/60 focus:border-ind";

function Field({
  label,
  optional,
  error,
  children,
  hint,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  const { t } = useApp();
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-ui text-night">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-soft">{t({ ar: "اختياري", en: "Optional" })}</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-soft">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-[#9B2C3A]" role="alert">{error}</span>}
    </label>
  );
}

type Banner = {
  kind: "unconfirmed" | "refused" | "conflict";
  msg: Bi;
  hint?: Bi;
};

/** Contract-v1 wording: report acceptance, never appointment confirmation. */
function errorBi(code: string, fields?: Record<string, string>): Bi {
  if (fields?.date === "PAST_PREFERRED_TIME")
    return { ar: "يرجى اختيار وقت مستقبلي خلال 90 يومًا", en: "Please pick a future time within 90 days" };
  if (fields?.name) return { ar: "تحقق من صيغة الاسم المدخل", en: "Please check the entered name" };
  if (fields?.phone) return { ar: "تحقق من صيغة رقم الجوال", en: "Please check the mobile number format" };
  switch (code) {
    case "SENDER_NOT_CONFIGURED":
      return {
        ar: "خدمة الحجز غير مهيأة على الخادم بعد — أكمل TABAH_EXEC_URL و TABAH_INGEST_SECRET في ملف .env",
        en: "Booking service is not configured yet — set TABAH_EXEC_URL and TABAH_INGEST_SECRET in .env",
      };
    case "RECIPIENT_NOT_ALLOWED":
      return {
        ar: "البريد غير مدرج في قائمة عناوين الاختبار — أضفه إلى ALLOWED_EMAILS في إعدادات السكربت",
        en: "Email is not in the test allowlist — add it to ALLOWED_EMAILS in Script Properties",
      };
    case "CONTACT_SUPPRESSED":
      return {
        ar: "هذا البريد أوقف التواصل في التجربة — استخدم عنوانًا اختباريًا آخر",
        en: "This address stopped contact in the demo — use another test address",
      };
    case "SERVICE_CONSENT_REQUIRED":
      return {
        ar: "يلزم الموافقة على التواصل لإرسال الطلب",
        en: "Contact consent is required to send the request",
      };
    case "NOTHING_PENDING":
      return { ar: "لا يوجد إرسال معلّق لإعادة المحاولة", en: "No pending send to retry" };
    case "NETWORK":
      return {
        ar: "لم نتأكد من التسجيل بعد — تعذّر الاتصال بالخادم",
        en: "We haven't confirmed registration yet — server unreachable",
      };
    case "BAD_RESPONSE":
    case "RESPONSE_MISMATCH":
      return {
        ar: "استجابة غير متوقعة من نقطة الاستقبال — راجع النشر والصلاحيات",
        en: "Unexpected response from the intake endpoint — check deployment and access",
      };
    case "IDEMPOTENCY_CONFLICT":
      return {
        ar: "تعارض في معرف الحدث — أوقف المحاولة وراجع السجل",
        en: "Event id conflict — stop this attempt and review the log",
      };
    default:
      return {
        ar: `تعذّر إرسال الطلب (${code}) — راجع إعدادات الخادم`,
        en: `Could not send the request (${code}) — check server settings`,
      };
  }
}

function ConsentRow({
  checked,
  onToggle,
  disabled,
  label,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        checked ? "border-ind bg-mist" : "border-silver hover:border-ind",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
      />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
          checked ? "border-ind bg-ind text-zirc" : "border-silver bg-zirc",
        )}
        aria-hidden
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-sm text-night">{label}</span>
        {sub && <span className="mt-0.5 block text-xs text-soft">{sub}</span>}
      </span>
    </label>
  );
}

function Inner() {
  const { t, closeBooking, bookingPreset, isAr } = useApp();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>(() => initialForm(bookingPreset));
  const [err, setErr] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [locked, setLocked] = useState(false); // contact data frozen once an event was attempted
  const [attempt, setAttempt] = useState<{ reference: string | null; status: string | null }>({
    reference: null,
    status: null,
  });
  const [banner, setBanner] = useState<Banner | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const branch = BRANCHES.find((b) => b.id === f.branchId);
  const specialty = SPECIALTIES.find((s) => s.id === f.specialtyId);
  const doctor = DOCTORS.find((d) => d.id === f.doctorId);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeBooking]);

  const labels = [
    { ar: "بيانات الاتصال", en: "Contact" },
    { ar: "الفرع", en: "Branch" },
    { ar: "التخصص", en: "Specialty" },
    { ar: "الموعد", en: "Schedule" },
  ];

  const showRefused = (code: string, fields?: Record<string, string>) =>
    setBanner({ kind: "refused", msg: errorBi(code, fields) });

  /** Maps every contract outcome to UI state; accepted(complete) opens the receipt step. */
  const applyOutcome = (o: BookingOutcome, goReceipt: () => void) => {
    if (o.locked || o.sent) setLocked(true);
    if (o.accepted) {
      setAttempt({ reference: o.reference ?? null, status: o.status ?? null });
      setBanner(null);
      if (o.event === "complete" || o.status === "SUBMITTED") goReceipt();
      return;
    }
    if (o.unconfirmed) {
      setBanner({
        kind: "unconfirmed",
        msg: { ar: "لم نتأكد من التسجيل بعد", en: "We haven't confirmed registration yet" },
        hint: {
          ar: "أعد المحاولة بنفس الحدث؛ لن يتكرر الطلب ولا يُنشأ طلب جديد.",
          en: "Retry the same event; the request will not duplicate or re-create.",
        },
      });
      return;
    }
    if (o.conflict) {
      setBanner({
        kind: "conflict",
        msg: {
          ar: `تعارض في الإصدار: الحالة المصرح بها في النظام الآن «${o.status}»`,
          en: `Version conflict: authoritative status is now "${o.status}"`,
        },
        hint: {
          ar: "راجع الحالة ثم أعد اعتماد الإرسال بقرار جديد.",
          en: "Review the status, then submit again as a fresh decision.",
        },
      });
      return;
    }
    if (o.sent === false && o.reason === "NO_FOLLOWUP_CONSENT") {
      setBanner(null); // nothing was sent; single-shot create happens on final submit
      return;
    }
    if (o.error) showRefused(o.error.code, o.error.fields);
  };

  const sendStart = async () => {
    setSending(true);
    try {
      // Single documented consent (service). followup/review stay false unless
      // the operator later re-enables those optional message types in the UI.
      const o = await bookingApi.start({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: (f.cc + f.phone).replace(/[^0-9]/g, ""),
        consent: { service: f.consService, followup: false, review: false },
      });
      applyOutcome(o, () => setStep(2));
      if (o.accepted || o.unconfirmed || (o.sent === false && o.reason === "NO_FOLLOWUP_CONSENT"))
        setStep(2);
    } catch (e) {
      const err = e as { code: string; fields?: Record<string, string> };
      showRefused(err.code || "NETWORK", err.fields);
    } finally {
      setSending(false);
    }
  };

  const sendComplete = async () => {
    setSending(true);
    try {
      const o = await bookingApi.complete({ date: f.date, time: f.time });
      applyOutcome(o, () => setStep(5));
    } catch (e) {
      const err = e as { code: string; fields?: Record<string, string> };
      showRefused(err.code || "NETWORK", err.fields);
    } finally {
      setSending(false);
    }
  };

  const retry = async () => {
    setSending(true);
    try {
      const o = await bookingApi.retry();
      applyOutcome(o, () => setStep(5));
      if (o.accepted && o.event === "create") setBanner(null); // create settled; continue the form
    } catch (e) {
      const err = e as { code: string; fields?: Record<string, string> };
      showRefused(err.code || "NETWORK", err.fields);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (f.name.trim().length < 2) e.name = t({ ar: "يرجى إدخال الاسم الكامل", en: "Please enter your full name" });
      const digits = f.phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 12) e.phone = t({ ar: "يرجى إدخال رقم جوال صحيح", en: "Please enter a valid mobile number" });
      if (!f.email) e.email = t({ ar: "البريد مطلوب لإرسال إيصال الطلب التجريبي", en: "Email is required for the demo receipt" });
      else if (f.email.length > 120 || !/^\S+@\S+\.\S+$/.test(f.email))
        e.email = t({ ar: "صيغة البريد غير صحيحة", en: "Invalid email format" });
      if (!f.consService)
        e.consService = t({
          ar: "يلزم الموافقة على التواصل لإرسال الطلب",
          en: "Contact consent is required to send the request",
        });
      if (!f.country) {
        const c = COUNTRIES.find((x) => x.code === f.cc);
        if (c && !e.name && !e.phone && !e.email) set("country", c.id);
      }
    }
    if (step === 2 && !f.branchId) e.branch = t({ ar: "يرجى اختيار الفرع", en: "Please select a branch" });
    if (step === 3 && !f.specialtyId) e.specialty = t({ ar: "يرجى اختيار التخصص", en: "Please select a specialty" });
    if (step === 4) {
      if (!f.date) e.date = t({ ar: "يرجى اختيار التاريخ", en: "Please select a date" });
      if (!f.time) e.time = t({ ar: "يرجى اختيار الوقت", en: "Please select a time" });
    }
    setErr(e);
    if (Object.keys(e).length) return;
    if (step === 1) return void sendStart();
    if (step === 4) return void sendComplete();
    setStep((s) => s + 1);
  };

  const doctorsHere = DOCTORS.filter((d) => {
    const b = BRANCHES.find((x) => x.id === d.branchId);
    return !f.country || b?.country === f.country;
  });

  const summary: [string, string][] = [
    [t({ ar: "الاسم", en: "Name" }), f.name],
    [t({ ar: "الهاتف", en: "Phone" }), `${f.cc} ${f.phone}`],
    [t({ ar: "الفرع", en: "Branch" }), branch ? t(branch.lockup) : ""],
    [t({ ar: "التخصص", en: "Specialty" }), specialty ? t(specialty.name) : ""],
    [t({ ar: "الاستشاري", en: "Consultant" }), doctor ? t(doctor.name) : t({ ar: "أي استشاري متاح", en: "Any available consultant" })],
    [t({ ar: "الموعد", en: "Date & time" }), `${f.date} · ${f.time}`],
  ];
  if (f.family) summary.push([t({ ar: "استشارة عائلية", en: "Family consultation" }), `${f.members} ${t({ ar: "أفراد", en: "members" })}`]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={t({ ar: "حجز موعد", en: "Book an appointment" })}
    >
      <div className="absolute inset-0 bg-night/60 backdrop-blur-sm" onClick={closeBooking} aria-hidden />
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-lg bg-zirc shadow-2xl shadow-night/40 sm:max-w-[640px] sm:rounded-lg"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-silver px-5 pb-4 pt-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <StarMark className="h-9 w-9 shrink-0" />
              <div>
                <h2 className="font-title text-lg text-night">
                  {step === 5 ? t({ ar: "تم استلام طلب الحجز", en: "Booking request received" }) : t({ ar: "احجز موعدك", en: "Book your visit" })}
                </h2>
                {step < 5 && (
                  <p className="num text-xs text-soft">
                    {t({ ar: `الخطوة ${step} من 4 — ${labels[step - 1].ar}`, en: `Step ${step} of 4 — ${labels[step - 1].en}` })}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeBooking}
              aria-label={t({ ar: "إغلاق", en: "Close" })}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-silver text-ind transition-colors hover:bg-mist"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {step < 5 && (
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {labels.map((_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-sm bg-silver">
                  <motion.span className="block h-full bg-ind" initial={false} animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.35 }} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contract status banner (unconfirmed / refused / conflict) */}
        {banner && (
          <div
            className={cn(
              "mx-5 mt-4 flex items-start gap-3 rounded-lg border p-3 text-sm sm:mx-8",
              banner.kind === "refused"
                ? "border-[#9B2C3A]/40 bg-[#9B2C3A]/5 text-[#9B2C3A]"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700",
            )}
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-ui">{t(banner.msg)}</p>
              {banner.hint && <p className="mt-1 text-xs opacity-80">{t(banner.hint)}</p>}
              {banner.kind !== "refused" && (
                <button
                  onClick={retry}
                  disabled={sending}
                  className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-md border border-current px-3 text-xs font-ui transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                  {t({ ar: "إعادة المحاولة بنفس الحدث", en: "Retry the same event" })}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: isAr ? -18 : 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 18 : -18 }}
              transition={{ duration: 0.22 }}
            >
              {step === 1 && (
                <div className="space-y-5">
                  <Field label={t({ ar: "الاسم الكامل", en: "Full name" })} error={err.name}>
                    <input
                      className={cn(inputCls, locked && "opacity-60")}
                      value={f.name}
                      onChange={(e) => set("name", e.target.value)}
                      autoComplete="name"
                      placeholder={t({ ar: "الاسم كما في الهوية", en: "As on your ID" })}
                      disabled={locked}
                      required
                    />
                  </Field>
                  <Field label={t({ ar: "رقم الجوال / واتساب", en: "Mobile / WhatsApp number" })} error={err.phone}>
                    <div className="flex gap-2" dir="ltr">
                      <select
                        value={f.cc}
                        onChange={(e) => set("cc", e.target.value)}
                        aria-label="Country code"
                        disabled={locked}
                        className={cn(inputCls, "num w-[104px] shrink-0 px-3", locked && "opacity-60")}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.id} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        className={cn(inputCls, "num", locked && "opacity-60")}
                        inputMode="tel"
                        value={f.phone}
                        onChange={(e) => set("phone", e.target.value.replace(/[^\d\s]/g, ""))}
                        autoComplete="tel-national"
                        placeholder="5X XXX XXXX"
                        disabled={locked}
                        required
                      />
                    </div>
                  </Field>
                  <Field
                    label={t({ ar: "البريد الإلكتروني", en: "Email" })}
                    error={err.email}
                    hint={t({ ar: "يُرسل إليه إيصال الطلب التجريبي", en: "Receives the demo booking receipt" })}
                  >
                    <input
                      className={cn(inputCls, "ltr:text-left rtl:text-right", locked && "opacity-60")}
                      type="email"
                      dir="ltr"
                      value={f.email}
                      onChange={(e) => set("email", e.target.value)}
                      autoComplete="email"
                      placeholder="name@example.com"
                      disabled={locked}
                      required
                    />
                  </Field>

                  <div className="space-y-2">
                    <ConsentRow
                      checked={f.consService}
                      disabled={locked}
                      onToggle={() => {
                        set("consService", !f.consService);
                        setErr((s) => ({ ...s, consService: "" }));
                      }}
                      label={t({
                        ar: "أوافق على التواصل معي بشأن طلبي",
                        en: "I agree to be contacted about my request",
                      })}
                      sub={t({
                        ar: "موافقة واحدة مطلوبة لإرسال الطلب — تُوثَّق لحظتها وإصدارها لدى نظام الحجز، وتشمل رسائل الاستلام والتأكيد والتذكير",
                        en: "One consent required to send the request — its time, version and source are recorded by the booking system, covering receipt, confirmation and reminder messages",
                      })}
                    />
                    {err.consService && <p className="text-xs text-[#9B2C3A]" role="alert">{err.consService}</p>}
                  </div>

                  {locked && (
                    <p className="text-xs text-soft">
                      {t({
                        ar: "تم إرسال بيانات الاتصال إلى النظام التجريبي؛ لا يمكن تعديلها في هذه التجربة.",
                        en: "Contact data was already sent to the demo system; it cannot be changed in this demo.",
                      })}
                    </p>
                  )}
                  <p className="text-xs text-soft">
                    {t({
                      ar: "تجربة بنظام حجز خارجي: بيانات وهمية فقط، والتأكيد يتم يدويًا من مسؤول التجربة. تُعالج البيانات وفق أنظمة حماية البيانات في دول مجلس التعاون وGDPR.",
                      en: "External booking demo: fake data only; confirmation is manual by the demo operator. Data is processed under GCC data protection laws and GDPR.",
                    })}
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="mb-4 text-sm font-ui text-night">{t({ ar: "الدولة", en: "Country" })}</div>
                  <div className="flex flex-wrap gap-2 [&>button]:flex-1" role="group">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          set("country", c.id);
                          if (branch && branch.country !== c.id) {
                            set("branchId", "");
                            set("doctorId", "");
                          }
                        }}
                        aria-pressed={f.country === c.id}
                        className={cn("min-h-12 rounded-lg border px-3 text-sm font-ui transition-colors", f.country === c.id ? "border-ind bg-ind text-zirc" : "border-silver text-night hover:border-ind")}
                      >
                        {t(c.short)}
                      </button>
                    ))}
                  </div>
                  <div className="mb-3 mt-6 text-sm font-ui text-night">{t({ ar: "الفرع", en: "Branch" })}</div>
                  <ul className="space-y-2">
                    {BRANCHES.filter((b) => !f.country || b.country === f.country).map((b) => (
                      <li key={b.id}>
                        <button
                          onClick={() => set("branchId", b.id)}
                          aria-pressed={f.branchId === b.id}
                          className={cn("flex w-full items-center gap-4 rounded-lg border p-4 text-start transition-colors", f.branchId === b.id ? "border-ind bg-mist" : "border-silver hover:border-ind")}
                        >
                          <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", f.branchId === b.id ? "border-ind bg-ind text-zirc" : "border-silver")}>
                            {f.branchId === b.id && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="flex-1">
                            <span className="font-title block text-base text-night">{t(b.lockup)}</span>
                            <span className="block text-xs text-soft">{t(b.address)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {err.branch && <p className="mt-2 text-xs text-[#9B2C3A]" role="alert">{err.branch}</p>}
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="mb-3 text-sm font-ui text-night">{t({ ar: "التخصص السريري", en: "Clinical specialty" })}</div>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SPECIALTIES.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => {
                            set("specialtyId", s.id);
                            if (doctor && doctor.specialtyId !== s.id) set("doctorId", "");
                          }}
                          aria-pressed={f.specialtyId === s.id}
                          className={cn("flex h-full w-full items-center gap-3 rounded-lg border p-3 text-start transition-colors", f.specialtyId === s.id ? "border-ind bg-ind text-zirc" : "border-silver text-night hover:border-ind")}
                        >
                          <s.icon className={cn("h-5 w-5 shrink-0", f.specialtyId === s.id ? "text-zirc" : "text-turq")} strokeWidth={1.6} />
                          <span className="text-sm" style={{ lineHeight: 1.5 }}>{t(s.name)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {err.specialty && <p className="mt-2 text-xs text-[#9B2C3A]" role="alert">{err.specialty}</p>}
                  <div className="mt-6">
                    <Field label={t({ ar: "الاستشاري", en: "Consultant" })} optional>
                      <select
                        className={inputCls}
                        value={f.doctorId}
                        onChange={(e) => {
                          const d = DOCTORS.find((x) => x.id === e.target.value);
                          set("doctorId", e.target.value);
                          if (d) set("specialtyId", d.specialtyId);
                        }}
                      >
                        <option value="">{t({ ar: "أي استشاري متاح", en: "Any available consultant" })}</option>
                        {doctorsHere.map((d) => (
                          <option key={d.id} value={d.id}>
                            {t(d.name)} — {t(BRANCHES.find((b) => b.id === d.branchId)!.city)}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <Field label={t({ ar: "التاريخ المفضل", en: "Preferred date" })} error={err.date}>
                    <input type="date" min={today} value={f.date} onChange={(e) => set("date", e.target.value)} className={cn(inputCls, "num")} dir="ltr" style={{ textAlign: isAr ? "right" : "left" }} />
                  </Field>
                  <div>
                    <div className="mb-2 text-sm font-ui text-night">{t({ ar: "الوقت المفضل", en: "Preferred time" })}</div>
                    <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-6" dir="ltr">
                      {TIME_SLOTS.map((s) => (
                        <button
                          key={s}
                          onClick={() => set("time", s)}
                          aria-pressed={f.time === s}
                          className={cn("num min-h-11 rounded-lg border text-sm font-ui transition-colors", f.time === s ? "border-ind bg-ind text-zirc" : "border-silver text-night hover:border-ind")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {err.time && <p className="mt-1 text-xs text-[#9B2C3A]" role="alert">{err.time}</p>}
                  </div>
                  <div className={cn("rounded-lg border p-4 transition-colors", f.family ? "border-ind bg-mist" : "border-silver")}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={f.family}
                      onClick={() => set("family", !f.family)}
                      className="flex w-full items-center gap-3 text-start"
                    >
                      <Users className="h-5 w-5 shrink-0 text-turq" />
                      <span className="flex-1">
                        <span className="font-title block text-[15px] text-night">{t({ ar: "استشارة عائلية مشتركة", en: "Joint family consultation" })}</span>
                        <span className="block text-xs text-soft">{t({ ar: "موعد واحد لكل أفراد الأسرة، بملف عائلي موحد", en: "One appointment for the whole family, on a single family file" })}</span>
                      </span>
                      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", f.family ? "bg-ind" : "bg-silver")}>
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-zirc transition-all", f.family ? "start-[22px]" : "start-0.5")} />
                      </span>
                    </button>
                    {f.family && (
                      <div className="mt-4 flex items-center justify-between border-t border-silver pt-4">
                        <span className="text-sm text-night">{t({ ar: "عدد الأفراد", en: "Number of members" })}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => set("members", Math.max(2, f.members - 1))} aria-label="-" className="flex h-10 w-10 items-center justify-center rounded-lg border border-silver text-ind hover:bg-zirc"><Minus className="h-4 w-4" /></button>
                          <span className="num w-6 text-center text-lg text-night">{f.members}</span>
                          <button onClick={() => set("members", Math.min(8, f.members + 1))} aria-label="+" className="flex h-10 w-10 items-center justify-center rounded-lg border border-silver text-ind hover:bg-zirc"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-soft">
                    {t({
                      ar: "هذا «رغبة موعد» تُراجعها الاستقبال التجريبية، وليس حجزًا مؤكدًا.",
                      en: "This is a preferred time for demo reception to review — not a confirmed appointment.",
                    })}
                  </p>
                </div>
              )}

              {step === 5 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ind text-zirc"
                  >
                    <Check className="h-8 w-8" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mt-5 text-sm text-soft">{t({ ar: "المرجع التجريبي في نظام الحجز", en: "Demo booking reference" })}</p>
                  <div className="font-display num mt-1 break-all text-2xl text-ind" dir="ltr" style={{ lineHeight: 1.3 }}>
                    {attempt.reference ?? "—"}
                  </div>
                  {attempt.status && (
                    <p className="num mt-1 text-xs text-soft">
                      {t({ ar: "حالة الطلب في النظام: ", en: "Request status in the system: " })}
                      {attempt.status}
                    </p>
                  )}
                  <div className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-lg border border-turq/60 bg-mist p-4 text-start">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-turq" aria-hidden />
                    <p className="text-sm text-night">
                      {t({
                        ar: "استلمنا طلبك، بانتظار مراجعة الاستقبال. سيصلك بريد استلام تجريبي على عنوان الاختبار، ويتم تأكيد الموعد يدويًا من مسؤول التجربة.",
                        en: "We've received your request and it is awaiting reception review. A demo receipt email will arrive at your test address; the appointment is confirmed manually by the demo operator.",
                      })}
                    </p>
                  </div>
                  <dl className="mt-6 divide-y divide-silver rounded-lg border border-silver text-start text-sm">
                    {summary.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                        <dt className="shrink-0 text-soft">{k}</dt>
                        <dd className="text-end text-night">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-xs text-soft">
                    {t({
                      ar: "تجربة بنظام الحجز الخارجي (طابة دنت DEMO) — بيانات وهمية فقط، ولا يوجد ربط بجدول عيادة حقيقي.",
                      en: "External booking system demo (Tabah Dent DEMO) — fake data only; no link to a real clinic schedule.",
                    })}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-3 border-t border-silver bg-zirc px-5 py-4 sm:px-8">
          {step > 1 && step < 5 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="px-4" disabled={sending} ariaLabel={t({ ar: "رجوع", en: "Back" })}>
              <ArrowRight className="h-4 w-4 ltr:hidden" />
              <ArrowLeft className="h-4 w-4 rtl:hidden" />
              <span className="hidden sm:inline">{t({ ar: "رجوع", en: "Back" })}</span>
            </Button>
          )}
          {step < 5 ? (
            <Button onClick={next} className="flex-1" disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {step === 1 && (sending ? t({ ar: "جارٍ الإرسال…", en: "Sending…" }) : t({ ar: "متابعة اختيار الفرع والتخصص", en: "Continue to branch & specialty" }))}
              {step === 2 && t({ ar: "متابعة اختيار التخصص", en: "Continue to specialty" })}
              {step === 3 && t({ ar: "متابعة تحديد الموعد", en: "Continue to schedule" })}
              {step === 4 && (sending ? t({ ar: "جارٍ الإرسال…", en: "Sending…" }) : t({ ar: "تأكيد الحجز", en: "Confirm booking" }))}
              {!sending && (
                <>
                  <ArrowLeft className="h-4 w-4 ltr:hidden" />
                  <ArrowRight className="h-4 w-4 rtl:hidden" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={closeBooking} className="flex-1">
              {t({ ar: "إغلاق", en: "Close" })}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BookingModal() {
  const { bookingOpen, bookingPreset } = useApp();
  return <AnimatePresence>{bookingOpen && <Inner key={JSON.stringify(bookingPreset) + "open"} />}</AnimatePresence>;
}
