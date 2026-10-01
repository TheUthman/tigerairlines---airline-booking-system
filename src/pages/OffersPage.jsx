import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Copy, Check, ArrowRight } from "lucide-react";

const OffersPage = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const offers = [
    {
      code: "TIGER2026",
      discount: "20% OFF",
      title: "Lagos to London Escape",
      desc: "Valid on all Economy and Business class bookings from Lagos to London Heathrow.",
      validTill: "01 June 2026",
      badge: "Bestseller",
      theme: "primary"
    },
    {
      code: "NAIJA5",
      discount: "5% OFF",
      title: "All Domestic Round Trips",
      desc: "Automatic discount on any return ticket on Nigerian domestic routes — Lagos, Abuja, PHC, Kano.",
      validTill: "31 December 2026",
      badge: "Popular",
      theme: "gold"
    },
    {
      code: "ABJ45K",
      discount: "₦45,000 Fixed Fare",
      title: "Weekend Abuja Flash Deal",
      desc: "Non-stop flights from Lagos to Abuja every Friday & Sunday. Limited seats available.",
      validTill: "30 November 2026",
      badge: "Limited Seats",
      theme: "dark"
    }
  ];

  const themeClasses = {
    primary: "bg-gradient-to-br from-primary to-primary-dark text-white",
    gold: "bg-gradient-to-br from-secondary to-secondary-hover text-on-secondary",
    dark: "bg-gradient-to-br from-[#1a1a1a] to-primary-dark text-white"
  };

  const mutedText = {
    primary: "text-white/80",
    gold: "text-on-secondary/80",
    dark: "text-white/80"
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-background py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Exclusive Promos</span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mt-1">
            Flight Deals & Promo Codes
          </h1>
          <p className="text-sm text-muted mt-2">
            Save on your upcoming journeys with official TigerAirlines seasonal promotions and vouchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className={`rounded-2xl p-6 shadow-lg ${themeClasses[offer.theme]} flex flex-col justify-between min-h-[20rem]`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-black/15 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    {offer.badge}
                  </span>
                  <Tag size={18} className="opacity-80" />
                </div>
                <div className="text-3xl font-black">{offer.discount}</div>
                <h3 className="text-lg font-bold mt-1">{offer.title}</h3>
                <p className={`text-xs mt-2 leading-relaxed ${mutedText[offer.theme]}`}>{offer.desc}</p>
              </div>

              <div>
                <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between mb-4 border border-white/10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 block">Coupon Code</span>
                    <span className={`font-mono font-bold text-sm ${offer.theme === "gold" ? "text-primary-dark" : "text-secondary"}`}>
                      {offer.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode === offer.code ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className={`flex items-center justify-between text-xs ${mutedText[offer.theme]}`}>
                  <span>Valid until {offer.validTill}</span>
                  <button
                    onClick={() => navigate("/search")}
                    className="font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Apply now <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
