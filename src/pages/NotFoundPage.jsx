import { Link } from "react-router-dom";
import { Plane, Home, Search, HelpCircle } from "lucide-react";
import Button from "../components/ui/Button";
const NotFoundPage = () => {
  return <div className="min-h-[80vh] bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        {
    /* Animated Flight Icon Graphic */
  }
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center mx-auto shadow-xl shadow-red-900/10 transform -rotate-6">
            <Plane size={54} className="transform rotate-45" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-secondary text-on-secondary font-black text-xs uppercase tracking-wider rounded-full shadow-md">
            Lost In Flight
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-black text-primary tracking-tight block">
            404
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Destination Coordinates Not Found
          </h1>
          <p className="text-xs md:text-sm text-muted max-w-md mx-auto leading-relaxed">
            The flight path you requested does not exist or has been redirected. Let's get you back on course.
          </p>
        </div>

        {
    /* Action CTAs */
  }
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto font-bold gap-2">
              <Home size={15} /> Back to Home
            </Button>
          </Link>
          <Link to="/search" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto font-bold gap-2">
              <Search size={15} /> Search Flights
            </Button>
          </Link>
          <Link to="/faq" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto font-bold gap-2 text-muted">
              <HelpCircle size={15} /> Help Center
            </Button>
          </Link>
        </div>

        {
    /* Helpful links */
  }
        <div className="pt-6 border-t border-border">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
            Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link to="/manage-booking" className="text-muted hover:text-primary hover:underline">
              Manage Booking
            </Link>
            <span className="text-muted">•</span>
            <Link to="/flight-status" className="text-muted hover:text-primary hover:underline">
              Flight Status
            </Link>
            <span className="text-muted">•</span>
            <Link to="/destinations" className="text-muted hover:text-primary hover:underline">
              Destinations
            </Link>
            <span className="text-muted">•</span>
            <Link to="/contact" className="text-muted hover:text-primary hover:underline">
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
var stdin_default = NotFoundPage;
export {
  NotFoundPage,
  stdin_default as default
};
