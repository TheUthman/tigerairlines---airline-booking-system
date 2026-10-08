import { useEffect, useState, useRef } from "react";
import {
  Banknote,
  Users,
  Plane,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import adminService from "../services/adminService";
import flightService from "../services/flightService";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import RevenueChart from "../features/admin/reports/RevenueChart";
import OccupancyChart from "../features/admin/reports/OccupancyChart";
import BookingsChart from "../features/admin/reports/BookingsChart";
import Badge from "../components/ui/Badge";
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/store";
import {
  buildAdminDashboardMetrics,
  getDashboardList,
  getDashboardResponseData,
} from "../utils/adminDashboardMetrics";
const AnimatedCounter = ({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const spanRef = useRef(null);
  useGSAP(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) {
          if (decimals > 0) {
            spanRef.current.innerText = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
          } else {
            spanRef.current.innerText = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
          }
        }
      },
    });
  }, [target]);
  return (
    <span ref={spanRef}>
      {prefix}0{suffix}
    </span>
  );
};
const AdminDashboardPage = () => {
  const role = useAppSelector((state) => state.auth.role);
  const canViewSystemMetrics = role === "ADMINISTRATOR";
  const [stats, setStats] = useState(null);
  const [auditSummary, setAuditSummary] = useState(null);
  const [sourceStatus, setSourceStatus] = useState(null);
  const [loadErrors, setLoadErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const sources = [
      { key: "flights", label: "Flights", request: flightService.getFlights },
      ...(canViewSystemMetrics
        ? [
            { key: "dashboard", label: "Admin summary", request: adminService.getDashboardStats },
            { key: "bookings", label: "Bookings", request: bookingService.getBookings },
            { key: "payments", label: "Payments", request: paymentService.getPayments },
          ]
        : []),
    ];

    Promise.allSettled(sources.map(({ request }) => request())).then((results) => {
      if (cancelled) return;
      const values = Object.fromEntries(
        results.map((result, index) => [
          sources[index].key,
          result.status === "fulfilled"
            ? getDashboardResponseData(result.value)
            : null,
        ]),
      );
      const statuses = Object.fromEntries(
        results.map((result, index) => [
          sources[index].key,
          result.status === "fulfilled" &&
            (sources[index].key === "dashboard"
              ? Boolean(values.dashboard)
              : getDashboardList(values[sources[index].key]) !== null),
        ]),
      );

      setStats(
        buildAdminDashboardMetrics({
          flights: statuses.flights ? values.flights : null,
          bookings:
            canViewSystemMetrics && statuses.bookings ? values.bookings : null,
          payments:
            canViewSystemMetrics && statuses.payments ? values.payments : null,
        }),
      );
      setAuditSummary(statuses.dashboard ? values.dashboard : null);
      setSourceStatus({ ...statuses, dashboard: canViewSystemMetrics && statuses.dashboard });
      setLoadErrors(
        results.flatMap((result, index) =>
          result.status === "rejected" || !statuses[sources[index].key]
            ? [sources[index].label]
            : [],
        ),
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [canViewSystemMetrics]);

  useGSAP(
    () => {
      if (!loading && stats) {
        gsap.from(".admin-kpi-card", {
          y: 18,
          opacity: 0,
          duration: 0.38,
          stagger: 0.08,
          ease: "power2.out",
        });
        gsap.from(".admin-chart-card", {
          y: 22,
          opacity: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.12,
        });
      }
    },
    { dependencies: [loading, stats], scope: dashboardRef },
  );

  if (loading || !stats) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-muted">Loading operations analytics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Successful Payment Revenue (All Time)",
      targetValue: stats.revenue.total,
      prefix: "\u20A6",
      suffix: "",
      decimals: 0,
      change: stats.revenue.change,
      icon: <Banknote size={20} className="text-primary" />,
      bg: "bg-primary/10",
    },
    {
      title: "Confirmed Reservations",
      targetValue: stats.bookings.confirmedCount,
      prefix: "",
      suffix: "",
      decimals: 0,
      change: stats.bookings.change,
      icon: <Users size={20} className="text-secondary" />,
      bg: "bg-orange-50",
    },
    {
      title: "Average Flight Occupancy",
      targetValue: stats.occupancy.average,
      prefix: "",
      suffix: "%",
      decimals: 1,
      change: "Calculated from flight seat availability",
      icon: <TrendingUp size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Non-cancelled Flights",
      targetValue: stats.flights.activeCount,
      prefix: "",
      suffix: "",
      decimals: 0,
      change: null,
      icon: <Plane size={20} className="text-secondary" />,
    },
  ];
  return (
    <div ref={dashboardRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {loadErrors.length > 0 && (
        <div
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
        >
          Could not load {loadErrors.join(", ")} data from the backend. Values
          from those sources are shown as unavailable, not replaced with sample
          data.
        </div>
      )}
      {!canViewSystemMetrics && (
        <div className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted">
          The backend provides system-wide bookings, payment totals, and audit
          counts to administrator accounts only. Those figures are unavailable
          for staff accounts; flight information remains available.
        </div>
      )}
      {/* KPI Cards with animated count-up numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="admin-kpi-card bg-surface rounded-2xl p-5 shadow-sm border border-border flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                {kpi.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}
              >
                {kpi.icon}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black text-foreground tracking-tight">
                {kpi.targetValue === null ? (
                  <span aria-label={`${kpi.title} unavailable`}>—</span>
                ) : (
                  <AnimatedCounter
                    target={kpi.targetValue}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    decimals={kpi.decimals}
                  />
                )}
              </div>
              {kpi.change && (
                <div className="mt-1 text-xs text-muted">
                  {kpi.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Chart (8 cols) */}
        <div className="admin-chart-card lg:col-span-8 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Monthly Successful Payments
              </h3>
              <p className="text-xs text-muted">
                Successful payment amounts recorded by the payment service
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              Last 6 months
            </span>
          </div>
          {stats.revenue.byMonth ? (
            <RevenueChart data={stats.revenue.byMonth} />
          ) : (
            <p className="grid h-72 place-items-center text-sm text-muted">
              Payment data unavailable.
            </p>
          )}
        </div>

        {/* Route Occupancy Chart (4 cols) */}
        <div className="admin-chart-card lg:col-span-4 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="mb-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Route Load Factor (%)
            </h3>
            <p className="text-xs text-muted">
              Estimated from each flight&apos;s available and total seats
            </p>
          </div>
          {stats.occupancy.byRoute ? (
            <OccupancyChart data={stats.occupancy.byRoute} />
          ) : (
            <p className="grid h-72 place-items-center text-sm text-muted">
              Flight data unavailable.
            </p>
          )}
        </div>
      </div>

      {/* Bookings volume & Active flights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Bookings Chart (6 cols) */}
        <div className="admin-chart-card lg:col-span-6 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="mb-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Weekly Booking Activity
            </h3>
            <p className="text-xs text-muted">
              Seven-day booking creation totals, grouped by current status
            </p>
          </div>
          {stats.bookings.byDay ? (
            <BookingsChart data={stats.bookings.byDay} />
          ) : (
            <p className="grid h-72 place-items-center text-sm text-muted">
              Booking data unavailable.
            </p>
          )}
        </div>

        {/* Live Flights Quick Overview (6 cols) */}
        <div className="admin-chart-card lg:col-span-6 bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Upcoming Flight Operations
                </h3>
                <p className="text-xs text-muted">
                  Upcoming flights returned by the flight service
                </p>
              </div>
              <Link
                to="/admin/flights"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {stats.flights.upcoming === null ? (
                <p className="py-8 text-center text-sm text-muted">
                  Flight data unavailable.
                </p>
              ) : stats.flights.upcoming.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  No upcoming scheduled flights.
                </p>
              ) : stats.flights.upcoming.map((flight) => {
                const originCode =
                  typeof flight.origin === "object"
                    ? flight.origin?.code
                    : flight.origin;
                const destCode =
                  typeof flight.destination === "object"
                    ? flight.destination?.code
                    : flight.destination;
                const aircraftName =
                  flight.aircraftCode || flight.aircraft;
                const depTime = flight.departureTime
                  ? typeof flight.departureTime === "string" &&
                    flight.departureTime.includes("T")
                    ? new Date(flight.departureTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : flight.departureTime
                  : "Time unavailable";

                return (
                  <div
                      key={flight.id || flight.flightNumber}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        <Plane size={15} className="-rotate-45" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs font-mono">
                          {flight.flightNumber || "TG-Flight"}
                        </p>
                        <p className="text-[11px] text-muted">
                          {originCode || "—"} → {destCode || "—"}
                          {aircraftName ? ` (${aircraftName})` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-mono font-bold text-foreground">
                          {depTime}
                        </p>
                        <p className="text-[10px] text-muted">
                          {flight.departureTime
                            ? new Date(flight.departureTime).toLocaleDateString()
                            : "Departure date unavailable"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          flight.status === "BOARDING"
                            ? "accent"
                            : flight.status === "DELAYED"
                              ? "warning"
                              : "blue"
                        }
                        size="sm"
                      >
                        {flight.status || "Status unavailable"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>
              {stats.flights.activeCount === null
                ? "Active flight count unavailable"
                : `${stats.flights.activeCount} non-cancelled flight records`}
            </span>
            {sourceStatus.flights && (
              <span>Flight data loaded from backend</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin audit summary */}
      <div className="admin-chart-card bg-surface p-6 rounded-2xl shadow-sm border border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Administrative Audit Summary
            </h3>
            <p className="mt-1 text-xs text-muted">
              The admin service exposes an audit count, not an event feed.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-foreground">
              {typeof auditSummary?.auditActionCount === "number"
                ? auditSummary.auditActionCount.toLocaleString()
                : "—"}
            </p>
            <p className="text-xs text-muted">Recorded admin actions</p>
          </div>
        </div>
        {auditSummary?.generatedAt && (
          <p className="border-t border-border pt-3 text-xs text-muted">
            Summary generated{" "}
            {new Date(auditSummary.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};
var stdin_default = AdminDashboardPage;
export { AdminDashboardPage, stdin_default as default };
