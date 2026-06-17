import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "./Card.jsx";

export default function MiniLineChart({
  title,
  data,
  lines,
  yLabel = "",
  height = 190,
  className = "",
}) {
  return (
    <Card className={`chart-card ${className}`} title={title}>
      <div className="chart-y-label">{yLabel}</div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#edf2f6" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#20304a", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
            <YAxis tick={{ fill: "#20304a", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dce6ee" }} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                dataKey={line.key}
                name={line.name}
                type="monotone"
                stroke={line.color}
                strokeWidth={3}
                dot={false}
                strokeDasharray={line.dashed ? "7 5" : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
