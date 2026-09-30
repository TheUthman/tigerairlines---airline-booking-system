import { useState, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TopBar from "./TopBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "../ui/ChatWidget";
import AuthModal from "../../features/auth/AuthModal";
import Modal from "../ui/Modal";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
const CustomerLayout = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const location = useLocation();
  const pageContainerRef = useRef(null);
  useGSAP(() => {
    if (pageContainerRef.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      gsap.fromTo(
        pageContainerRef.current,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
      );
    }
  }, [location.pathname]);
  const alerts = [
    {
      id: 1,
      title: "Weather Advisory: Murtala Muhammed Int'l (LOS)",
      desc: "Clear skies and smooth operations across Lagos and Abuja corridors. All scheduled flights on time.",
      time: "15 mins ago",
      type: "info"
    },
    {
      id: 2,
      title: "Flight TG-101 Gate Announcement",
      desc: "Gate D4 assigned for Flight TG-101 to Abuja (ABV). Boarding commences at 07:45 AM.",
      time: "1 hour ago",
      type: "success"
    },
    {
      id: 3,
      title: "NCAA Domestic Travel & ID Reminder",
      desc: "Please ensure valid government-issued ID (NIN / Voter's Card / Passport) is present for boarding.",
      time: "3 hours ago",
      type: "warning"
    }
  ];
  return <div className="flex flex-col min-h-screen">
      <TopBar
    onOpenAuthModal={() => setAuthModalOpen(true)}
    onOpenAlertsModal={() => setAlertsModalOpen(true)}
  />
      <Navbar />
      <main ref={pageContainerRef} className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />


      {
    /* Auth Modal */
  }
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {
    /* Trip Alerts Modal */
  }
      <Modal
    isOpen={alertsModalOpen}
    onClose={() => setAlertsModalOpen(false)}
    title="Active Travel Alerts"
    description="Live notifications regarding your upcoming Nigerian domestic and international flights."
    maxWidth="md"
  >
        <div className="space-y-3 text-xs">
          {alerts.map((al) => <div
    key={al.id}
    className={`p-3.5 rounded-xl border flex items-start gap-3 ${al.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-900" : al.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-primary/10 border-primary/20 text-foreground"}`}
  >
              {al.type === "warning" ? <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" /> : al.type === "success" ? <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <Info size={16} className="text-primary shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">{al.title}</h4>
                  <span className="text-[10px] opacity-60 font-mono">{al.time}</span>
                </div>
                <p className="mt-1 opacity-80 leading-relaxed">{al.desc}</p>
              </div>
            </div>)}
        </div>
      </Modal>
    </div>;
};
var stdin_default = CustomerLayout;
export {
  CustomerLayout,
  stdin_default as default
};
