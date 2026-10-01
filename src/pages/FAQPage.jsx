import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
const FAQS = [
  {
    category: "Booking & Reservations",
    question: "How do I retrieve or change my TigerAirlines reservation?",
    answer: "You can access and modify your itinerary at any time by visiting our Manage Booking portal using your 6-character Booking Reference (PNR) and passenger surname. You can reselect seats, purchase baggage extras, or request cancellations."
  },
  {
    category: "Booking & Reservations",
    question: "Can I hold a fare before making payment?",
    answer: "During the booking flow, your selected flight seats are held exclusively for 8 minutes to allow you to review passenger information and enter secure payment details without losing your fare."
  },
  {
    category: "Baggage Allowances",
    question: "What is the standard checked baggage allowance for TigerAirlines flights?",
    answer: "Economy class tickets include 23 kg of checked baggage and 7 kg of cabin baggage on domestic Nigerian routes, and 30 kg on international routes. Business class passengers receive 40 kg of checked baggage. Additional baggage can be purchased in 5 kg increments via Manage Booking."
  },
  {
    category: "Baggage Allowances",
    question: "Can I carry food items and fragile goods in my check-in baggage?",
    answer: "Food items are generally allowed in checked luggage provided they are sealed. Fragile items like electronics, artworks, and glassware must be declared at check-in. The Nigeria Civil Aviation Authority (NCAA) security directives apply on all TigerAirlines flights."
  },
  {
    category: "Check-in & Boarding",
    question: "When does online check-in open and close?",
    answer: "Online check-in opens 24 hours prior to scheduled flight departure and closes 90 minutes before wheels up. Digital boarding passes can be saved to your mobile wallet or printed."
  },
  {
    category: "Check-in & Boarding",
    question: "What makes Murtala Muhammed Airport (LOS) the hub for TigerAirlines?",
    answer: "Lagos (LOS) is Nigeria's busiest airport and TigerAirlines' main operational hub. We fly to all major Nigerian cities and select international destinations from Terminal 1, Ikeja. Our operations team works closely with the Federal Airports Authority of Nigeria (FAAN)."
  },
  {
    category: "Refunds & Cancellations",
    question: "What is the cancellation policy for TigerAirlines tickets?",
    answer: "Cancellations initiated more than 48 hours prior to departure incur a nominal \u20A615,000 administrative fee, and the net remaining fare is refunded to your original payment card within 3\u20135 business days."
  }
];
const FAQPage = () => {
  const [search, setSearch] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Booking & Reservations", "Baggage Allowances", "Check-in & Boarding", "Refunds & Cancellations"];
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return <div className="bg-background py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {
    /* Header */
  }
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Help Center
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            Find answers to common questions regarding TigerAirlines flight schedules, baggage policies, online check-in, and reservation changes.
          </p>
        </div>

        {
    /* Search Bar */
  }
        <div className="relative max-w-xl mx-auto">
          <input
    type="text"
    placeholder="Search questions (e.g., baggage, check-in, Lagos, refund)..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-surface border border-border rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-xs"
  />
          <Search size={18} className="absolute left-4 top-3.5 text-muted" />
        </div>

        {
    /* Categories */
  }
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => <button
    key={cat}
    type="button"
    onClick={() => setSelectedCategory(cat)}
    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${selectedCategory === cat ? "bg-primary text-white shadow-xs" : "bg-surface border border-border text-muted hover:bg-surface-muted"}`}
  >
              {cat}
            </button>)}
        </div>

        {
    /* FAQ Accordion List */
  }
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <p className="text-sm font-bold text-foreground">No questions found matching "{search}"</p>
              <p className="text-xs text-muted mt-1">Try another search term or contact our 24/7 concierge.</p>
            </div> : filteredFaqs.map((faq, idx) => {
    const isOpen = expandedIndex === idx;
    return <div
      key={idx}
      className="bg-surface rounded-2xl border border-border shadow-2xs overflow-hidden transition"
    >
                  <button
      type="button"
      onClick={() => setExpandedIndex(isOpen ? null : idx)}
      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-muted/50"
    >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{faq.question}</h3>
                    </div>
                    <div className="p-1 rounded-full text-muted bg-surface-muted shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isOpen && <div className="px-5 pb-5 pt-1 text-xs text-muted border-t border-border leading-relaxed bg-background/40">
                      {faq.answer}
                    </div>}
                </div>;
  })}
        </div>

        {
    /* Support CTA card */
  }
        <div className="bg-surface text-foreground rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm border border-border">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-foreground">Still have questions?</h3>
            <p className="text-xs text-muted">
              Our 24/7 Nigeria operations desk and support representatives are ready to assist you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/contact">
              <Button variant="accent" size="sm" className="font-bold whitespace-nowrap">
                Contact Concierge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = FAQPage;
export {
  FAQPage,
  stdin_default as default
};
