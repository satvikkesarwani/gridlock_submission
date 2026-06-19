import { Bell, BarChart3, Home, Map, Settings } from "lucide-react";
import { ROUTES } from "./routes.js";

/** Bottom tab bar items. */
export const NAV_ITEMS = [
  { label: "Home", path: ROUTES.home, icon: Home },
  { label: "Planning", path: ROUTES.simulator, icon: Map },
  { label: "Alerts", path: ROUTES.liveControl, icon: Bell, badge: "1" },
  { label: "Reports", path: ROUTES.debrief, icon: BarChart3 },
  { label: "Settings", path: ROUTES.home, icon: Settings },
];

/** Which tab is highlighted for a given route. */
export const ACTIVE_NAV_BY_PATH = {
  [ROUTES.home]: "Home",
  [ROUTES.simulator]: "Planning",
  [ROUTES.optimizer]: "Planning",
  [ROUTES.liveControl]: "Alerts",
  [ROUTES.debrief]: "Reports",
};
