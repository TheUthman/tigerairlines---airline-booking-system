import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="bg-surface-muted text-foreground pt-16 pb-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/90 border border-border shadow-sm flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="TigerAirlines logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-2xl font-black text-primary tracking-tight">
                Tiger
                <span className="text-secondary font-extrabold">Airlines</span>
              </span>
            </Link>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              West Africa’s premier aviation network. Book domestic and
              international flights from Lagos, Abuja, and Port Harcourt.
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-foreground mb-2">
                Subscribe to our newsletter
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex max-w-sm relative"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-surface border border-border rounded-full pl-4 pr-24 py-2 text-xs text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary-hover text-on-primary px-4 rounded-full text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  <CheckCircle2 size={14} /> Thank you for subscribing to
                  TigerAirlines!
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              {[
                { href: "#facebook", label: "Facebook", icon: Facebook },
                { href: "#twitter", label: "X Twitter", icon: Twitter },
                { href: "#instagram", label: "Instagram", icon: Instagram },
                { href: "#youtube", label: "YouTube", icon: Youtube },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-4">Travel</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li>
                <Link to="/" className="hover:text-primary transition">
                  Book a flight
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="hover:text-primary transition"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-primary transition">
                  Offers & deals
                </Link>
              </li>
              <li>
                <Link
                  to="/flight-status"
                  className="hover:text-primary transition"
                >
                  Flight status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-4">Your trip</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li>
                <Link to="/check-in" className="hover:text-primary transition">
                  Online check-in
                </Link>
              </li>
              <li>
                <Link
                  to="/manage-booking"
                  className="hover:text-primary transition"
                >
                  Manage booking
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-primary transition">
                  My trips
                </Link>
              </li>
              <li>
                <Link
                  to="/baggage-policy"
                  className="hover:text-primary transition"
                >
                  Baggage policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li>
                <Link to="/contact" className="hover:text-primary transition">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition">
                  Help centre
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-primary transition">
                  Legal & conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
          <p>
            © {new Date().getFullYear()} TigerAirlines Nigeria. All rights
            reserved.
          </p>
          <p>West Africa Premier Aviation Network</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
