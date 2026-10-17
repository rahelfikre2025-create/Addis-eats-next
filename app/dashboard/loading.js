export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading analytics dashboard"
      className="mx-auto max-w-7xl space-y-8 px-4 py-8"
    >
      <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
      </div>

      <p className="text-sm text-gray-600">Loading dashboard…</p>
    </main>
  );
}
