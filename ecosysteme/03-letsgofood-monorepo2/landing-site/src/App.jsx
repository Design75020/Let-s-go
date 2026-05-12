import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LandingRestaurants from "./pages/LandingRestaurants.jsx";
import LandingDrivers from "./pages/LandingDrivers.jsx";
import LandingClients from "./pages/LandingClients.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import BrochureViewer from "./pages/BrochureViewer.jsx";
import WhatsAppFloat from "./components/WhatsAppFloat.jsx";
import MobileCallBar from "./components/MobileCallBar.jsx";
import AttributionWelcome from "./components/AttributionWelcome.jsx";
import { autoTrackQrScan, trackEvent } from "./lib/tracking.js";
import { captureAttribution } from "./lib/attribution.js";

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent("page_view", { path: location.pathname + location.search });
  }, [location.pathname, location.search]);
  return null;
}

export default function App() {
  useEffect(() => {
    // Capture attribution params BEFORE any tracking event fires
    captureAttribution();
    autoTrackQrScan();
  }, []);

  const isOnboarding = typeof window !== "undefined" && window.location.pathname.includes("/onboarding");
  const isBrochure = typeof window !== "undefined" && window.location.pathname.includes("/brochure/");
  const hideFloaters = isOnboarding || isBrochure;

  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/pour-restaurants" element={<LandingRestaurants />} />
        <Route path="/pour-livreurs" element={<LandingDrivers />} />
        <Route path="/pour-clients" element={<LandingClients />} />
        <Route path="/brochure/:role" element={<BrochureViewer />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      {!hideFloaters && <AttributionWelcome />}
      {!hideFloaters && <WhatsAppFloat />}
      {!hideFloaters && <MobileCallBar />}
    </>
  );
}
