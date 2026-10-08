import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";
import { getThemeColors } from "../../../utils/themeColors";
import { formatNaira } from "../../../utils/formatNaira";

const RevenueChart = ({ data }) => {
  const { theme } = useTheme();
  const colors = useMemo(() => getThemeColors(), [theme]);

  return <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
          <XAxis
    dataKey="month"
    stroke={colors.muted}
    fontSize={11}
    tickLine={false}
    axisLine={{ stroke: colors.border }}
  />
          <YAxis
    stroke={colors.muted}
    fontSize={11}
    tickLine={false}
    axisLine={false}
    tickFormatter={(value) =>
      value >= 1_000_000
        ? `₦${(value / 1_000_000).toFixed(1)}m`
        : `₦${Math.round(value / 1_000)}k`
    }
  />
          <Tooltip
    formatter={(value) => [formatNaira(Number(value)), ""]}
    contentStyle={{
      backgroundColor: colors.surface,
      color: colors.foreground,
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      fontSize: "12px"
    }}
  />
          <Legend
    verticalAlign="top"
    align="right"
    iconType="circle"
    wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
  />
          <Area
    type="monotone"
    dataKey="revenue"
    name="Actual revenue (NGN)"
    stroke={colors.primary}
    strokeWidth={3}
    fillOpacity={1}
    fill="url(#colorRevenue)"
  />
        </AreaChart>
      </ResponsiveContainer>
    </div>;
};
var stdin_default = RevenueChart;
export {
  RevenueChart,
  stdin_default as default
};
