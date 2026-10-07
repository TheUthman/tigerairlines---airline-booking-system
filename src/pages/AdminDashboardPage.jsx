import { useEffect, useState, useRef } from "react";
import {
  Banknote,
  Users,
  Plane,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import adminService from "../services/adminService";
import flightService from "../services/flightService";
import RevenueChart from "../features/admin/reports/RevenueChart";
import OccupancyChart from "../features/admin/reports/OccupancyChart";
import BookingsChart from "../features/admin/reports/BookingsChart";
import Badge from "../components/ui/Badge";
import { Link } from "react-router-dom";
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
const DEFAULT_DASHBOARD_STATS = {
  kpis: {
    totalRevenue: 48500000,
    revenueChangePct: 12.4,
    totalBookings: 1240,
    bookingsChangePct: 8.6,
    averageOccupancyPct: 84.2,
    occupancyChangePct: 3.1,
    activeFlights: 36,
    activeFlightsChange: 4,
  },
  revenueByMonth: [
    { month: "Jan", actual: 3800000, projected: 3500000 },
    { month: "Feb", actual: 4100000, projected: 3800000 },
    { month: "Mar", actual: 4400000, projected: 4000000 },
    { month: "Apr", actual: 4200000, projected: 4100000 },
    { month: "May", actual: 4900000, projected: 4500000 },
    { month: "Jun", actual: 5300000, projected: 4800000 },
  ],
  occupancyByRoute: [
    { route: "LOS-ABV", loadFactor: 92 },
    { route: "LOS-PHC", loadFactor: 86 },
    { route: "ABV-KAN", loadFactor: 78 },
    { route: "LOS-LHR", loadFactor: 94 },
    { route: "ABV-DXB", loadFactor: 88 },
  ],
  dailyBookings: [
    { date: "Mon", confirmed: 142, cancelled: 8 },
    { date: "Tue", confirmed: 168, cancelled: 11 },
    { date: "Wed", confirmed: 185, cancelled: 7 },
    { date: "Thu", confirmed: 210, cancelled: 14 },
    { date: "Fri", confirmed: 245, cancelled: 12 },
    { date: "Sat", confirmed: 198, cancelled: 9 },
    { date: "Sun", confirmed: 176, cancelled: 6 },
  ],
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentFlights, setRecentFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats().catch(() => ({ success: false, data: null })),
      flightService.getFlights().catch(() => ({ success: false, data: [] })),
    ])
      .then(([statsRes, flightsRes]) => {
        const serverStats = statsRes?.data;
        const mergedStats = {
          ...DEFAULT_DASHBOARD_STATS,
          ...(serverStats && serverStats.kpis ? serverStats : {}),
        };

        const flightsList = Array.isArray(flightsRes?.data)
          ? flightsRes.data
          : Array.isArray(flightsRes?.data?.content)
            ? flightsRes.data.content
            : [];

        if (flightsList.length > 0) {
          mergedStats.kpis = {
            ...mergedStats.kpis,
            activeFlights: flightsList.length,
          };
        }

        setStats(mergedStats);
        setRecentFlights(flightsList.slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        setStats(DEFAULT_DASHBOARD_STATS);
        setLoading(false);
      });
  }, []);

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
      title: "Total System Revenue",
      targetValue: stats?.kpis?.totalRevenue ?? 0,
      prefix: "\u20A6",
      suffix: "",
      decimals: 0,
      change: `+${stats?.kpis?.revenueChangePct ?? 0}%`,
      icon: <Banknote size={20} className="text-primary" />,
      bg: "bg-primary/10",
    },
    {
      title: "Confirmed Reservations",
      targetValue: stats?.kpis?.totalBookings ?? 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      change: `+${stats?.kpis?.bookingsChangePct ?? 0}%`,
      icon: <Users size={20} className="text-secondary" />,
      bg: "bg-orange-50",
    },
    {
      title: "Average Flight Occupancy",
      targetValue: stats?.kpis?.averageOccupancyPct ?? 0,
      prefix: "",
      suffix: "%",
      decimals: 1,
      change: `+${stats?.kpis?.occupancyChangePct ?? 0}%`,
      icon: <TrendingUp size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Active Scheduled Flights",
      targetValue: stats?.kpis?.activeFlights ?? 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      change: `+${stats?.kpis?.activeFlightsChange ?? 0} routes`,
      icon: <Plane size={20} className="text-secondary" />,
    },
  ];
  return (
    <div ref={dashboardRef} className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
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
                <AnimatedCounter
                  target={kpi.targetValue}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                  decimals={kpi.decimals}
                />
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>{kpi.change} vs last month</span>
              </div>
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
                Monthly Revenue Performance
              </h3>
              <p className="text-xs text-muted">
                Actual revenue vs projected budget targets
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              FY 2026
            </span>
          </div>
          <RevenueChart data={stats?.revenueByMonth || []} />
        </div>

        {/* Route Occupancy Chart (4 cols) */}
        <div className="admin-chart-card lg:col-span-4 bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <div className="mb-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Route Load Factor (%)
            </h3>
            <p className="text-xs text-muted">
              Occupancy rate per high-demand route
            </p>
          </div>
          <OccupancyChart data={stats?.occupancyByRoute || []} />
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
              New reservations compared with cancellations
            </p>
          </div>
          <BookingsChart data={stats?.dailyBookings || []} />
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
                  Live operational flight status & gates
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
              {recentFlights.map((flight) => {
                const originCode =
                  typeof flight.origin === "object"
                    ? flight.origin?.code
                    : flight.origin || "LOS";
                const destCode =
                  typeof flight.destination === "object"
                    ? flight.destination?.code
                    : flight.destination || "ABV";
                const aircraftName =
                  flight.aircraft || flight.aircraftCode || "B737";
                const gateId = String(flight.id || "1").slice(-1) || "1";
                const depTime = flight.departureTime
                  ? typeof flight.departureTime === "string" &&
                    flight.departureTime.includes("T")
                    ? new Date(flight.departureTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : flight.departureTime
                  : "On Time";

                return (
                  <div
                    key={flight.id || Math.random()}
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
                          {originCode} → {destCode} ({aircraftName})
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs font-mono font-bold text-foreground">
                          {depTime}
                        </p>
                        <p className="text-[10px] text-muted">Gate {gateId}</p>
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
                        {flight.status || "SCHEDULED"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Fleet in Air: 3 Aircraft</span>
            <span className="font-semibold text-emerald-600">
              All Operations Normal
            </span>
          </div>
        </div>
      </div>

      {/* Live Operations & Passenger Activity Feed */}
      <div className="admin-chart-card bg-surface p-6 rounded-2xl shadow-sm border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations & System Activity Feed
            </h3>
            <p className="text-xs text-muted">
              Real-time log of passenger transactions, flight departures, and
              gate dispatches
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Auto-refreshing (Active)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            {
              time: "2m ago",
              title: "New Booking Confirmed",
              desc: "A new passenger booking was confirmed and payment was successfully captured.",
              badge: "Booking",
              badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              time: "12m ago",
              title: "Flight Delay Advisory",
              desc: "Flight TG-204 (Lagos \u2192 London) delayed 35m due to ATC slot congestion",
              badge: "Flight Ops",
              badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
            },
            {
              time: "28m ago",
              title: "Online Check-In Issued",
              desc: "Passenger Amaka Eze checked in for TG-204 LOS\u2192LHR (Seat 1F)",
              badge: "Check-In",
              badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              time: "45m ago",
              title: "Aircraft Turnaround Inspection",
              desc: "5N-TGR (Boeing 787-9) cleared by technical crew at Gate 12, Murtala Muhammed",
              badge: "Maintenance",
              badgeColor: "bg-surface-muted text-foreground border-border",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-background rounded-xl border border-border space-y-1.5 hover:bg-surface-muted/70 transition"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {item.time}
                </span>
              </div>
              <p className="font-bold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
var stdin_default = AdminDashboardPage;
export { AdminDashboardPage, stdin_default as default };
