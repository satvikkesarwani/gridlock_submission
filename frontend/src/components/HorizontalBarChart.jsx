import Card from "./Card.jsx";

export default function HorizontalBarChart({ title, data }) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <Card title={title} className="bar-card">
      <div className="bar-list">
        {data.map((item) => (
          <div className="bar-row" key={item.label}>
            <span>{item.label}</span>
            <div className="bar-track">
              <span style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <strong>{item.value.toFixed(2)}</strong>
          </div>
        ))}
      </div>
      <div className="bar-axis">
        <span>0</span>
        <span>0.1</span>
        <span>0.2</span>
        <span>0.3</span>
        <span>0.4</span>
        <span>0.5</span>
      </div>
    </Card>
  );
}
