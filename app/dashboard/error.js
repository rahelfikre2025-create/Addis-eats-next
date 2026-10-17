"use client";

export default function DashboardError({ reset }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold">Unable to load the dashboard</h1>

      <p className="text-gray-600">
        Something went wrong while loading the analytics. Please try again.
      </p>

      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-green-700 px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}