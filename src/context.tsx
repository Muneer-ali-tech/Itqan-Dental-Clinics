import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";
export type Bi = { ar: string; en: string };
export type RegionId = "all" | "sa" | "ae" | "bh";

export interface BookingPreset {
  doctorId?: string;
  specialtyId?: string;
  branchId?: string;
  family?: boolean;
}

interface AppCtx {
  lang: Lang;
  isAr: boolean;
  setLang: (l: Lang) => void;
  t: (b: Bi) => string;
  other: (b: Bi) => string;
  region: RegionId;
  setRegion: (r: RegionId) => void;
  bookingOpen: boolean;
  bookingPreset: BookingPreset;
  openBooking: (p?: BookingPreset) => void;
  closeBooking: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  offerShown: boolean;
  setOfferShown: (v: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  const [region, setRegion] = useState<RegionId>("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPreset, setBookingPreset] = useState<BookingPreset>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [offerShown, setOfferShown] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
    document.title =
      lang === "ar"
        ? "عيادات إتقان لطب الأسنان | معيارٌ واحد للإتقان في كل فرع"
        : "Itqan Dental Clinics | One standard of mastery";
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const openBooking = useCallback((p?: BookingPreset) => {
    setBookingPreset(p ?? {});
    setMenuOpen(false);
    setChatOpen(false);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const value = useMemo<AppCtx>(
    () => ({
      lang,
      isAr: lang === "ar",
      setLang,
      t: (b: Bi) => b[lang],
      other: (b: Bi) => b[lang === "ar" ? "en" : "ar"],
      region,
      setRegion,
      bookingOpen,
      bookingPreset,
      openBooking,
      closeBooking,
      menuOpen,
      setMenuOpen,
      offerShown,
      setOfferShown,
      chatOpen,
      setChatOpen,
    }),
    [lang, setLang, region, bookingOpen, bookingPreset, openBooking, closeBooking, menuOpen, offerShown, chatOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}

/** true when viewport ≥ 1024px */
export function useIsDesktop() {
  const [d, setD] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true,
  );
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const h = () => setD(m.matches);
    h();
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return d;
}
