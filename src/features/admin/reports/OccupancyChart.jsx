import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";
import { getThemeColors } from "../../../utils/themeColors";

const OccupancyChart = ({ data }) => {
  const { theme } = useTheme();
  const colors = useMemo(() => getThemeColors(), [theme]);

  return <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
          <XAxis
    dataKey="route"
    stroke={colors.muted}
    fontSize={10}
    tickLine={false}
    axisLine={{ stroke: colors.border }}
  />
          <YAxis
    stroke={colors.muted}
    fontSize={11}
    domain={[0, 100]}
    tickLine={false}
    axisLine={false}
    tickFormatter={(val) => `${val}%`}
  />
          <Tooltip
    formatter={(value) => [`${value}%`, "Seat Load Factor"]}
    contentStyle={{
      backgroundColor: colors.surface,
      color: colors.foreground,
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      fontSize: "12px"
    }}
  />
          <Bar dataKey="occupancy" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => <Cell
    key={`cell-${index}`}
    fill={entry.occupancy >= 85 ? colors.primary : colors.secondary}
  />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>;
};
var stdin_default = OccupancyChart;
export {
  OccupancyChart,
  stdin_default as default
};
