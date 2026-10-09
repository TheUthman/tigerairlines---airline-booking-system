import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import flightService from "../../../services/flightService";
import { getApiErrorMessage } from "../../../services/apiClient";

const airportCode = (airport) =>
  typeof airport === "string" ? airport : airport?.code || "";

const toDateTimeInput = (value, date, time) => {
  if (typeof value === "string" && value.includes("T")) {
    return value.slice(0, 16);
  }
  if (date && time) return `${date}T${time.slice(0, 5)}`;
  return "";
};

const getFormValues = (flight) => ({
  flightNumber: flight?.flightNumber || "",
  origin: airportCode(flight?.origin),
  destination: airportCode(flight?.destination),
  departureTime: toDateTimeInput(
    flight?.departureTime,
    flight?.departureDate,
    flight?.departureTime,
  ),
  arrivalTime: toDateTimeInput(
    flight?.arrivalTime,
    flight?.arrivalDate,
    flight?.arrivalTime,
  ),
  fare: flight?.fare ?? flight?.priceEconomy ?? "",
  businessFare: flight?.businessFare ?? flight?.priceBusiness ?? 0,
  aircraftCode: flight?.aircraftCode || flight?.aircraft || "",
});

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "block text-xs font-semibold text-muted";

const FlightForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [airports, setAirports] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogErrors, setCatalogErrors] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: getFormValues(initialData) });
  const selectedAircraftCode = watch("aircraftCode");
  const selectedAircraft = aircraft.find(
    (item) =>
      item.code?.toUpperCase() === selectedAircraftCode?.trim().toUpperCase(),
  );

  useEffect(() => {
    if (!catalogLoading) {
      reset(getFormValues(initialData));
    }
  }, [catalogLoading, initialData, reset]);

  useEffect(() => {
    let isCurrent = true;
    const loadCatalogs = async () => {
      setCatalogLoading(true);
      setCatalogErrors([]);
      const [airportResult, aircraftResult] = await Promise.allSettled([
        flightService.getAdminAirports(),
        flightService.getAircraft(),
      ]);

      if (!isCurrent) return;

      const errors = [];
      if (airportResult.status === "fulfilled") {
        const records = airportResult.value?.data;
        setAirports(Array.isArray(records) ? records : []);
      } else {
        setAirports([]);
        errors.push(
          `Airport suggestions unavailable: ${getApiErrorMessage(
            airportResult.reason,
            "could not load airports.",
          )}`,
        );
      }

      if (aircraftResult.status === "fulfilled") {
        const records = aircraftResult.value?.data;
        setAircraft(Array.isArray(records) ? records : []);
      } else {
        setAircraft([]);
        errors.push(
          `Aircraft suggestions unavailable: ${getApiErrorMessage(
            aircraftResult.reason,
            "could not load aircraft.",
          )}`,
        );
      }

      setCatalogErrors(errors);
      setCatalogLoading(false);
    };

    loadCatalogs();
    return () => {
      isCurrent = false;
    };
  }, []);

  const errorText = (message) =>
    message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;

  const submitFlight = handleSubmit((values) => {
    const capacity = Number(selectedAircraft?.seatCapacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("aircraftCode", {
        type: "validate",
        message: "Choose an aircraft from the registered aircraft suggestions.",
      });
      return;
    }

    const previouslyBookedSeats = initialData
      ? Math.max(
          0,
          Number(initialData.totalSeats || 0) -
            Number(initialData.availableSeats ?? initialData.availableSeatsEconomy ?? 0),
        )
      : 0;

    onSubmit({
      ...values,
      totalSeats: capacity,
      availableSeats: Math.max(0, capacity - previouslyBookedSeats),
    });
  });

  return (
    <form onSubmit={submitFlight} className="space-y-5">
      <section>
        <h3 className="mb-3 text-sm font-bold text-foreground">Flight details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Flight number
            <input
              {...register("flightNumber", { required: "Flight number is required." })}
              className={fieldClass}
              placeholder="e.g. TA101"
            />
            {errorText(errors.flightNumber?.message)}
          </label>
          <label className={labelClass}>
            Origin airport code
            <input
              {...register("origin", {
                required: "Origin airport code is required.",
                pattern: { value: /^[A-Za-z]{3}$/, message: "Enter a 3-letter airport code." },
              })}
              list="flight-airport-codes"
              className={fieldClass}
              placeholder="LOS"
              maxLength={3}
              autoComplete="off"
            />
            {errorText(errors.origin?.message)}
          </label>
          <label className={labelClass}>
            Destination airport code
            <input
              {...register("destination", {
                required: "Destination airport code is required.",
                pattern: { value: /^[A-Za-z]{3}$/, message: "Enter a 3-letter airport code." },
              })}
              list="flight-airport-codes"
              className={fieldClass}
              placeholder="ABV"
              maxLength={3}
              autoComplete="off"
            />
            {errorText(errors.destination?.message)}
          </label>
          <label className={labelClass}>
            Departure date and time
            <input
              {...register("departureTime", { required: "Departure date and time are required." })}
              className={fieldClass}
              type="datetime-local"
            />
            {errorText(errors.departureTime?.message)}
          </label>
          <label className={labelClass}>
            Arrival date and time
            <input
              {...register("arrivalTime", { required: "Arrival date and time are required." })}
              className={fieldClass}
              type="datetime-local"
            />
            {errorText(errors.arrivalTime?.message)}
          </label>
          <label className={labelClass}>
            Aircraft code
            <select
              {...register("aircraftCode", {
                required: "Select an aircraft.",
                validate: (value) =>
                  aircraft.some(
                    (item) =>
                      item.code?.toUpperCase() === value?.trim().toUpperCase() &&
                      Number.isInteger(Number(item.seatCapacity)) &&
                      Number(item.seatCapacity) > 0,
                  ) || "Select a registered aircraft with a valid seat capacity.",
              })}
              className={fieldClass}
            >
              <option value="">Select aircraft</option>
              {aircraft.map((item) => (
                <option key={item.id ?? item.code} value={item.code}>
                  {item.code} · {item.model} · {item.seatCapacity} seats
                </option>
              ))}
            </select>
            {errorText(errors.aircraftCode?.message)}
          </label>
        </div>
        <datalist id="flight-airport-codes">
          {airports.map((airport) => (
            <option
              key={airport.id ?? airport.code}
              value={airport.code}
              label={[airport.name, airport.city, airport.country]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
        </datalist>
        {catalogLoading && (
          <p className="mt-3 text-xs text-muted" role="status">
            Loading airport and aircraft suggestions…
          </p>
        )}
        {catalogErrors.map((message) => (
          <p key={message} className="mt-2 text-xs text-amber-700" role="status">
            {message}
          </p>
        ))}
        {!catalogLoading && !catalogErrors.length && !airports.length && (
          <p className="mt-2 text-xs text-muted">
            No airports are registered yet. Add airports in Airport Management to enable suggestions.
          </p>
        )}
        {!catalogLoading && !catalogErrors.length && !aircraft.length && (
          <p className="mt-2 text-xs text-muted">
            No aircraft are registered yet. Add aircraft in Fleet Management to enable suggestions.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold text-foreground">Cabin fares and capacity</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Economy fare
            <input
              {...register("fare", {
                required: "Fare is required.",
                valueAsNumber: true,
                min: { value: 0, message: "Fare cannot be negative." },
                validate: (value) =>
                  Number.isFinite(value) || "Enter a valid fare.",
              })}
              className={fieldClass}
              type="number"
              min="0"
              step="0.01"
            />
            {errorText(errors.fare?.message)}
          </label>
          <label className={labelClass}>
            Business fare
            <input
              {...register("businessFare", {
                required: "Business fare is required. Use 0 to disable Business on this flight.",
                valueAsNumber: true,
                min: { value: 0, message: "Fare cannot be negative." },
                validate: (value) =>
                  Number.isFinite(value) || "Enter a valid fare.",
              })}
              className={fieldClass}
              type="number"
              min="0"
              step="0.01"
            />
            {errorText(errors.businessFare?.message)}
          </label>
          <div className={labelClass}>
            Aircraft capacity
            <output className={`${fieldClass} flex min-h-11 items-center`}>
              {selectedAircraft
                ? `${selectedAircraft.seatCapacity} seats`
                : "Select an aircraft to load its seat capacity"}
            </output>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Seat capacity and initial available seats are taken from the selected aircraft. When editing, existing booked seats are preserved. Set Business fare to 0 to keep this flight Economy-only.
        </p>
      </section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={catalogLoading || aircraft.length === 0}
        >
          {initialData ? "Save flight" : "Schedule flight"}
        </Button>
      </div>
    </form>
  );
};

export default FlightForm;
