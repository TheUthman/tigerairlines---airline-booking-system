import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { RouteProgress } from "../ui/LoadingState";

const getPageTitle = (path) => {
  if (path === "/admin") return "Operations dashboard";
  if (path.includes("/flights")) return "Flight operations";
  if (path.includes("/aircraft")) return "Fleet & aircraft";
  if (path.includes("/airports")) return "Airports & terminals";
  if (path.includes("/passengers")) return "Passenger directory";
  if (path.includes("/bookings")) return "Reservations";
  if (path.includes("/users")) return "User access";
  return "Operations console";
};

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const pageContainerRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useGSAP(() => {
    if (!pageContainerRef.current) return;
    pageContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    gsap.fromTo(
      pageContainerRef.current,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = mobileDrawerRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      mobileDrawerRef.current
        ?.querySelector('[aria-label="Close admin navigation"]')
        ?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      } else {
        mobileMenuButtonRef.current?.focus();
      }
    };
  }, [mobileSidebarOpen]);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <RouteProgress />
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
            aria-label="Close admin navigation"
            onClick={closeMobileSidebar}
          />
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="relative z-10 h-full w-fit shadow-2xl"
          >
            <AdminSidebar onClose={closeMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          title={getPageTitle(location.pathname)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((open) => !open)}
          mobileMenuButtonRef={mobileMenuButtonRef}
          mobileSidebarOpen={mobileSidebarOpen}
        />
        <main ref={pageContainerRef} className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { AdminLayout };
export default AdminLayout;
