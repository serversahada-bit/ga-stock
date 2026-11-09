"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type ChartDatum = { label: string; qty: number };

const BRAND = "#4f46e5"; // brand-600 — satu seri, satu warna

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        color: "var(--text)",
        fontSize: 13,
        boxShadow: "0 4px 16px rgba(0,0,0,.18)",
      }}
    >
      <div style={{ fontWeight: 600 }}>{d.label}</div>
      <div style={{ color: "var(--text-muted)" }}>{d.qty} unit keluar</div>
    </div>
  );
}

export function OutboundChart({ data }: { data: ChartDatum[] }) {
  // Tinggi menyesuaikan jumlah baris agar bar tidak gepeng.
  const height = Math.max(160, data.length * 42 + 24);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
          barCategoryGap={10}
        >
          <CartesianGrid
            horizontal={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<TooltipBox />}
            cursor={{ fill: "var(--surface-2)" }}
          />
          <Bar
            dataKey="qty"
            fill={BRAND}
            radius={[0, 4, 4, 0]}
            label={{
              position: "right",
              fill: "var(--text-muted)",
              fontSize: 12,
            }}
            maxBarSize={22}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={BRAND} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
