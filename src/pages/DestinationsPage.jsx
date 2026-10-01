import { useNavigate } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import { useAppDispatch } from "../app/store";
import { setSearchParams } from "../features/booking/bookingSlice";
const DestinationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const destinations = [
    {
      city: "Abuja",
      country: "Nigeria",
      code: "ABV",
      price: 45e3,
      image: "https://images.unsplash.com/photo-1612874983384-bf5e47db3d07?w=600&auto=format&fit=crop&q=80",
      description: "Nigeria's Federal Capital Territory \u2014 Aso Rock, national monuments, and a laid-back cosmopolitan lifestyle."
    },
    {
      city: "Port Harcourt",
      country: "Nigeria",
      code: "PHC",
      price: 38e3,
      image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&auto=format&fit=crop&q=80",
      description: "The Garden City and commercial heart of Nigeria's oil-rich Niger Delta region."
    },
    {
      city: "Kano",
      country: "Nigeria",
      code: "KAN",
      price: 52e3,
      image: "https://images.unsplash.com/photo-1598881034666-5e30c9b08fcf?w=600&auto=format&fit=crop&q=80",
      description: "Ancient city famous for its colourful leather markets, textiles, and Emir's Palace."
    },
    {
      city: "Dubai",
      country: "UAE",
      code: "DXB",
      price: 42e4,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
      description: "Architectural marvels, luxury shopping, and unforgettable desert safari experiences."
    },
    {
      city: "London",
      country: "United Kingdom",
      code: "LHR",
      price: 48e4,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80",
      description: "World-class museums, iconic landmarks, and the vibrant Nigerian diaspora hub of Peckham."
    },
    {
      city: "Johannesburg",
      country: "South Africa",
      code: "JNB",
      price: 31e4,
      image: "https://images.unsplash.com/photo-1559229750-60b7df976107?w=600&auto=format&fit=crop&q=80",
      description: "Vibrant Jozi streetlife, Soweto township tours, and the gateway to sub-Saharan Africa."
    }
  ];
  const handleBook = (code) => {
    dispatch(
      setSearchParams({
        originCode: "LOS",
        destinationCode: code,
        departDate: "2026-10-15",
        returnDate: "2026-10-22",
        tripType: "roundTrip",
        cabinClass: "Economy",
        passengersCount: 1
      })
    );
    navigate(`/search?from=LOS&to=${code}`);
  };
  return <div className="bg-background py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Explore The World</span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mt-1">
            International & Domestic Destinations from Nigeria
          </h1>
          <p className="text-xs md:text-sm text-muted mt-2">
            Fly directly from Lagos, Abuja and Port Harcourt to domestic destinations and international hubs aboard TigerAirlines modern fleet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => <div
    key={dest.code}
    className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border flex flex-col justify-between group"
  >
              <div className="relative h-52 overflow-hidden">
                <img
    src={dest.image}
    alt={dest.city}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  />
                <div className="absolute top-3 right-3 bg-primary text-white p-1.5 rounded-lg shadow-md">
                  <Plane size={14} className="-rotate-45" />
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-mono font-bold">
                  LOS → {dest.code}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-xl font-black text-foreground">{dest.city}</h3>
                    <span className="text-xs font-semibold text-muted">{dest.country}</span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mt-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted uppercase font-semibold block">Starting from</span>
                    <span className="text-xl font-black text-primary">₦{dest.price.toLocaleString("en-NG")}</span>
                  </div>
                  <Button
    variant="accent"
    size="sm"
    onClick={() => handleBook(dest.code)}
    className="font-bold flex items-center gap-1.5"
  >
                    <span>Book Flight</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
var stdin_default = DestinationsPage;
export {
  DestinationsPage,
  stdin_default as default
};
