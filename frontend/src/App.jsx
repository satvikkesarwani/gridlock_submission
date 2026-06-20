import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame.jsx";
import { ROUTES } from "./constants/routes.js";
import { ACTIVE_NAV_BY_PATH } from "./constants/nav.js";

// Route-level code splitting: each page (and the Leaflet/Recharts it pulls in) is
// fetched on demand, so the initial landing load stays small.
const Landing = lazy(() => import("./pages/Landing.jsx"));
const PredictiveSimulator = lazy(() => import("./pages/PredictiveSimulator.jsx"));
const ResourceOptimizer = lazy(() => import("./pages/ResourceOptimizer.jsx"));
const LiveCorridorControl = lazy(() => import("./pages/LiveCorridorControl.jsx"));
const PostEventDebrief = lazy(() => import("./pages/PostEventDebrief.jsx"));

function RouteFallback() {
  return <div className="route-fallback" role="status" aria-live="polite">Loading…</div>;
}

export default function App() {
  const location = useLocation();
  const activeNav = ACTIVE_NAV_BY_PATH[location.pathname] || "Home";

  return (
    <PhoneFrame activeNav={activeNav}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={ROUTES.home} element={<Landing />} />
          <Route path={ROUTES.simulator} element={<PredictiveSimulator />} />
          <Route path={ROUTES.optimizer} element={<ResourceOptimizer />} />
          <Route path={ROUTES.liveControl} element={<LiveCorridorControl />} />
          <Route path={ROUTES.debrief} element={<PostEventDebrief />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </Suspense>
    </PhoneFrame>
  );
}
