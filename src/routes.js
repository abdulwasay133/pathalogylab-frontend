import Index from "views/Index.js";
import Profile from "views/pages/Profile.js";
import Maps from "views/pages/Maps.js";
import Register from "views/pages/Register.js";
import Login from "views/pages/Login.js";
import Tables from "views/pages/Tables.js";
import Icons from "views/pages/Icons.js";
import TestTemplates from "views/pages/TestTemplates";
import TestManagement from "views/pages/TestManagement";
import TestView from "views/pages/TestView";
import EditTest from "views/pages/EditTest";

import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import DoctorManagement from "views/pages/doctos/DoctorManagement";
import AddDoctor from "views/pages/doctos/AddDoctor";
import AddPatient from "views/pages/patients/AddPatient";
import { Pending } from "@mui/icons-material";
import PendingPatients from "views/pages/patients/PendingPatient";
import CompletedPatients from "views/pages/patients/CompletedPatients";
import DoctorCommissions from "views/pages/doctos/DoctorCommission";
import PayCommission from "views/pages/invoices/PayCommission";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
    roles: ["admin", "doctor", "lab"],   // 👈 add this
  },
  {
    path: "/test-template",
    name: "Template Designer",
    icon: "fa-solid fa-pen-nib fa-2x text-primary",
    component: <TestTemplates />,
    layout: "/admin",
    roles: ["admin", "doctor", "lab"],   // 👈 add this
  },
  {
    path: "/test-management",
    name: "Test Management",
    icon: "fa-solid fa-vial-circle-check fs-4 text-primary",
    component: <TestManagement />,
    layout: "/admin",
    roles: ["admin", "doctor", "lab"],   // 👈 add this
  },
  {
    path: "/test-view/:id",
    component: <TestView />,
    layout: "/admin",
    hidden: true,
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/edit-test/:id",
    component: <EditTest />,
    layout: "/admin",
    hidden: true,
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/doctors-management",
    name: "Doctors Management",
    icon: "fa-solid fa-user-doctor text-primary",
    component: <DoctorManagement />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/doctors/add-doctor",
    component: <AddDoctor />,
    layout: "/admin",
    hidden: true,
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/doctors/edit-doctor/:id",
    component: <AddDoctor />,
    layout: "/admin",
    hidden: true,
    roles: ["admin", "doctor", "patient", "lab"],
  },
    {
    path: "/patients/add-patient",
    name: "Patient Management",
    icon: "fa-solid fa-hospital-user text-red",
    component: <AddPatient />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
    {
    path: "/patients/pending-patient",
    name: "Pending Patients",
    icon: "fa-solid fa-user-clock text-yellow",
    component: <PendingPatients />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
    {
    path: "/patients/completed-patient",
    name: "Completed Patients",
    icon: "fa-solid fa-user-check text-info",
    component: <CompletedPatients />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
    {
    path: "/patients/commissions",
    name: "Doctor Commissions",
    icon: "fa-solid fa-user-check text-info",
    component: <DoctorCommissions />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
    {
    path: "/patients/pay-commissions",
    name: "Pay Commissions",
    icon: "fa-solid fa-user-check text-info",
    component: <PayCommission />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
    roles: ["admin", "doctor", "patient", "lab"],
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
];

export default routes;
