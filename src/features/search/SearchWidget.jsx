import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, ChevronDown, History } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setSearchParams } from "../booking/bookingSlice";
import flightService from "../../services/flightService";
const STORAGE_RECENT_KEY = "tigerairlines_recent_searches";
const SearchWidget = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentParams = useAppSelector((state) => state.booking.searchParams);
  const [tripType, setTripType] = useState("roundTrip");
  const [fromCode, setFromCode] = useState(currentParams.originCode || "LOS");
  const [toCode, setToCode] = useState(currentParams.destinationCode || "ABV");
  const [departDate, setDepartDate] = useState(currentParams.departDate || "2026-10-15");
  const [returnDate, setReturnDate] = useState(currentParams.returnDate || "2026-10-22");
  const [cabinClass, setCabinClass] = useState("Economy");
  const [airports, setAirports] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "1", from: "LOS", to: "ABV", departDate: "2026-10-15", tripType: "roundTrip", label: "Lagos (LOS) \u2192 Abuja (ABV)" },
      { id: "2", from: "LOS", to: "DXB", departDate: "2026-10-18", tripType: "oneWay", label: "Lagos (LOS) \u2192 Dubai (DXB)" },
      { id: "3", from: "ABV", to: "LHR", departDate: "2026-10-20", tripType: "roundTrip", label: "Abuja (ABV) \u2192 London (LHR)" }
    ];
  });
  useEffect(() => {
    flightService.getAirports().then((res) => {
      if (res.data) setAirports(res.data);
    });
  }, []);
  const saveRecentSearch = (from, to, date, type) => {
    const newItem = {
      id: Date.now().toString(),
      from,
      to,
      departDate: date,
      tripType: type,
      label: `${from} \u2192 ${to}`
    };
    const filtered = recentSearches.filter((s) => !(s.from === from && s.to === to));
    const updated = [newItem, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    saveRecentSearch(fromCode, toCode, departDate, tripType);
    dispatch(
      setSearchParams({
        originCode: fromCode,
        destinationCode: toCode,
        departDate,
        returnDate,
        tripType,
        cabinClass,
        passengersCount: 1
      })
    );
    navigate(`/search?from=${fromCode}&to=${toCode}&depart=${departDate}&type=${tripType}&class=${cabinClass}`);
  };
  const applyRecentSearch = (item) => {
    setFromCode(item.from);
    setToCode(item.to);
    setDepartDate(item.departDate);
    dispatch(
      setSearchParams({
        originCode: item.from,
        destinationCode: item.to,
        departDate: item.departDate,
        returnDate,
        tripType: item.tripType,
        cabinClass,
        passengersCount: 1
      })
    );
    navigate(`/search?from=${item.from}&to=${item.to}&depart=${item.departDate}&type=${item.tripType}&class=${cabinClass}`);
  };
  return <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-surface rounded-3xl shadow-2xl p-5 md:p-8 border border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-5">
          Where would you like to go?
        </h2>

        <form onSubmit={handleSearch}>
          {
    /* Trip Type Radio Options */
  }
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-5 text-xs sm:text-sm text-foreground">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
    type="radio"
    name="tripType"
    value="roundTrip"
    checked={tripType === "roundTrip"}
    onChange={() => setTripType("roundTrip")}
    className="w-4 h-4 text-primary focus:ring-primary accent-primary"
  />
              <span>Round Trip</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
    type="radio"
    name="tripType"
    value="oneWay"
    checked={tripType === "oneWay"}
    onChange={() => setTripType("oneWay")}
    className="w-4 h-4 text-primary focus:ring-primary accent-primary"
  />
              <span>One-Way</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
    type="radio"
    name="tripType"
    value="direct"
    checked={tripType === "direct"}
    onChange={() => setTripType("direct")}
    className="w-4 h-4 text-primary focus:ring-primary accent-primary"
  />
              <span>Direct Non-Stop</span>
            </label>
          </div>

          {
    /* Search Inputs Grid - fully responsive for mobile (stacked) and desktop (grid-12) */
  }
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 border border-border rounded-2xl overflow-hidden shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-border bg-surface">
            {
    /* From */
  }
            <div className="lg:col-span-3 p-3.5 flex flex-col justify-center hover:bg-surface-muted/70 transition">
              <label htmlFor="origin-select" className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5">
                From
              </label>
              <div className="relative">
                <select
    id="origin-select"
    value={fromCode}
    onChange={(e) => setFromCode(e.target.value)}
    className="w-full bg-transparent text-sm font-bold text-foreground focus:outline-none appearance-none cursor-pointer pr-6 truncate"
  >
                  <option value="LOS">Lagos, Nigeria (LOS)</option>
                  <option value="ABV">Abuja, Nigeria (ABV)</option>
                  <option value="PHC">Port Harcourt, Nigeria (PHC)</option>
                  <option value="KAN">Kano, Nigeria (KAN)</option>
                  <option value="DXB">Dubai, UAE (DXB)</option>
                  <option value="LHR">London, UK (LHR)</option>
                  <option value="JNB">Johannesburg, SA (JNB)</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1 text-muted pointer-events-none" />
              </div>
            </div>

            {
    /* To */
  }
            <div className="lg:col-span-3 p-3.5 flex flex-col justify-center hover:bg-surface-muted/70 transition">
              <label htmlFor="dest-select" className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5">
                To
              </label>
              <div className="relative">
                <select
    id="dest-select"
    value={toCode}
    onChange={(e) => setToCode(e.target.value)}
    className="w-full bg-transparent text-sm font-bold text-foreground focus:outline-none appearance-none cursor-pointer pr-6 truncate"
  >
                  <option value="ABV">Abuja, Nigeria (ABV)</option>
                  <option value="LOS">Lagos, Nigeria (LOS)</option>
                  <option value="PHC">Port Harcourt, Nigeria (PHC)</option>
                  <option value="KAN">Kano, Nigeria (KAN)</option>
                  <option value="DXB">Dubai, UAE (DXB)</option>
                  <option value="LHR">London, UK (LHR)</option>
                  <option value="JNB">Johannesburg, SA (JNB)</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1 text-muted pointer-events-none" />
              </div>
            </div>

            {
    /* Depart */
  }
            <div className="lg:col-span-2 p-3.5 flex flex-col justify-center hover:bg-surface-muted/70 transition">
              <label htmlFor="depart-date-input" className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5">
                Depart
              </label>
              <div className="flex items-center justify-between">
                <input
    id="depart-date-input"
    type="date"
    value={departDate}
    onChange={(e) => setDepartDate(e.target.value)}
    className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
  />
                <Calendar size={14} className="text-muted shrink-0 ml-1" />
              </div>
            </div>

            {
    /* Return */
  }
            <div
    className={`lg:col-span-2 p-3.5 flex flex-col justify-center transition ${tripType === "oneWay" ? "bg-background opacity-40" : "hover:bg-surface-muted/70"}`}
  >
              <label htmlFor="return-date-input" className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5">
                Return
              </label>
              <div className="flex items-center justify-between">
                <input
    id="return-date-input"
    type="date"
    disabled={tripType === "oneWay"}
    value={returnDate}
    onChange={(e) => setReturnDate(e.target.value)}
    className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer disabled:cursor-not-allowed"
  />
                <Calendar size={14} className="text-muted shrink-0 ml-1" />
              </div>
            </div>

            {
    /* Class & Search Button Container */
  }
            <div className="lg:col-span-2 p-3 flex items-center justify-between gap-2 hover:bg-surface-muted/70 transition">
              <div className="flex-1 min-w-0">
                <label htmlFor="cabin-select" className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5 block">
                  Class
                </label>
                <div className="relative">
                  <select
    id="cabin-select"
    value={cabinClass}
    onChange={(e) => setCabinClass(e.target.value)}
    className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none appearance-none cursor-pointer pr-4"
  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-0.5 text-muted pointer-events-none" />
                </div>
              </div>

              <button
    type="submit"
    className="hidden lg:flex w-12 h-12 rounded-xl bg-primary hover:bg-primary-hover text-on-primary items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer shrink-0"
    title="Search Flights"
    aria-label="Search Flights"
  >
                <Search size={20} />
              </button>
            </div>
          </div>

          <button
    type="submit"
    className="lg:hidden mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 rounded-2xl text-sm shadow-md cursor-pointer"
  >
            <Search size={16} />
            Search flights
          </button>

          {
    /* Recent Searches Row */
  }
          {recentSearches.length > 0 && <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted font-bold uppercase text-[10px] flex items-center gap-1">
                <History size={12} /> Recent:
              </span>
              {recentSearches.map((s) => <button
    key={s.id}
    type="button"
    onClick={() => applyRecentSearch(s)}
    className="px-2.5 py-1 bg-background hover:bg-primary/10 text-foreground hover:text-primary border border-border rounded-lg text-xs font-medium transition cursor-pointer"
  >
                  {s.label}
                </button>)}
            </div>}
        </form>
      </div>
    </div>;
};
var stdin_default = SearchWidget;
export {
  SearchWidget,
  stdin_default as default
};
