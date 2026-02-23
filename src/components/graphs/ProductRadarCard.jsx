import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const safeLog = (v) => Math.log10(Number(v || 0) + 1);


const ProductRadarCard = ({ title, subtitle, metrics, color = "#22c55e" }) => {
  const rawValues = metrics.map((m) => Number(m.value || 0));
  const maxLog = Math.max(...rawValues.map(safeLog)) || 1;

  const data = metrics.map((m) => ({
    metric: m.label,
    raw: Number(m.value || 0),
    value: (safeLog(m.value) / maxLog) * 100,
  }));

  return (
    <div className="bg-[#f7f8fb] rounded-2xl p-3 md:p-6 flex w-full gap-6 items-center">
            {/* Info */}
      <div className="bg-gray-100 rounded-2xl px-6 py-5 w-1/2 text-center">
        <h3 className="lg:text-base font-bold mb-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-3">{subtitle}</p>

        {metrics.map((m) => (
          <p key={m.label} className="text-sm font-medium">
            {m.label}: {Number(m.value).toLocaleString("ar-EG")}
          </p>
        ))}
      </div>
      {/* Radar */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <PolarGrid stroke="#e5e7eb" />

            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#374151", fontSize: 12 }}
            />

            <PolarRadiusAxis domain={[0, 100]} tick={false} />

            <Radar
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.5}
              style={{ filter: "url(#glow)" }}
              isAnimationActive
              dot={(props) => {
                const { cx, cy, payload } = props;

                if (!payload?.raw) return null;

                return (
                  <>
                    {/* dot circle */}
                    <circle cx={cx} cy={cy} r={4} fill={color} />

                    {/* value text */}
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize={12}
                      fontWeight="600"
                    >
                      {payload.raw.toLocaleString("ar-EG")}
                    </text>
                  </>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
};

export default ProductRadarCard;
