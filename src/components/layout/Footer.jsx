import { useState } from "react";
import { Facebook, Twitter, Instagram, Youtube, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4e3);
      setEmail("");
    }
  };
  return <footer className="bg-surface-muted text-foreground pt-16 pb-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {
    /* Col 1 & 2: Brand and Newsletter */
  }
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black text-primary tracking-tight">
                Tiger<span className="text-primary font-normal">Airlines</span>
              </span>
            </Link>

            <div className="pt-2">
              <p className="text-xs font-semibold text-foreground mb-2">Subscribe to Our NewsLetter</p>
              <form onSubmit={handleSubscribe} className="flex max-w-sm relative">
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
    className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary-hover text-white px-4 rounded-full text-xs font-semibold transition cursor-pointer shadow-xs"
  >
                  Subscribe
                </button>
              </form>
              {subscribed && <p className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
                  <CheckCircle2 size={14} /> Thank you for subscribing to TigerAirlines!
                </p>}
            </div>

            {
    /* Social Icons */
  }
            <div className="flex items-center gap-2.5 pt-4">
              <a
    href="#facebook"
    aria-label="Facebook"
    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition"
  >
                <Facebook size={14} />
              </a>
              <a
    href="#twitter"
    aria-label="X Twitter"
    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition"
  >
                <Twitter size={14} />
              </a>
              <a
    href="#instagram"
    aria-label="Instagram"
    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition"
  >
                <Instagram size={14} />
              </a>
              <a
    href="#youtube"
    aria-label="YouTube"
    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition"
  >
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {
    /* Col 3: About Airlines */
  }
          <div>
            <h4 className="text-sm font-bold text-primary mb-4">About Airlines</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link to="/media-center" className="hover:text-primary transition">Media Center</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition">Careers</Link></li>
              <li><Link to="/fleet" className="hover:text-primary transition">Our Fleet</Link></li>
              <li><Link to="/news" className="hover:text-primary transition">In News</Link></li>
              <li><Link to="/branches" className="hover:text-primary transition">Our Branches</Link></li>
            </ul>
          </div>

          {
    /* Col 4: Our Service */
  }
          <div>
            <h4 className="text-sm font-bold text-primary mb-4">Our Service</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><Link to="/partner" className="hover:text-primary transition">Partner</Link></li>
              <li><Link to="/vacation" className="hover:text-primary transition">Our Vacation Packages</Link></li>
              <li><Link to="/business-travel" className="hover:text-primary transition">Business Travel</Link></li>
              <li><Link to="/travel-agent" className="hover:text-primary transition">Travel Agent Portal</Link></li>
              <li><Link to="/special-assistance" className="hover:text-primary transition">Special Assistance</Link></li>
            </ul>
          </div>

          {
    /* Col 5: Support */
  }
          <div>
            <h4 className="text-sm font-bold text-primary mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><Link to="/contact" className="hover:text-primary transition">Contact Us</Link></li>
              <li><Link to="/legal" className="hover:text-primary transition">Legal & Conditions</Link></li>
              <li><Link to="/customer-service-plan" className="hover:text-primary transition">Customer Service Plan</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link to="/admin" className="text-primary font-semibold hover:underline">Internal Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-[11px] text-muted">
          <p>© {(/* @__PURE__ */ new Date()).getFullYear()} TigerAirlines Nigeria. All rights reserved. West Africa Premier Aviation Network.</p>
        </div>
      </div>
    </footer>;
};
var stdin_default = Footer;
export {
  Footer,
  stdin_default as default
};
