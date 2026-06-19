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
            <CartesianGrid stroke="#edf1f6" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#5c6b82", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e3e9f1" }} />
            <YAxis tick={{ fill: "#5c6b82", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)} />
            <Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} contentStyle={{ borderRadius: 12, border: "1px solid #e3e9f1" }} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingBottom: 6 }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                dataKey={line.key}
                name={line.name}
                type="monotone"
                stroke={line.color}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray={line.dashed ? "6 5" : undefined}
                animationDuration={700}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
