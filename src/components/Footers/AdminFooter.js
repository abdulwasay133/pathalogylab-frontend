import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const licenses = [
  { package: "React", version: "18.x", license: "MIT", author: "Meta", url: "https://github.com/facebook/react/blob/main/LICENSE" },
  { package: "React Router", version: "6.x", license: "MIT", author: "Remix", url: "https://github.com/remix-run/react-router/blob/main/LICENSE.md" },
  { package: "Tailwind CSS", version: "3.x", license: "MIT", author: "Tailwind Labs", url: "https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE" },
  { package: "Chart.js", version: "2.x", license: "MIT", author: "Chart.js", url: "https://github.com/chartjs/Chart.js/blob/master/LICENSE.md" },
  { package: "Axios", version: "1.x", license: "MIT", author: "Matt Zabriskie", url: "https://github.com/axios/axios/blob/master/LICENSE" },
  { package: "Radix UI", version: "1.x", license: "MIT", author: "WorkOS", url: "https://github.com/radix-ui/primitives/blob/main/LICENSE" },
];

const footerLinks = [
  { label: "Dashboard", to: "/admin/index", match: (path) => path === "/admin/index" || path === "/admin" },
  {
    label: "Patients",
    to: "/admin/patients/completed-patient",
    match: (path) => path.startsWith("/admin/patients"),
  },
  {
    label: "Doctors",
    to: "/admin/doctors-management",
    match: (path) => path.startsWith("/admin/doctors-management"),
  },
  {
    label: "Tests",
    to: "/admin/test-management",
    match: (path) => path.startsWith("/admin/test-management"),
  },
];

function FooterNavLink({ to, children, isActive }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-sm px-2 py-1 text-sm transition-colors",
        isActive
          ? "font-semibold text-emerald-800"
          : "text-slate-500 hover:text-emerald-700"
      )}
    >
      {children}
    </Link>
  );
}

const AdminFooter = () => {
  const [licenseOpen, setLicenseOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <footer
        id="lims-admin-footer"
        className="mt-auto shrink-0 border-t border-emerald-100/80 bg-card px-4 py-3 md:px-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-center text-sm leading-snug text-slate-500 sm:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-800">PrimeLIMS</span>
            <span className="hidden text-slate-400 sm:inline">
              {" "}
              · Laboratory Information Management
            </span>
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:justify-end"
            aria-label="Footer"
          >
            {footerLinks.map((link, index) => (
              <span key={link.to} className="inline-flex items-center">
                {index > 0 && (
                  <span className="mx-1 hidden text-slate-300 sm:inline" aria-hidden>
                    ·
                  </span>
                )}
                <FooterNavLink to={link.to} isActive={link.match(pathname)}>
                  {link.label}
                </FooterNavLink>
              </span>
            ))}
            <span className="mx-1 hidden text-slate-300 sm:inline" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={() => setLicenseOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Licenses
            </button>
          </nav>
        </div>
      </footer>

      <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              Open Source Licenses
            </DialogTitle>
            <DialogDescription>
              Third-party packages used in PrimeLIMS.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-3 text-sm text-slate-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <p>
              This application is built with open-source software. All packages comply with their respective license terms.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-emerald-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/50 text-left">
                  <th className="px-4 py-2.5 font-semibold text-slate-600">Package</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">Version</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">License</th>
                  <th className="hidden px-4 py-2.5 font-semibold text-slate-600 sm:table-cell">Author</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">Link</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((item) => (
                  <tr
                    key={item.package}
                    className="border-b border-emerald-50 last:border-0 hover:bg-emerald-50/40"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.package}</td>
                    <td className="px-4 py-2.5 text-slate-500">{item.version}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="success" className="text-[10px]">
                        {item.license}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-slate-500 sm:table-cell">{item.author}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-600 hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setLicenseOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminFooter;
