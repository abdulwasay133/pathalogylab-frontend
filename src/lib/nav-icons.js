import {
  Clock,
  FlaskConical,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  PenLine,
  Settings,
  Shield,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  Building2,
} from "lucide-react";

const ICON_BY_PATH = {
  "/index": LayoutDashboard,
  "/test-management": ListChecks,
  "/test-template": PenLine,
  "/doctors-management": Users,
  "/patients/pay-commissions": HandCoins,
  "/patients/add-patient": UserPlus,
  "/patients/pending-patient": Clock,
  "/patients/completed-patient": UserCheck,
  "/users-roles": Shield,
  "/user-profile": Settings,
};

const ICON_BY_NAME = {
  Dashboard: LayoutDashboard,
  Tests: FlaskConical,
  Doctors: Stethoscope,
  Patients: Building2,
};

export function getNavIcon(route) {
  if (route.path && ICON_BY_PATH[route.path]) return ICON_BY_PATH[route.path];
  if (route.name && ICON_BY_NAME[route.name]) return ICON_BY_NAME[route.name];
  return LayoutDashboard;
}
