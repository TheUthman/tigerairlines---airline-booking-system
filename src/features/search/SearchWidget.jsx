import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronDown, History, MapPin, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setSearchParams } from "../booking/bookingSlice";

const STORAGE_RECENT_KEY = "tigerairlines_recent_searches";

const airportOptions = [
  { code: "LOS", label: "Lagos, Nigeria" },
  { code: "ABV", label: "Abuja, Nigeria" },
  { code: "PHC", label: "Port Harcourt, Nigeria" },
  { code: "KAN", label: "Kano, Nigeria" },
  { code: "DXB", label: "Dubai, UAE" },
  { code: "LHR", label: "London, UK" },
  { code: "JNB", label: "Johannesburg, South Africa" },
];

const getSearchResultsUrl = ({ from, to, departDate, returnDate, tripType, cabinClass }) => {
  const query = new URLSearchParams({
    from,
    to,
    depart: departDate,
    "return": returnDate,
    type: tripType,
    "class": cabinClass,
  });

  return `/search?${query.toString()}`;
};

const SearchField = ({ label, fieldId, icon: Icon, children, className = "" }) => (
  <div className={`group flex min-h-[76px] min-w-0 flex-col justify-center rounded-xl border border-border bg-background px-3.5 py-3 transition-all duration-150 hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${className}`}>
    <label htmlFor={fieldId} className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
      {Icon && <Icon aria-hidden="true" size={13} className="text-primary" />}
      {label}
    </label>
    {children}
  </div>
);

const SearchWidget = () => {
  const navigate = useNavigate();
  const [searchQuery] = useSearchParams();
  const dispatch = useAppDispatch();
  const currentParams = useAppSelector((state) => state.booking.searchParams);
  const [tripType, setTripType] = useState(
    searchQuery.get("type") || currentParams.tripType || "roundTrip",
  );
  const [fromCode, setFromCode] = useState(
    searchQuery.get("from") || currentParams.originCode || "LOS",
  );
  const [toCode, setToCode] = useState(
    searchQuery.get("to") || currentParams.destinationCode || "ABV",
  );
  const [departDate, setDepartDate] = useState(
    searchQuery.get("depart") || currentParams.departDate || "2026-10-15",
  );
  const [returnDate, setReturnDate] = useState(
    searchQuery.get("return") || currentParams.returnDate || "2026-10-22",
  );
  const [cabinClass, setCabinClass] = useState(
    searchQuery.get("class") || currentParams.cabinClass || "Economy",
  );
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error(error);
    }

    return [
      { id: "1", from: "LOS", to: "ABV", departDate: "2026-10-15", tripType: "roundTrip", label: "Lagos (LOS) → Abuja (ABV)" },
      { id: "2", from: "LOS", to: "DXB", departDate: "2026-10-18", tripType: "oneWay", label: "Lagos (LOS) → Dubai (DXB)" },
      { id: "3", from: "ABV", to: "LHR", departDate: "2026-10-20", tripType: "roundTrip", label: "Abuja (ABV) → London (LHR)" },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error(error);
    }
  }, [recentSearches]);

  const saveRecentSearch = (from, to, date, type) => {
    const newItem = {
      id: Date.now().toString(),
      from,
      to,
      departDate: date,
      tripType: type,
      label: `${from} → ${to}`,
    };
    const filtered = recentSearches.filter((search) => !(search.from === from && search.to === to));
    setRecentSearches([newItem, ...filtered].slice(0, 5));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    saveRecentSearch(fromCode, toCode, departDate, tripType);
    dispatch(
      setSearchParams({
        originCode: fromCode,
        destinationCode: toCode,
        departDate,
        returnDate,
        tripType,
        cabinClass,
        passengersCount: 1,
      }),
    );
    navigate(
      getSearchResultsUrl({
        from: fromCode,
        to: toCode,
        departDate,
        returnDate,
        tripType,
        cabinClass,
      }),
    );
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
        passengersCount: 1,
      }),
    );
    navigate(
      getSearchResultsUrl({
        from: item.from,
        to: item.to,
        departDate: item.departDate,
        returnDate,
        tripType: item.tripType,
        cabinClass,
      }),
    );
  };

  return (
    <div className="relative z-30 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-primary">Flight search</p>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Where would you like to go?
            </h2>
          </div>
          <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Search aria-hidden="true" size={18} />
          </span>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Trip type</legend>
            {[
              { value: "roundTrip", label: "Round trip" },
              { value: "oneWay", label: "One-way" },
              { value: "direct", label: "Direct non-stop" },
            ].map((option) => (
              <label
                key={option.value}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
                  tripType === option.value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  name="tripType"
                  value={option.value}
                  checked={tripType === option.value}
                  onChange={() => setTripType(option.value)}
                  className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12">
            <SearchField label="From" fieldId="origin-select" icon={MapPin} className="lg:col-span-2">
              <div className="relative">
                <select
                  id="origin-select"
                  value={fromCode}
                  onChange={(event) => setFromCode(event.target.value)}
                  className="w-full appearance-none truncate bg-transparent pr-6 text-sm font-semibold text-foreground focus:outline-none"
                >
                  {airportOptions.map((airport) => (
                    <option key={airport.code} value={airport.code}>{`${airport.label} (${airport.code})`}</option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-0 top-1 text-muted" />
              </div>
            </SearchField>

            <SearchField label="To" fieldId="dest-select" icon={MapPin} className="lg:col-span-2">
              <div className="relative">
                <select
                  id="dest-select"
                  value={toCode}
                  onChange={(event) => setToCode(event.target.value)}
                  className="w-full appearance-none truncate bg-transparent pr-6 text-sm font-semibold text-foreground focus:outline-none"
                >
                  {airportOptions.map((airport) => (
                    <option key={airport.code} value={airport.code}>{`${airport.label} (${airport.code})`}</option>
                  ))}
                </select>
                <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-0 top-1 text-muted" />
              </div>
            </SearchField>

            <SearchField label="Depart" fieldId="depart-date-input" icon={CalendarDays} className="lg:col-span-2">
              <input
                id="depart-date-input"
                type="date"
                value={departDate}
                onChange={(event) => setDepartDate(event.target.value)}
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground focus:outline-none"
              />
            </SearchField>

            <SearchField
              label="Return"
              fieldId="return-date-input"
              icon={CalendarDays}
              className={`lg:col-span-2 ${tripType === "oneWay" ? "opacity-55" : ""}`}
            >
              <input
                id="return-date-input"
                type="date"
                disabled={tripType === "oneWay"}
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground focus:outline-none disabled:cursor-not-allowed"
              />
            </SearchField>

            <SearchField label="Cabin class" fieldId="cabin-select" className="lg:col-span-2">
              <div className="relative">
                <select
                  id="cabin-select"
                  value={cabinClass}
                  onChange={(event) => setCabinClass(event.target.value)}
                  className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-foreground focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                </select>
                <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-0 top-1 text-muted" />
              </div>
            </SearchField>

            <button
              type="submit"
              className="inline-flex min-h-[76px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:col-span-2"
            >
              <Search aria-hidden="true" size={17} />
              <span>Search flights</span>
            </button>
          </div>

          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="inline-flex items-center gap-1.5 pr-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                <History aria-hidden="true" size={13} />
                Recent searches
              </span>
              {recentSearches.map((search) => (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => applyRecentSearch(search)}
                  aria-label={`Search ${search.label} again`}
                  className="min-h-8 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {search.label}
                </button>
              ))}
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default SearchWidget;
