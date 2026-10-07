import { useNavigate } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import Button from "../components/ui/Button";
import { useAppDispatch } from "../app/store";
import { setSearchParams } from "../features/booking/bookingSlice";
import { formatNaira } from "../utils/formatNaira";

const destinations = [
  {
    city: "Abuja",
    country: "Nigeria",
    code: "ABV",
    price: 45e3,
    image:
      "https://images.unsplash.com/photo-1612874983384-bf5e47db3d07?w=800&auto=format&fit=crop&q=80",
    description:
      "Nigeria’s Federal Capital Territory — Aso Rock, national monuments, and a relaxed cosmopolitan lifestyle.",
  },
  {
    city: "Port Harcourt",
    country: "Nigeria",
    code: "PHC",
    price: 38e3,
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&auto=format&fit=crop&q=80",
    description:
      "The Garden City and commercial heart of Nigeria’s oil-rich Niger Delta region.",
  },
  {
    city: "Kano",
    country: "Nigeria",
    code: "KAN",
    price: 52e3,
    image:
      "https://images.unsplash.com/photo-1598881034666-5e30c9b08fcf?w=800&auto=format&fit=crop&q=80",
    description:
      "An ancient city known for colourful leather markets, textiles, and the Emir’s Palace.",
  },
  {
    city: "Dubai",
    country: "UAE",
    code: "DXB",
    price: 42e4,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
    description:
      "Architectural landmarks, luxury shopping, and desert experiences.",
  },
  {
    city: "London",
    country: "United Kingdom",
    code: "LHR",
    price: 48e4,
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
    description:
      "World-class museums, historic landmarks, and a vibrant Nigerian community.",
  },
  {
    city: "Johannesburg",
    country: "South Africa",
    code: "JNB",
    price: 31e4,
    image:
      "https://images.unsplash.com/photo-1559229750-60b7df976107?w=800&auto=format&fit=crop&q=80",
    description:
      "Vibrant city culture, Soweto history, and a gateway to southern Africa.",
  },
];

const DestinationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleBook = (code) => {
    dispatch(
      setSearchParams({
        originCode: "LOS",
        destinationCode: code,
        departDate: "2026-10-15",
        returnDate: "2026-10-22",
        tripType: "roundTrip",
        cabinClass: "Economy",
        passengersCount: 1,
      }),
    );
    navigate(`/search?from=LOS&to=${code}`);
  };

  return (
    <main className="page-container space-y-8 py-10 md:py-12">
      <header className="page-header">
        <div>
          <p className="page-kicker">Destination guide</p>
          <h1 className="page-title">Choose your next destination</h1>
          <p className="page-description">
            Explore the current Tiger Airlines route collection, from Nigerian city breaks to international hubs.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          <Plane size={17} className="text-primary" aria-hidden="true" />
          Departing from <span className="font-mono font-bold text-foreground">LOS</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((destination) => (
          <article
            key={destination.code}
            className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-52 overflow-hidden bg-surface-muted sm:h-56">
              <img
                src={destination.image}
                alt={`${destination.city}, ${destination.country}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-3 top-3 rounded-lg border border-white/20 bg-[#171717]/75 px-3 py-1.5 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                LOS → {destination.code}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    {destination.city}
                  </p>
                  <p className="mt-1 text-sm text-muted">{destination.country}</p>
                </div>
                <span className="rounded-lg border border-primary/20 bg-primary-soft px-2.5 py-1.5 font-mono text-xs font-bold text-primary-dark dark:text-primary">
                  {destination.code}
                </span>
              </div>

              <p className="mt-4 min-h-12 text-sm leading-relaxed text-muted">
                {destination.description}
              </p>

              <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
                <div>
                  <span className="block text-xs font-medium text-muted">Starting from</span>
                  <span className="mt-1 block text-lg font-semibold text-foreground">
                    {formatNaira(destination.price)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleBook(destination.code)}
                  className="shrink-0"
                >
                  Search flights <ArrowRight size={14} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export { DestinationsPage };
export default DestinationsPage;
