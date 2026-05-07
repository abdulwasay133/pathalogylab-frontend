import Index             from "views/Index.js";
import Profile           from "views/pages/Profile.js";
import Login             from "views/pages/Login.js";
import Register          from "views/pages/Register.js";
import TestTemplates     from "views/pages/TestTemplates";
import TestManagement    from "views/pages/TestManagement";
import TestView          from "views/pages/TestView";
import EditTest          from "views/pages/EditTest";
import DoctorManagement  from "views/pages/doctos/DoctorManagement";
import AddDoctor         from "views/pages/doctos/AddDoctor";
import AddPatient        from "views/pages/patients/AddPatient";
import PendingPatients   from "views/pages/patients/PendingPatient";
import CompletedPatients from "views/pages/patients/CompletedPatients";
import DoctorCommissions from "views/pages/doctos/DoctorCommission";
import PayCommission     from "views/pages/invoices/PayCommission";
import UserRoleManagement from "views/pages/Userrolemanagement";

/* ══════════════════════════════════════════════════════════
   ROLE VISIBILITY MAP
   ─────────────────────────────────────────────────────────
   admin        → full access to everything
   lab          → tests, patients (add/pending/completed)
   doctor       → completed patients only
   receptionist → add patient, completed patients
══════════════════════════════════════════════════════════ */

var routes = [

  /* ── Dashboard ─────────────────────────────────────────── */
  {
    path:      "/index",
    name:      "Dashboard",
    icon:      "ni ni-tv-2 text-primary",
    component: <Index />,
    layout:    "/admin",
    roles:     ["admin", "lab", "doctor", "receptionist"],
  },

  /* ── Tests (admin + lab) ────────────────────────────────── */
  {
    name:   "Tests",
    icon:   "fa-solid fa-vial-circle-check text-primary",
    layout: "/admin",
    roles:  ["admin", "lab"],
    children: [
      {
        path:      "/test-management",
        name:      "Test Management",
        icon:      "fa-solid fa-list-check text-primary",
        component: <TestManagement />,
        layout:    "/admin",
        roles:     ["admin", "lab"],
      },
      {
        path:      "/test-template",
        name:      "Template Designer",
        icon:      "fa-solid fa-pen-nib text-primary",
        component: <TestTemplates />,
        layout:    "/admin",
        roles:     ["admin"],               // lab cannot design templates
      },
    ],
  },

  /* hidden — rendered but NOT in sidebar */
  { path: "/test-view/:id",      component: <TestView />, layout: "/admin", hidden: true, roles: ["admin", "lab", "doctor", "receptionist"] },
  { path: "/edit-test/:id",      component: <EditTest />, layout: "/admin", hidden: true, roles: ["admin", "lab"] },

  /* ── Doctors (admin only) ───────────────────────────────── */
  {
    name:   "Doctors",
    icon:   "fa-solid fa-user-doctor text-success",
    layout: "/admin",
    roles:  ["admin"],
    children: [
      {
        path:      "/doctors-management",
        name:      "All Doctors",
        icon:      "fa-solid fa-users text-success",
        component: <DoctorManagement />,
        layout:    "/admin",
        roles:     ["admin"],
      },
      // {
      //   path:      "/patients/commissions",
      //   name:      "Commissions",
      //   icon:      "fa-solid fa-file-invoice-dollar text-success",
      //   component: <DoctorCommissions />,
      //   layout:    "/admin",
      //   roles:     ["admin"],
      // },
      {
        path:      "/patients/pay-commissions",
        name:      "Pay Commissions",
        icon:      "fa-solid fa-hand-holding-dollar text-success",
        component: <PayCommission />,
        layout:    "/admin",
        roles:     ["admin"],
      },
    ],
  },

  /* hidden doctor routes */
  { path: "/doctors/add-doctor",        component: <AddDoctor />, layout: "/admin", hidden: true, roles: ["admin"] },
  { path: "/doctors/edit-doctor/:id",   component: <AddDoctor />, layout: "/admin", hidden: true, roles: ["admin"] },

  /* ── Patients ───────────────────────────────────────────── */
  {
    name:   "Patients",
    icon:   "fa-solid fa-hospital-user text-warning",
    layout: "/admin",
    roles:  ["admin", "lab", "doctor", "receptionist"],
    children: [
      {
        path:      "/patients/add-patient",
        name:      "Add Patient",
        icon:      "fa-solid fa-user-plus text-warning",
        component: <AddPatient />,
        layout:    "/admin",
        roles:     ["admin", "lab", "receptionist"],    // doctors don't add patients
      },
      {
        path:      "/patients/pending-patient",
        name:      "Pending Patients",
        icon:      "fa-solid fa-user-clock text-warning",
        component: <PendingPatients />,
        layout:    "/admin",
        roles:     ["admin", "lab"],
      },
      {
        path:      "/patients/completed-patient",
        name:      "Completed Patients",
        icon:      "fa-solid fa-user-check text-info",
        component: <CompletedPatients />,
        layout:    "/admin",
        roles:     ["admin", "lab", "doctor", "receptionist"],
      },
    ],
  },

  /* ── Users & Roles (admin only) ─────────────────────────── */
  {
    path:      "/users-roles",
    name:      "Users & Roles",
    icon:      "fa-solid fa-shield-halved text-primary",
    component: <UserRoleManagement />,
    layout:    "/admin",
    roles:     ["admin"],
  },

  /* ── Settings (everyone) ────────────────────────────────── */
  {
    path:      "/user-profile",
    name:      "Settings",
    icon:      "ni ni-settings-gear-65 text-muted",
    component: <Profile />,
    layout:    "/admin",
    roles:     ["admin", "lab", "doctor", "receptionist"],
  },

  /* ── Auth layout (public, no sidebar) ──────────────────── */
  {
    path:      "/login",
    name:      "Login",
    icon:      "ni ni-key-25 text-info",
    component: <Login />,
    layout:    "/auth",
  },
  {
    path:      "/register",
    name:      "Register",
    icon:      "ni ni-circle-08 text-pink",
    component: <Register />,
    layout:    "/auth",
  },
];

export default routes;