
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { day } from "../lib/format";

function formatDate(value) {
  return day.format(new Date(`${value}T00:00:00.000Z`));
}

export default function OrdersOverTimeChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="rounded-lg border p-4 text-gray-600">
        No order activity is available yet. The chart will appear when
        orders have been recorded.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Non-cancelled orders created on each of the last seven Addis Ababa
        calendar days, including today.
      </p>
      {data.every((item) => item.orders === 0) && (
        <p role="status" className="text-sm text-gray-600">
          No non-cancelled orders were recorded in this period; zero counts are
          shown for each day.
        </p>
      )}

      <div
        role="img"
        aria-label="Line chart showing daily order counts. An equivalent data table follows."
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 5, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, "auto"]}
              label={{
                value: "Orders",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              labelFormatter={(value) => formatDate(String(value))}
              formatter={(value) => [Number(value), "Orders"]}
            />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left font-semibold">
            Daily orders — equivalent chart data
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="px-3 py-2">
                Date
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Number of orders
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.date} className="border-b">
                <td className="px-3 py-2">{formatDate(item.date)}</td>
                <td className="px-3 py-2 text-right">{item.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
