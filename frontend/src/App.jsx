import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame.jsx";
import Landing from "./pages/Landing.jsx";
import PredictiveSimulator from "./pages/PredictiveSimulator.jsx";
import ResourceOptimizer from "./pages/ResourceOptimizer.jsx";
import LiveCorridorControl from "./pages/LiveCorridorControl.jsx";
import PostEventDebrief from "./pages/PostEventDebrief.jsx";

const activeNavByPath = {
  "/": "Home",
  "/simulator": "Planning",
  "/optimizer": "Planning",
  "/live-control": "Alerts",
  "/debrief": "Reports",
};

export default function App() {
  const location = useLocation();
  const activeNav = activeNavByPath[location.pathname] || "Home";

  return (
    <PhoneFrame activeNav={activeNav}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulator" element={<PredictiveSimulator />} />
        <Route path="/optimizer" element={<ResourceOptimizer />} />
        <Route path="/live-control" element={<LiveCorridorControl />} />
        <Route path="/debrief" element={<PostEventDebrief />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
