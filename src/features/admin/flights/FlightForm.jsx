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
  availableSeats: flight?.availableSeats ?? flight?.availableSeatsEconomy ?? "",
  totalSeats: flight?.totalSeats ?? "",
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
    getValues,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: getFormValues(initialData) });

  useEffect(() => {
    reset(getFormValues(initialData));
  }, [initialData, reset]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <input
              {...register("aircraftCode")}
              list="flight-aircraft-codes"
              className={fieldClass}
              placeholder="e.g. B737-800"
              autoComplete="off"
            />
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
        <datalist id="flight-aircraft-codes">
          {aircraft.map((item) => (
            <option
              key={item.id ?? item.code}
              value={item.code}
              label={[
                item.model,
                item.seatCapacity ? `${item.seatCapacity} seats` : "",
              ]
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
        <div className="grid gap-4 sm:grid-cols-3">
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
          <label className={labelClass}>
            Available seats
            <input
              {...register("availableSeats", {
                required: "Available seats are required.",
                valueAsNumber: true,
                min: { value: 0, message: "Must be zero or greater." },
                validate: {
                  wholeNumber: (value) =>
                    Number.isInteger(value) || "Enter a whole number.",
                  withinCapacity: (value) =>
                    value <= Number(getValues("totalSeats")) ||
                    "Available seats cannot exceed total capacity.",
                },
              })}
              className={fieldClass}
              type="number"
              min="0"
              step="1"
            />
            {errorText(errors.availableSeats?.message)}
          </label>
          <label className={labelClass}>
            Total seats
            <input
              {...register("totalSeats", {
                required: "Total seat capacity is required.",
                valueAsNumber: true,
                min: { value: 1, message: "Capacity must be at least 1." },
                validate: {
                  wholeNumber: (value) =>
                    Number.isInteger(value) || "Enter a whole number.",
                  enoughCapacity: (value) =>
                    value >= Number(getValues("availableSeats")) ||
                    "Total capacity cannot be less than available seats.",
                },
              })}
              className={fieldClass}
              type="number"
              min="1"
              step="1"
            />
            {errorText(errors.totalSeats?.message)}
          </label>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Enter separate base fares by cabin. Set Business fare to 0 to keep this flight Economy-only. Seat capacity is shared across cabins.
        </p>
      </section>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Save flight" : "Schedule flight"}
        </Button>
      </div>
    </form>
  );
};

export default FlightForm;
