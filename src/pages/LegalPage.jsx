import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Shield, FileText, Luggage, HeartHandshake } from "lucide-react";
const LegalPage = () => {
  const location = useLocation();
  const getInitialSection = () => {
    if (location.pathname.includes("privacy")) return "privacy";
    if (location.pathname.includes("baggage")) return "baggage";
    if (location.pathname.includes("customer-service")) return "service";
    return "terms";
  };
  const [activeSection, setActiveSection] = useState(
    getInitialSection()
  );
  useEffect(() => {
    setActiveSection(getInitialSection());
  }, [location.pathname]);
  return <div className="min-h-screen bg-background py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {
    /* Header */
  }
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Legal & Customer Policies
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Policies & Conditions of Carriage
          </h1>
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            TigerAirlines Nigeria operational terms, customer rights, baggage rules, and privacy commitments.
          </p>
        </div>

        {
    /* Content Container */
  }
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {
    /* Navigation Sidebar */
  }
          <div className="space-y-2">
            {[
    { id: "terms", label: "Conditions of Carriage", icon: FileText, path: "/terms" },
    { id: "privacy", label: "Privacy Policy", icon: Shield, path: "/privacy" },
    { id: "baggage", label: "Baggage Policy", icon: Luggage, path: "/baggage-policy" },
    { id: "service", label: "Customer Service Plan", icon: HeartHandshake, path: "/customer-service-plan" }
  ].map((item) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    return <button
      key={item.id}
      type="button"
      onClick={() => setActiveSection(item.id)}
      className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 cursor-pointer ${isActive ? "bg-primary text-white shadow-sm" : "bg-surface hover:bg-surface-muted text-foreground border border-border"}`}
    >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>;
  })}
          </div>

          {
    /* Policy Text Card */
  }
          <div className="md:col-span-3 bg-surface rounded-3xl p-6 md:p-10 border border-border shadow-sm text-foreground text-xs leading-relaxed space-y-6">
            {activeSection === "terms" && <div className="space-y-4">
                <h2 className="text-xl font-black text-foreground pb-2 border-b border-border">
                  General Conditions of Carriage
                </h2>
                <p>
                  <strong>1. Applicable Law & Regulatory Jurisdiction:</strong> Carriage by TigerAirlines is subject to the Civil Aviation Act of the Federal Republic of Nigeria and Nigerian Civil Aviation Authority (NCAA) regulations, as well as international conventions governing carriage by air (including the Montreal Convention 1999).
                </p>
                <p>
                  <strong>2. Harmattan & Severe Weather Operating Protocols:</strong> Flights operating across Nigerian airspace, particularly northern hubs during seasonal harmattan haze or coastal hubs like Lagos (LOS) and Port Harcourt (PHC) during severe tropical thunderstorms, adhere strictly to NCAA instrument flight rules. Flights may be delayed or diverted to Abuja (ABV) or Enugu (ENU) for passenger safety.
                </p>
                <p>
                  <strong>3. Ticket Validity & Non-Transferability:</strong> Flight tickets are valid exclusively for the passenger named on the reservation and cannot be transferred to third parties.
                </p>
                <p>
                  <strong>4. Check-in & Gate Closure:</strong> Check-in counters close strictly 60 minutes before departure for international flights. Boarding gates close 20 minutes prior to pushback.
                </p>
              </div>}

            {activeSection === "privacy" && <div className="space-y-4">
                <h2 className="text-xl font-black text-foreground pb-2 border-b border-border">
                  TigerAirlines Privacy Policy
                </h2>
                <p>
                  <strong>1. Personal Data Collected:</strong> We collect essential information required to fulfill flight bookings, including your full legal name, passport information, contact details, payment transaction identifiers, and dietary requirements.
                </p>
                <p>
                  <strong>2. Transmission to Border Security Authorities:</strong> In accordance with the Nigeria Immigration Service and international aviation regulations, passenger manifest data is securely transmitted to relevant border control authorities.
                </p>
                <p>
                  <strong>3. Data Protection:</strong> TigerAirlines does not sell or lease personal passenger data. All transactional details are processed with 256-bit SSL encryption.
                </p>
              </div>}

            {activeSection === "baggage" && <div className="space-y-4">
                <h2 className="text-xl font-black text-foreground pb-2 border-b border-border">
                  Comprehensive Baggage Policy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-background rounded-2xl border border-border">
                    <p className="font-bold text-foreground text-sm">Economy Class</p>
                    <ul className="mt-2 space-y-1 text-muted">
                      <li>• Checked Bag: 20 kg included</li>
                      <li>• Cabin Hand Baggage: 1 bag (7 kg)</li>
                      <li>• 1 small personal item (laptop/purse)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-background rounded-2xl border border-border">
                    <p className="font-bold text-primary text-sm">Royal Business Class</p>
                    <ul className="mt-2 space-y-1 text-muted">
                      <li>• Checked Bags: 40 kg included</li>
                      <li>• Cabin Hand Baggage: 2 bags (10 kg each)</li>
                      <li>• Dedicated Priority Baggage Tag</li>
                    </ul>
                  </div>
                </div>
                <p>
                  <strong>Prohibited Items:</strong> Lithium-ion spare batteries, fireworks, compressed fuel containers, and corrosive materials are strictly banned in checked luggage.
                </p>
              </div>}

            {activeSection === "service" && <div className="space-y-4">
                <h2 className="text-xl font-black text-foreground pb-2 border-b border-border">
                  Customer Service Commitment Plan
                </h2>
                <p>
                  <strong>1. Flight Delay Notifications:</strong> In case of scheduled adjustments, passengers are promptly informed via SMS and email within 30 minutes of notification.
                </p>
                <p>
                  <strong>2. Seamless Rebooking:</strong> When flights are cancelled due to operational or weather disruptions, TigerAirlines guarantees free rebooking on the next available flight or a 100% full refund with zero cancellation penalties.
                </p>
                <p>
                  <strong>3. Accessible Travel:</strong> Complimentary wheelchair assistance and specialized boarding services are provided at all TigerAirlines airport stations.
                </p>
              </div>}

            <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span>Last updated: September 2026</span>
              <span className="font-bold text-primary">TigerAirlines Nigeria</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = LegalPage;
export {
  LegalPage,
  stdin_default as default
};
