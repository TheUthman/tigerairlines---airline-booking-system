import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";
import { getThemeColors } from "../../../utils/themeColors";

const BookingsChart = ({ data }) => {
  const { theme } = useTheme();
  const colors = useMemo(() => getThemeColors(), [theme]);

  return <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
          <XAxis
    dataKey="date"
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
  />
          <Tooltip
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
          <Bar
    dataKey="bookings"
    name="Confirmed Bookings"
    fill={colors.primary}
    radius={[4, 4, 0, 0]}
  />
          <Bar
    dataKey="cancellations"
    name="Cancellations"
    fill={colors.border}
    radius={[4, 4, 0, 0]}
  />
        </BarChart>
      </ResponsiveContainer>
    </div>;
};
var stdin_default = BookingsChart;
export {
  BookingsChart,
  stdin_default as default
};
