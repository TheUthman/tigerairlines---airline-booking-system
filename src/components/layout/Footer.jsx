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
    <footer className="bg-footer text-footer-foreground border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white shadow-sm">
                <img
                  src="/logo.svg"
                  alt="TigerAirlines logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-footer-foreground">
                Tiger
                <span className="font-bold text-primary">Airlines</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              West Africa’s premier aviation network. Book domestic and
              international flights from Lagos, Abuja, and Port Harcourt.
            </p>

            <div className="pt-2">
              <p className="mb-2 text-sm font-semibold text-white/90">
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
                  className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-4 pr-24 text-sm text-white placeholder:text-white/45 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                <button
                  type="submit"
                  className="absolute bottom-1 right-1 top-1 rounded-full bg-primary px-4 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p aria-live="polite" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary">Travel</h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li>
                <Link to="/" className="transition-colors hover:text-primary">
                  Book a flight
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="transition-colors hover:text-primary"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/offers" className="transition-colors hover:text-primary">
                  Offers & deals
                </Link>
              </li>
              <li>
                <Link
                  to="/flight-status"
                  className="transition-colors hover:text-primary"
                >
                  Flight status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary">Your trip</h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li>
                <Link to="/check-in" className="transition-colors hover:text-primary">
                  Online check-in
                </Link>
              </li>
              <li>
                <Link
                  to="/manage-booking"
                  className="transition-colors hover:text-primary"
                >
                  Manage booking
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="transition-colors hover:text-primary">
                  My trips
                </Link>
              </li>
              <li>
                <Link
                  to="/baggage-policy"
                  className="transition-colors hover:text-primary"
                >
                  Baggage policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-primary">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li>
                <Link to="/contact" className="transition-colors hover:text-primary">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-primary">
                  Help centre
                </Link>
              </li>
              <li>
                <Link to="/legal" className="transition-colors hover:text-primary">
                  Legal & conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-primary">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
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
