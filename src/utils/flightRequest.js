const airportCode = (airport, fallback) => {
  const code =
    typeof airport === "string" ? airport : airport?.code || fallback;
  return typeof code === "string" ? code.trim().toUpperCase() : code;
};

const toLocalDateTime = (date, time, label) => {
  if (typeof time !== "string" || !time.trim()) {
    throw new Error(`${label} time is required.`);
  }

  if (time.includes("T")) return time;

  if (typeof date !== "string" || !date.trim()) {
    throw new Error(`${label} date is required.`);
  }

  return `${date.trim()}T${time.trim().length === 5 ? `${time.trim()}:00` : time.trim()}`;
};

export const toFlightRequest = (flight) => {
  const departureDate =
    flight.departureDate ||
    (typeof flight.departureTime === "string"
      ? flight.departureTime.slice(0, 10)
      : "");
  const departureTime =
    typeof flight.departureTime === "string" &&
    flight.departureTime.includes("T")
      ? flight.departureTime.slice(11, 19)
      : flight.departureTime;
  const arrivalTime =
    typeof flight.arrivalTime === "string" && flight.arrivalTime.includes("T")
      ? flight.arrivalTime.slice(11, 19)
      : flight.arrivalTime;
  let arrivalDate =
    flight.arrivalDate ||
    (typeof flight.arrivalTime === "string" &&
    flight.arrivalTime.includes("T")
      ? flight.arrivalTime.slice(0, 10)
      : departureDate);

  if (
    !flight.arrivalDate &&
    !flight.arrivalTime?.includes?.("T") &&
    departureTime &&
    arrivalTime &&
    arrivalTime < departureTime
  ) {
    const nextDate = new Date(`${departureDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);
    arrivalDate = [
      nextDate.getFullYear(),
      String(nextDate.getMonth() + 1).padStart(2, "0"),
      String(nextDate.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const economySeats = Number(flight.availableSeatsEconomy);
  const businessSeats = Number(flight.availableSeatsBusiness);
  const availableSeats =
    flight.availableSeats !== undefined
      ? Number(flight.availableSeats)
      : economySeats + businessSeats;
  const totalSeats =
    flight.totalSeats !== undefined
      ? Number(flight.totalSeats)
      : availableSeats;
  const fare = Number(flight.fare ?? flight.priceEconomy);
  const businessFare = Number(
    flight.businessFare ?? flight.priceBusiness ?? 0,
  );
  const origin = airportCode(flight.origin, flight.originCode);
  const destination = airportCode(flight.destination, flight.destCode);

  if (!flight.flightNumber?.trim()) {
    throw new Error("Flight number is required.");
  }
  if (!/^[A-Z]{3}$/.test(origin || "")) {
    throw new Error("Origin airport code must be three letters.");
  }
  if (!/^[A-Z]{3}$/.test(destination || "")) {
    throw new Error("Destination airport code must be three letters.");
  }
  if (origin === destination) {
    throw new Error("Origin and destination airports must be different.");
  }
  if (!Number.isFinite(fare) || fare < 0) {
    throw new Error("Economy fare must be zero or greater.");
  }
  if (!Number.isFinite(businessFare) || businessFare < 0) {
    throw new Error("Business fare must be zero or greater.");
  }
  if (!Number.isInteger(availableSeats) || availableSeats < 0) {
    throw new Error("Available seats must be a whole number of zero or greater.");
  }
  if (!Number.isInteger(totalSeats) || totalSeats < 1) {
    throw new Error("Total seat capacity must be a whole number greater than zero.");
  }
  if (availableSeats > totalSeats) {
    throw new Error("Available seats cannot exceed total seat capacity.");
  }
  if (!flight.airline?.trim()) {
    throw new Error("Airline name is required.");
  }
  if (flight.departureTime && flight.arrivalTime) {
    const departure = toLocalDateTime(
      departureDate,
      departureTime,
      "Departure",
    );
    const arrival = toLocalDateTime(arrivalDate, arrivalTime, "Arrival");
    const departureTimestamp = new Date(departure).getTime();
    const arrivalTimestamp = new Date(arrival).getTime();
    if (
      !Number.isFinite(departureTimestamp) ||
      !Number.isFinite(arrivalTimestamp)
    ) {
      throw new Error("Departure and arrival must use valid date and time values.");
    }
    if (arrivalTimestamp <= departureTimestamp) {
      throw new Error("Arrival must be after departure.");
    }

    return {
      flightNumber: flight.flightNumber.trim(),
      origin,
      destination,
      departureTime: departure,
      arrivalTime: arrival,
      fare,
      businessFare,
      availableSeats,
      totalSeats,
      airline: flight.airline.trim(),
      aircraftCode:
        flight.aircraftCode?.trim() || flight.aircraft?.trim() || null,
    };
  }

  throw new Error("Departure and arrival times are required.");
};
