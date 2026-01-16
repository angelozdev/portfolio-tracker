import type { AssetPerformance } from "@/types";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/shared/utils/format";

interface AllocationChartProps {
  assets: AssetPerformance[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function AllocationChart({ assets }: AllocationChartProps) {
  // Filter out assets with 0 value to avoid ugly chart
  const data = assets
    .filter((a) => a.currentValue > 0)
    .map((a) => ({
      name: a.symbol,
      value: a.currentValue,
    }));

  return (
    <div className="h-[300px] w-full min-h-[300px] min-w-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) => [
              formatCurrency(value || 0),
              "Value",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
