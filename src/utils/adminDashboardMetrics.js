const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  return null;
};

const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSuccessfulPayment = (payment) =>
  String(payment.status || "").toUpperCase() === "SUCCEEDED";

const isConfirmedBooking = (booking) =>
  String(booking.status || "").toUpperCase() === "CONFIRMED";

const amountOf = (record) => {
  const amount = Number(record.amount);
  return Number.isFinite(amount) ? amount : 0;
};

const periodTotal = (records, predicate, dateField, amountField, start, end) =>
  records.reduce((total, record) => {
    const date = toValidDate(record[dateField]);
    if (!predicate(record) || !date || date < start || date >= end) {
      return total;
    }
    return total + (amountField ? amountOf(record) : 1);
  }, 0);

const percentageChangeLabel = (current, previous) => {
  if (previous === 0) {
    return current === 0
      ? "Last 30 days: no activity in either period"
      : "Last 30 days: activity; none in prior period";
  }

  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `Last 30 days: ${sign}${change.toFixed(1)}% vs prior 30 days`;
};

const isActiveFlight = (flight) =>
  flight.active !== false &&
  String(flight.status || "").toUpperCase() !== "CANCELLED";

export const buildAdminDashboardMetrics = ({
  flights,
  bookings,
  payments,
  now = new Date(),
}) => {
  const flightList = asList(flights);
  const bookingList = asList(bookings);
  const paymentList = asList(payments);
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
  const priorPeriodStart = new Date(currentPeriodStart);
  priorPeriodStart.setDate(priorPeriodStart.getDate() - 30);

  const successfulPayments = paymentList?.filter(isSuccessfulPayment) || [];
  const confirmedBookings = bookingList?.filter(isConfirmedBooking) || [];
  const activeFlights = flightList?.filter(isActiveFlight) || [];

  const monthlyRevenue = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthlyRevenue.push({
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      month: monthStart.toLocaleDateString(undefined, { month: "short" }),
      revenue: 0,
    });
  }
  const revenueByMonth = new Map(monthlyRevenue.map((item) => [item.key, item]));
  successfulPayments.forEach((payment) => {
    const date = toValidDate(payment.createdAt);
    const key = date ? `${date.getFullYear()}-${date.getMonth()}` : null;
    const month = key ? revenueByMonth.get(key) : null;
    if (month) month.revenue += amountOf(payment);
  });

  const routeTotals = new Map();
  activeFlights.forEach((flight) => {
    const capacity = Number(flight.totalSeats);
    const available = Number(flight.availableSeats);
    if (!Number.isFinite(capacity) || capacity <= 0 || !Number.isFinite(available)) {
      return;
    }
    const origin =
      typeof flight.origin === "object" ? flight.origin?.code : flight.origin;
    const destination =
      typeof flight.destination === "object"
        ? flight.destination?.code
        : flight.destination;
    const route = `${origin || "—"}-${destination || "—"}`;
    const totals = routeTotals.get(route) || { occupied: 0, capacity: 0 };
    totals.occupied += Math.max(0, capacity - available);
    totals.capacity += capacity;
    routeTotals.set(route, totals);
  });

  const occupancyByRoute = [...routeTotals.entries()]
    .map(([route, totals]) => ({
      route,
      occupancy:
        totals.capacity > 0
          ? Number(((totals.occupied / totals.capacity) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5);
  const totalCapacity = [...routeTotals.values()].reduce(
    (total, route) => total + route.capacity,
    0,
  );
  const totalOccupied = [...routeTotals.values()].reduce(
    (total, route) => total + route.occupied,
    0,
  );

  const bookingDays = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayBookings =
      bookingList?.filter((booking) => {
        const createdAt = toValidDate(booking.createdAt);
        return createdAt && createdAt >= day && createdAt < nextDay;
      }) || [];
    bookingDays.push({
      date: day.toLocaleDateString(undefined, { weekday: "short" }),
      bookings: dayBookings.filter(isConfirmedBooking).length,
      cancellations: dayBookings.filter(
        (booking) => String(booking.status || "").toUpperCase() === "CANCELLED",
      ).length,
    });
  }

  const nowDate = new Date(now);
  const upcomingFlights =
    flightList
      ?.filter((flight) => {
        const departure = toValidDate(flight.departureTime);
        return isActiveFlight(flight) && departure && departure >= nowDate;
      })
      .sort(
        (a, b) =>
          toValidDate(a.departureTime).getTime() -
          toValidDate(b.departureTime).getTime(),
      ) || [];

  const currentRevenue = periodTotal(
    paymentList || [],
    isSuccessfulPayment,
    "createdAt",
    true,
    currentPeriodStart,
    nowDate,
  );
  const previousRevenue = periodTotal(
    paymentList || [],
    isSuccessfulPayment,
    "createdAt",
    true,
    priorPeriodStart,
    currentPeriodStart,
  );
  const currentBookings = periodTotal(
    bookingList || [],
    isConfirmedBooking,
    "createdAt",
    false,
    currentPeriodStart,
    nowDate,
  );
  const previousBookings = periodTotal(
    bookingList || [],
    isConfirmedBooking,
    "createdAt",
    false,
    priorPeriodStart,
    currentPeriodStart,
  );

  return {
    revenue: {
      total: paymentList
        ? successfulPayments.reduce((total, payment) => total + amountOf(payment), 0)
        : null,
      change: paymentList
        ? percentageChangeLabel(currentRevenue, previousRevenue)
        : null,
      byMonth: paymentList ? monthlyRevenue : null,
    },
    bookings: {
      confirmedCount: bookingList ? confirmedBookings.length : null,
      change: bookingList
        ? percentageChangeLabel(currentBookings, previousBookings)
        : null,
      byDay: bookingList ? bookingDays : null,
    },
    occupancy: {
      average:
        flightList && totalCapacity > 0
          ? Number(((totalOccupied / totalCapacity) * 100).toFixed(1))
          : null,
      byRoute: flightList ? occupancyByRoute : null,
    },
    flights: {
      activeCount: flightList ? activeFlights.length : null,
      upcoming: flightList ? upcomingFlights.slice(0, 5) : null,
    },
  };
};

export const getDashboardResponseData = (response) => response?.data ?? null;
export const getDashboardList = asList;
