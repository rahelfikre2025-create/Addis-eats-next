
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { etb } from "../lib/format";

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="rounded-lg border p-4 text-gray-600">
        No revenue data is available yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Non-cancelled order value by delivery area across all available orders,
        in Ethiopian birr (ETB).
      </p>
      {data.every((item) => item.revenue === 0) && (
        <p role="status" className="text-sm text-gray-600">
          No non-cancelled order value has been recorded yet.
        </p>
      )}

      <div
        role="img"
        aria-label="Bar chart comparing revenue across neighbourhoods. An equivalent data table follows."
        className="w-full"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="area"
              tick={{ fontSize: 12 }}
              interval={0}
            />

            <YAxis
              domain={[0, "auto"]}
              tickFormatter={(value) => etb.format(Number(value))}
              width={100}
            />

            <Tooltip
              formatter={(value) => [
                etb.format(Number(value)),
                "Order value",
              ]}
            />

            <Bar
              dataKey="revenue"
              name="Order value"
              fill="#15803d"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left font-semibold">
            Order value by delivery area — equivalent chart data
          </caption>

          <thead>
            <tr className="border-b">
              <th scope="col" className="px-3 py-2">
                Neighbourhood
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Order value (ETB)
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.area} className="border-b">
                <td className="px-3 py-2">{item.area}</td>
                <td className="px-3 py-2 text-right">
                  {etb.format(item.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
