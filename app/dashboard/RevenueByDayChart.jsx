"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { day, etb } from "../lib/format";

function formatDate(value) {
  return day.format(new Date(`${value}T12:00:00.000Z`));
}

export default function RevenueByDayChart({ data }) {
  if (!data?.length) {
    return (
      <p className="rounded-lg border p-4 text-gray-600">
        No revenue activity is available yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Non-cancelled order value for each of the last seven Addis Ababa
        calendar days, including today.
      </p>
      {data.every((item) => item.revenue === 0) && (
        <p role="status" className="text-sm text-gray-600">
          No non-cancelled order value was recorded in this period; zero values
          are shown for each day.
        </p>
      )}
      <div
        role="img"
        aria-label="Bar chart of daily order value in Ethiopian birr. An equivalent data table follows."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              domain={[0, "auto"]}
              tickFormatter={(value) => etb.format(Number(value))}
              width={100}
            />
            <Tooltip
              labelFormatter={(value) => formatDate(String(value))}
              formatter={(value) => [etb.format(Number(value)), "Order value"]}
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
            Daily order value — equivalent chart data
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="px-3 py-2">Date</th>
              <th scope="col" className="px-3 py-2 text-right">
                Order value (ETB)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.date} className="border-b">
                <td className="px-3 py-2">{formatDate(item.date)}</td>
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
