"use client";

export default function OrdersError({ reset }) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold">Unable to load orders</h1>

      <p className="text-gray-600">
        We couldn&apos;t load the order list. Please try again.
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