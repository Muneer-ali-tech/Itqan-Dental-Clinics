import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Send, X } from "lucide-react";
import { useApp, useIsDesktop, type Bi } from "../context";
import { StarMark } from "./ui";
import { BRANCHES } from "../data/content";
import { cn } from "../utils/cn";

interface Msg {
  from: "bot" | "user";
  text: string;
  action?: "book" | "locator";
}

interface Intent {
  keys: RegExp;
  reply: Bi;
  action?: "book" | "locator";
}

const INTENTS: Intent[] = [
  {
    keys: /(فرع|فروع|موقع|مواقع|عنوان|ساعات|دوام|مفتوح|branch|location|address|hours|open|where|dubai|riyadh|manama|jeddah|abu dhabi|دبي|الرياض|المنامة|جدة|أبوظبي|ابوظبي)/i,
    reply: {
      ar: `لدينا 12+ فرعًا، وأبرزها: ${BRANCHES.map((b) => b.city.ar).join("، ")}. ساعات العمل المعتادة من 9 صباحًا حتى 9–10 مساءً بحسب الفرع، ويمكنك الاطلاع على العنوان وخدمة صف السيارات لكل فرع في قسم الفروع.`,
      en: `We operate 12+ branches, with featured sites in ${BRANCHES.map((b) => b.city.en).join(", ")}. Typical hours run from 9am to 9–10pm depending on the branch; addresses and valet details are in the Branches section.`,
    },
    action: "locator",
  },
  {
    keys: /(تأمين|بوبا|تعاونية|ضمان|مدنت|تكافل|فوترة|تقسيط|تابي|تمارا|insur|bupa|tawuniya|daman|mednet|takaful|billing|tabby|tamara|instal)/i,
    reply: {
      ar: "نتعامل مع بوبا والتعاونية وضمان ومدنت وتكافل بفوترة مباشرة وموافقات مسبقة يتولاها فريق التأمين المركزي. كما يتوفر التقسيط عبر Tabby وTamara بحسب أهلية العميل. تختلف التغطية بحسب وثيقتك.",
      en: "We work with Bupa, Tawuniya, Daman, MedNet and Takaful, with direct billing and pre-authorisations handled by the central insurance team. Instalments are available via Tabby and Tamara subject to eligibility. Coverage depends on your policy.",
    },
    action: "book",
  },
  {
    keys: /(نقل|ملف|سجل|دولة|دولتين|انتقال|transfer|record|file|between|move|history)/i,
    reply: {
      ar: "نعم، ملفك الطبي سجل إلكتروني واحد مشفّر يمكن للفريق المعالج في أي فرع الاطلاع عليه بموافقتك، حتى بين دولتين مختلفتين، دون إعادة الفحوصات غير الضرورية. يمكنني توجيهك الآن لحجز موعد في الفرع الذي تنتقل إليه.",
      en: "Yes. Your clinical file is a single encrypted record that the treating team in any branch can access with your consent, even across two countries, without unnecessary repeat examinations. I can direct you to book at the branch you are moving to.",
    },
    action: "book",
  },
  {
    keys: /(سعر|اسعار|أسعار|تكلفة|كم|price|cost|how much|fee)/i,
    reply: {
      ar: "تعتمد المجموعة جدول أسعار مرجعيًا موحدًا لكل دولة بعملتها، وتُعرض خطة العلاج والتكلفة بوضوح قبل البدء. الباقة الوقائية الشاملة مثال: SAR 500 / AED 500 / BHD 50 للفرد (بيانات نموذجية).",
      en: "The group uses one reference price schedule per country in local currency, and your plan and cost are shown clearly before you begin. The comprehensive preventive package, for example, is SAR 500 / AED 500 / BHD 50 per person (sample data).",
    },
    action: "book",
  },
  {
    keys: /(حجز|موعد|احجز|استشارة|book|appointment|consult|reserve|visit)/i,
    reply: {
      ar: "يسعدني ذلك. نظام الحجز يتم في أربع خطوات قصيرة: بياناتك، الفرع، التخصص، ثم الموعد، وسيصدر لك رقم حجز مركزي موحد.",
      en: "Happy to help. Booking takes four short steps: your details, branch, specialty and time, and you receive a unified central booking number.",
    },
    action: "book",
  },
];

const FALLBACK: Bi = {
  ar: "شكرًا على سؤالك. يمكنني مساعدتك في مواقع الفروع وساعات العمل، وشبكات التأمين والتقسيط، ونقل الملف الطبي بين الفروع. أو يمكنك حجز استشارة مباشرة.",
  en: "Thank you for your question. I can help with branch locations and hours, insurance and instalments, and transferring your file between branches. Or you can book a consultation directly.",
};

