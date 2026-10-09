import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  History,
  Search,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setSearchParams } from "../booking/bookingSlice";
import flightService from "../../services/flightService";
import { getApiErrorMessage } from "../../services/apiClient";

const STORAGE_RECENT_KEY = "tigerairlines_recent_searches";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SearchWidget = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentParams = useAppSelector((state) => state.booking.searchParams);
  const [tripType, setTripType] = useState(
    currentParams.tripType || "roundTrip",
  );
  const [fromCode, setFromCode] = useState(currentParams.originCode || "");
  const [toCode, setToCode] = useState(currentParams.destinationCode || "");
  const [departDate, setDepartDate] = useState(currentParams.departDate || "");
  const [returnDate, setReturnDate] = useState(currentParams.returnDate || "");
  const [cabinClass, setCabinClass] = useState(
    currentParams.cabinClass || "Economy",
  );
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [airportsError, setAirportsError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      if (saved) {
        const searches = JSON.parse(saved);
        if (Array.isArray(searches)) {
          return searches.filter(
            (search) =>
              search &&
              typeof search.id === "string" &&
              typeof search.from === "string" &&
              typeof search.to === "string" &&
              typeof search.departDate === "string" &&
              typeof search.tripType === "string" &&
              typeof search.label === "string",
          );
        }
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  });

  useEffect(() => {
    let isCurrent = true;

    const loadAirports = async () => {
      setAirportsLoading(true);
      setAirportsError("");

      try {
        const response = await flightService.getAirports();
        const records = Array.isArray(response?.data) ? response.data : [];
        const availableAirports = records
          .filter(
            (airport) =>
              typeof airport?.code === "string" &&
              /^[A-Z]{3}$/i.test(airport.code.trim()),
          )
          .sort((first, second) =>
            `${first.city || first.name || first.code}`.localeCompare(
              `${second.city || second.name || second.code}`,
            ),
          );

        if (!isCurrent) return;

        setAirports(availableAirports);
        const origin =
          availableAirports.find(
            (airport) =>
              airport.code.toUpperCase() === currentParams.originCode,
          );
        const destination =
          availableAirports.find(
            (airport) =>
              airport.code.toUpperCase() === currentParams.destinationCode &&
              airport.code.toUpperCase() !== origin?.code.toUpperCase(),
          );

        setFromCode(origin?.code.toUpperCase() || "");
        setToCode(destination?.code.toUpperCase() || "");
      } catch (error) {
        if (isCurrent) {
          setAirports([]);
          setAirportsError(
            getApiErrorMessage(error, "Unable to load registered airports."),
          );
        }
      } finally {
        if (isCurrent) setAirportsLoading(false);
      }
    };

    loadAirports();
    return () => {
      isCurrent = false;
    };
  }, [currentParams.destinationCode, currentParams.originCode]);

  const saveRecentSearch = (from, to, date, type) => {
    const newItem = {
      id: Date.now().toString(),
      from,
      to,
      departDate: date,
      tripType: type,
      label: `${from} → ${to}`,
    };
    const filtered = recentSearches.filter(
      (search) => !(search.from === from && search.to === to),
    );
    const updated = [newItem, ...filtered].slice(0, 5);
    setRecentSearches(updated);

    try {
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchError("");
    if (!fromCode || !toCode || fromCode === toCode) {
      setSearchError("Select two different registered airports.");
      return;
    }
    if (!departDate) {
      setSearchError("Select a departure date.");
      return;
    }
    if (tripType !== "oneWay" && returnDate && returnDate < departDate) {
      setSearchError("The return date cannot be before the departure date.");
      return;
    }

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
      `/search?from=${fromCode}&to=${toCode}&depart=${departDate}&type=${tripType}&class=${cabinClass}`,
    );
  };

  const applyRecentSearch = (item) => {
    setFromCode(item.from);
    setToCode(item.to);
    setDepartDate(item.departDate);
    setTripType(item.tripType);
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
      `/search?from=${item.from}&to=${item.to}&depart=${item.departDate}&type=${item.tripType}&class=${cabinClass}`,
    );
  };

  const swapRoute = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const tripOptions = [
    { value: "roundTrip", label: "Round trip" },
    { value: "oneWay", label: "One way" },
    { value: "direct", label: "Direct non-stop" },
  ];
  const availableAirportCodes = new Set(
    airports.map((airport) => airport.code.toUpperCase()),
  );
  const validRecentSearches = recentSearches.filter(
    (search) =>
      availableAirportCodes.has(search.from.toUpperCase()) &&
      availableAirportCodes.has(search.to.toUpperCase()),
  );

  return (
    <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl shadow-black/5 md:p-7">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">Plan your journey</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Where would you like to go?
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground">
            <Users size={16} className="text-primary" aria-hidden="true" />
            <span className="font-medium">1 passenger</span>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          {airportsError && (
            <p role="alert" className="mb-4 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">
              {airportsError}
            </p>
          )}
          {!airportsLoading && !airportsError && airports.length === 0 && (
            <p role="status" className="mb-4 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted">
              No registered airports are available yet. Add airports in Airport Management before searching.
            </p>
          )}
          {searchError && (
            <p role="alert" className="mb-4 rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">
              {searchError}
            </p>
          )}
          <fieldset className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <legend className="sr-only">Journey type</legend>
            {tripOptions.map((option) => (
              <label
                key={option.value}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors ${
                  tripType === option.value
                    ? "bg-primary/10 text-primary-dark dark:text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="tripType"
                  value={option.value}
                  checked={tripType === option.value}
                  onChange={() => setTripType(option.value)}
                  className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-2 lg:grid-cols-12 lg:divide-x lg:divide-y-0 lg:divide-border">
            <div className="relative flex flex-col justify-center border-b border-border p-3.5 transition-colors hover:bg-surface-muted/60 lg:col-span-3 lg:border-b-0">
              <label
                htmlFor="origin-select"
                className="mb-1 text-xs font-medium text-muted"
              >
                From
              </label>
              <div className="relative">
                <select
                  id="origin-select"
                  value={fromCode}
                  onChange={(event) => setFromCode(event.target.value)}
                  disabled={airportsLoading || airports.length === 0}
                  className="w-full cursor-pointer appearance-none truncate bg-transparent pr-7 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">
                    {airportsLoading ? "Loading airports…" : "Select airport"}
                  </option>
                  {airports.map((airport) => (
                    <option key={airport.id ?? airport.code} value={airport.code.toUpperCase()}>
                      {[airport.city, airport.country, `(${airport.code.toUpperCase()})`]
                        .filter(Boolean)
                        .join(", ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
              <button
                type="button"
                onClick={swapRoute}
                className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex"
                aria-label="Swap origin and destination"
                title="Swap origin and destination"
              >
                <ArrowLeftRight size={15} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-center border-b border-border bg-surface py-1 sm:hidden">
              <button
                type="button"
                onClick={swapRoute}
                className="inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-xs font-medium text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Swap origin and destination"
              >
                <ArrowLeftRight size={14} aria-hidden="true" />
                Swap route
              </button>
            </div>

            <div className="flex flex-col justify-center border-b border-border p-3.5 transition-colors hover:bg-surface-muted/60 sm:border-b-0 lg:col-span-3">
              <label
                htmlFor="dest-select"
                className="mb-1 text-xs font-medium text-muted"
              >
                To
              </label>
              <div className="relative">
                <select
                  id="dest-select"
                  value={toCode}
                  onChange={(event) => setToCode(event.target.value)}
                  disabled={airportsLoading || airports.length < 2}
                  className="w-full cursor-pointer appearance-none truncate bg-transparent pr-7 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">
                    {airportsLoading ? "Loading airports…" : "Select airport"}
                  </option>
                  {airports.map((airport) => (
                    <option
                      key={airport.id ?? airport.code}
                      value={airport.code.toUpperCase()}
                    >
                      {[airport.city, airport.country, `(${airport.code.toUpperCase()})`]
                        .filter(Boolean)
                        .join(", ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center border-b border-border p-3.5 transition-colors hover:bg-surface-muted/60 lg:col-span-2 lg:border-b-0">
              <label
                htmlFor="depart-date-input"
                className="mb-1 text-xs font-medium text-muted"
              >
                Depart
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="depart-date-input"
                  type="date"
                    min={getTodayDate()}
                    value={departDate}
                  onChange={(event) => setDepartDate(event.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Calendar size={15} className="shrink-0 text-muted" aria-hidden="true" />
              </div>
            </div>

            <div
              className={`flex flex-col justify-center border-b border-border p-3.5 transition-colors lg:col-span-2 lg:border-b-0 ${
                tripType === "oneWay"
                  ? "bg-surface-muted/60 opacity-60"
                  : "hover:bg-surface-muted/60"
              }`}
            >
              <label
                htmlFor="return-date-input"
                className="mb-1 text-xs font-medium text-muted"
              >
                Return
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="return-date-input"
                  type="date"
                  min={departDate || getTodayDate()}
                  disabled={tripType === "oneWay"}
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed"
                />
                <Calendar size={15} className="shrink-0 text-muted" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 transition-colors hover:bg-surface-muted/60 lg:col-span-2">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="cabin-select"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Cabin class
                </label>
                <div className="relative">
                  <select
                    id="cabin-select"
                    value={cabinClass}
                    onChange={(event) => setCabinClass(event.target.value)}
                    className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={airportsLoading || airports.length < 2}
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:flex"
                aria-label="Search flights"
                title="Search flights"
              >
                <Search size={19} aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={airportsLoading || airports.length < 2}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:hidden"
          >
            <Search size={17} aria-hidden="true" />
            Search flights
          </button>

          {validRecentSearches.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-medium text-muted">
                <History size={14} aria-hidden="true" />
                Recent searches
              </span>
              {validRecentSearches.map((search) => (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => applyRecentSearch(search)}
                  className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary-dark dark:hover:text-primary"
                >
                  {search.label}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export { SearchWidget };
export default SearchWidget;
