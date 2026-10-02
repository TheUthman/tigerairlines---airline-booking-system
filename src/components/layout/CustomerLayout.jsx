import { useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "../ui/ChatWidget";
import Modal from "../ui/Modal";
import { RouteProgress } from "../ui/LoadingState";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

const CustomerLayout = () => {
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const location = useLocation();
  const pageContainerRef = useRef(null);

  useGSAP(() => {
    if (pageContainerRef.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      gsap.fromTo(
        pageContainerRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
      );
    }
  }, [location.pathname]);

  const alerts = [
    {
      id: 1,
      title: "Weather Advisory: Murtala Muhammed Int'l (LOS)",
      desc: "Clear skies and smooth operations across Lagos and Abuja corridors. All scheduled flights on time.",
      time: "15 mins ago",
      type: "info",
    },
    {
      id: 2,
      title: "Flight TG-101 Gate Announcement",
      desc: "Gate D4 assigned for Flight TG-101 to Abuja (ABV). Boarding commences at 07:45 AM.",
      time: "1 hour ago",
      type: "success",
    },
    {
      id: 3,
      title: "NCAA Domestic Travel & ID Reminder",
      desc: "Please ensure valid government-issued ID (NIN / Voter's Card / Passport) is present for boarding.",
      time: "3 hours ago",
      type: "warning",
    },
  ];

  const alertStyles = {
    warning:
      "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-200",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200",
    info: "bg-primary/10 border-primary/20 text-foreground",
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <RouteProgress />
      <Navbar onOpenAlertsModal={() => setAlertsModalOpen(true)} />
      <main ref={pageContainerRef} className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />

      <Modal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        title="Active Travel Alerts"
        description="Live notifications regarding your upcoming Nigerian domestic and international flights."
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${alertStyles[al.type] || alertStyles.info}`}
            >
              {al.type === "warning" ? (
                <AlertTriangle
                  size={16}
                  className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                />
              ) : al.type === "success" ? (
                <CheckCircle
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                />
              ) : (
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold leading-snug">{al.title}</h4>
                  <span className="text-[10px] opacity-60 font-mono shrink-0">
                    {al.time}
                  </span>
                </div>
                <p className="mt-1 opacity-80 leading-relaxed">{al.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CustomerLayout;
