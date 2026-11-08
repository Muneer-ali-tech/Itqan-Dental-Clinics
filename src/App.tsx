import { useEffect } from "react";
import { AppProvider, useApp, useIsDesktop } from "./context";
import { Header, MobileMenu } from "./components/Header";
import { Hero, Metrics, Pillars } from "./components/Sections1";
import { BeforeAfter, Charter } from "./components/Sections2";
import { Board, CmoAddress } from "./components/Sections3";
import { Journey, Labs, Testimonials } from "./components/Sections4";
import { FamilyPass, Insurance, Locator } from "./components/Sections5";
import { Faq, FinalCta, Footer } from "./components/Sections6";
import { BookingModal } from "./components/BookingModal";
import { OfferPopup } from "./components/OfferPopup";
import { MobileBar } from "./components/MobileBar";
import { Chatbot } from "./components/Chatbot";

function Shell() {
  const { bookingOpen, menuOpen, offerShown } = useApp();
  const desktop = useIsDesktop();

  // Global scroll lock: booking modal, mobile menu overlay, desktop offer modal.
  useEffect(() => {
    const lock = bookingOpen || menuOpen || (offerShown && desktop);
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingOpen, menuOpen, offerShown, desktop]);

  // Close the mobile menu if the viewport grows to desktop.
  const { setMenuOpen } = useApp();
  useEffect(() => {
    if (desktop) setMenuOpen(false);
  }, [desktop, setMenuOpen]);

  return (
    <div className="min-h-screen bg-zirc text-night">
      <Header />
      <main>
        <Hero />
        <Metrics />
        <Pillars />
        <Charter />
        <BeforeAfter />
        <CmoAddress />
        <Board />
        <Journey />
        <Labs />
        <Testimonials />
        <Insurance />
        <FamilyPass />
        <Locator />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileMenu />
      <BookingModal />
      <OfferPopup />
      <Chatbot />
      <MobileBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
