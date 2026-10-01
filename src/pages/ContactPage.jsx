import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pnr: "",
    subject: "General Inquiry",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        "Thank you! Your inquiry has been routed to our Lagos operations desk. Case #TG-" + Math.floor(1e5 + Math.random() * 9e5),
        "Inquiry Submitted"
      );
      setFormData({
        name: "",
        email: "",
        pnr: "",
        subject: "General Inquiry",
        message: ""
      });
    }, 800);
  };
  return <div className="bg-background py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {
    /* Header */
  }
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Passenger Assistance
          </span>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Contact TigerAirlines Support
          </h1>
          <p className="text-xs md:text-sm text-muted leading-relaxed">
            Need assistance with your booking, baggage inquiries, or travel disruption waivers? We are here around the clock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {
    /* Contact Information & Channels */
  }
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
              <h2 className="text-base font-black text-foreground">Direct Contact Channels</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">24/7 Flight Operations Desk</p>
                    <p className="text-muted font-mono mt-0.5">+234 1 279 0000</p>
                    <p className="text-[11px] text-muted">Toll-free Nigeria line: 0800 TIGER 1</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Customer Concierge Email</p>
                    <p className="text-muted font-mono mt-0.5">concierge@tigerairlines.ng</p>
                    <p className="text-[11px] text-muted">Average response: 2–4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Headquarters Station</p>
                    <p className="text-muted mt-0.5">Murtala Muhammed International Airport (LOS)</p>
                    <p className="text-[11px] text-muted">Terminal 1, Ikeja, Lagos State, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Operational Working Hours</p>
                    <p className="text-muted mt-0.5">Monday – Sunday: 24 Hours</p>
                    <p className="text-[11px] text-muted">West Africa Time (WAT, UTC +1)</p>
                  </div>
                </div>
              </div>
            </div>

            {
    /* Quick Tip Card */
  }
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 space-y-1.5">
              <p className="font-bold">Fast-Track Your Request</p>
              <p className="text-amber-900 leading-relaxed">
                If you have an existing booking reference (PNR), please include it in your message for immediate access to your flight file.
              </p>
            </div>
          </div>

          {
    /* Contact Support Form */
  }
          <div className="md:col-span-2 bg-surface rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground">Send an Inquiry or Message</h2>
              <p className="text-xs text-muted mt-1">
                Fill out the form below and our passenger support team will follow up via email.
              </p>
            </div>

            {submitted && <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Your message has been received! Our support specialists will respond shortly.</span>
              </div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Your Full Name *</label>
                  <input
    type="text"
    required
    placeholder="e.g. Chukwuemeka Obi"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">Email Address *</label>
                  <input
    type="email"
    required
    placeholder="e.g. passenger@domain.com"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Booking Reference (PNR)</label>
                  <input
    type="text"
    placeholder="Optional (e.g. TG88JK)"
    value={formData.pnr}
    onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">Topic / Subject</label>
                  <select
    value={formData.subject}
    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
  >
                    <option value="General Inquiry">General Flight Inquiry</option>
                    <option value="Booking Modification">Change or Reschedule Booking</option>
                    <option value="Baggage Claim">Delayed or Damaged Baggage</option>
                    <option value="Special Assistance">Wheelchair / Medical Assistance</option>
                    <option value="Refund Request">Fare Refund or Cancellation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">Detailed Message *</label>
                <textarea
    rows={4}
    required
    placeholder="Describe your inquiry or requirement..."
    value={formData.message}
    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
    className="w-full bg-surface border border-border rounded-xl p-3.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
  />
              </div>

              <div className="pt-2">
                <Button
    type="submit"
    variant="primary"
    isLoading={loading}
    className="w-full sm:w-auto font-bold gap-2"
  >
                  <Send size={15} /> Submit Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = ContactPage;
export {
  ContactPage,
  stdin_default as default
};
