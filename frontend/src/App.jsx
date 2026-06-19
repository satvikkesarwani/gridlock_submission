import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame.jsx";
import { ROUTES } from "./constants/routes.js";
import { ACTIVE_NAV_BY_PATH } from "./constants/nav.js";
import Landing from "./pages/Landing.jsx";
import PredictiveSimulator from "./pages/PredictiveSimulator.jsx";
import ResourceOptimizer from "./pages/ResourceOptimizer.jsx";
import LiveCorridorControl from "./pages/LiveCorridorControl.jsx";
import PostEventDebrief from "./pages/PostEventDebrief.jsx";

export default function App() {
  const location = useLocation();
  const activeNav = ACTIVE_NAV_BY_PATH[location.pathname] || "Home";

  return (
    <PhoneFrame activeNav={activeNav}>
      <Routes>
        <Route path={ROUTES.home} element={<Landing />} />
        <Route path={ROUTES.simulator} element={<PredictiveSimulator />} />
        <Route path={ROUTES.optimizer} element={<ResourceOptimizer />} />
        <Route path={ROUTES.liveControl} element={<LiveCorridorControl />} />
        <Route path={ROUTES.debrief} element={<PostEventDebrief />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </PhoneFrame>
  );
}
