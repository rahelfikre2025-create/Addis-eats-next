export default function OrdersLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading orders"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8"
    >
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />

      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded bg-gray-100"
          />
        ))}
      </div>

      <p className="text-sm text-gray-600">Loading orders…</p>
    </main>
  );
}