const CHIPS: { label: Bi; q: Bi }[] = [
  { label: { ar: "الفروع وساعات العمل", en: "Branches & hours" }, q: { ar: "ما هي الفروع وساعات العمل؟", en: "Where are your branches and what are the hours?" } },
  { label: { ar: "التأمين والتقسيط", en: "Insurance & instalments" }, q: { ar: "ما شركات التأمين المعتمدة والتقسيط؟", en: "Which insurers and instalment options do you accept?" } },
  { label: { ar: "نقل الملف بين الدول", en: "Transfer my file" }, q: { ar: "هل يمكن نقل ملفي بين دولتين؟", en: "Can my file move between two countries?" } },
];

export function Chatbot() {
  const { t, lang, chatOpen, setChatOpen, offerShown, openBooking, menuOpen, setRegion } = useApp();
  const desktop = useIsDesktop();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const greeting = (): Msg => ({
    from: "bot",
    text: t({
      ar: "مرحبًا بك في مساعد شبكة إتقان. كيف أستطيع مساعدتك اليوم؟",
      en: "Welcome to the Itqan Network concierge. How can I help you today?",
    }),
  });

  useEffect(() => {
    if (chatOpen && msgs.length === 0) setMsgs([greeting()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    const hit = INTENTS.find((i) => i.keys.test(q));
    window.setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: (hit?.reply ?? FALLBACK)[lang], action: hit?.action ?? "book" }]);
      setTyping(false);
    }, 800);
  };

  const act = (a: "book" | "locator") => {
    if (a === "book") openBooking();
    else {
      setRegion("all");
      setChatOpen(false);
      document.getElementById("locator")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (menuOpen) return null;
  const fabBottom = desktop ? "24px" : offerShown ? "calc(76px + var(--offer-h, 200px) + 12px)" : "84px";

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-3 z-[45] flex flex-col overflow-hidden rounded-lg border border-silver bg-zirc shadow-2xl shadow-night/30 sm:inset-x-auto sm:end-6 sm:w-[390px] lg:bottom-24"
            style={{ bottom: desktop ? undefined : "148px", maxHeight: desktop ? "min(600px, calc(100dvh - 140px))" : "calc(100dvh - 240px)", height: 560 }}
            role="dialog"
            aria-label={t({ ar: "مساعد شبكة إتقان", en: "Itqan Network concierge" })}
          >
            <div className="flex items-center gap-3 bg-ind px-4 py-3 text-zirc">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zirc">
                <StarMark className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <div className="font-title text-[15px]">{t({ ar: "مساعد شبكة إتقان", en: "Itqan Network Concierge" })}</div>
                <div className="flex items-center gap-1.5 text-xs text-silver">
                  <span className="h-1.5 w-1.5 rounded-full bg-turq" />
                  {t({ ar: "متاح الآن", en: "Online now" })}
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} aria-label={t({ ar: "إغلاق", en: "Close" })} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zirc/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-mist p-4">
              {msgs.map((m, i) => (
                <div key={i} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[86%] rounded-lg px-3.5 py-2.5 text-sm", m.from === "user" ? "bg-ind text-zirc" : "border border-silver bg-zirc text-night")}>
                    {m.text}
                    {m.action && (
                      <button onClick={() => act(m.action!)} className="mt-2 flex min-h-10 w-full items-center justify-between gap-2 rounded-lg bg-ind px-3 text-xs font-ui text-zirc">
                        {m.action === "book" ? t({ ar: "افتح نظام الحجز", en: "Open booking" }) : t({ ar: "اعرض محدد الفروع", en: "Show branch locator" })}
                        <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-lg border border-silver bg-zirc px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-turq" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-silver bg-zirc p-3">
              <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
                {CHIPS.map((c) => (
                  <button key={c.label.en} onClick={() => send(t(c.q))} className="shrink-0 rounded-lg border border-silver px-3 py-1.5 text-xs font-ui text-ind hover:border-ind">
                    {t(c.label)}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t({ ar: "اكتب سؤالك…", en: "Type your question…" })}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-silver bg-zirc px-3 text-sm outline-none focus:border-ind"
                />
                <button type="submit" aria-label={t({ ar: "إرسال", en: "Send" })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ind text-zirc">
                  <Send className="h-4 w-4 rtl:-scale-x-100" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={t({ ar: "مساعد شبكة إتقان", en: "Itqan Network concierge" })}
        aria-expanded={chatOpen}
        whileTap={{ scale: 0.94 }}
        style={{ bottom: fabBottom }}
        className="fixed end-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full border border-turq bg-ind shadow-xl shadow-night/30 transition-[bottom] duration-300 sm:end-6"
      >
        {chatOpen ? <X className="h-6 w-6 text-zirc" /> : <StarMark onDark className="h-10 w-10" />}
        {!chatOpen && <span className="absolute -end-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-zirc bg-turq" />}
      </motion.button>
    </>
  );
}
