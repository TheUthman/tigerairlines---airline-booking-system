import { useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { RouteProgress } from "../ui/LoadingState";
const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const pageContainerRef = useRef(null);
  useGSAP(() => {
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
      gsap.fromTo(
        pageContainerRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
      );
    }
  }, [location.pathname]);
  const getPageTitle = (path) => {
    if (path === "/admin") return "Executive Analytics & KPI Dashboard";
    if (path.includes("/flights")) return "Flight Scheduling & Operations";
    if (path.includes("/aircraft")) return "Fleet & Aircraft Inventory";
    if (path.includes("/airports")) return "Airport Terminals & Route Network";
    if (path.includes("/passengers")) return "Passenger Registry & Miles";
    if (path.includes("/bookings")) return "PNR Bookings & E-Tickets";
    if (path.includes("/users")) return "User Access & Roles";
    return "Operations Console";
  };
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <RouteProgress />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          title={getPageTitle(location.pathname)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main ref={pageContainerRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
var stdin_default = AdminLayout;
export { AdminLayout, stdin_default as default };
