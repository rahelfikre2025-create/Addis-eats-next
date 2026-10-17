function SkeletonBlock({ className = "" }) {
  return <span className={`skeleton-block ${className}`} aria-hidden="true" />;
}

function SkeletonHeading() {
  return (
    <header className="skeleton-heading">
      <SkeletonBlock className="skeleton-eyebrow" />
      <SkeletonBlock className="skeleton-title" />
      <SkeletonBlock className="skeleton-description" />
    </header>
  );
}

function ContentSkeleton() {
  return (
    <>
      <SkeletonHeading />
      <div className="skeleton-content-grid" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <article className="skeleton-card" key={item}>
            <SkeletonBlock className="skeleton-card-image" />
            <div className="skeleton-card-content">
              <SkeletonBlock className="skeleton-line skeleton-line-short" />
              <SkeletonBlock className="skeleton-line skeleton-line-heading" />
              <SkeletonBlock className="skeleton-line" />
              <SkeletonBlock className="skeleton-line skeleton-line-medium" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function MenuSkeleton() {
  return (
    <>
      <SkeletonHeading />
      <div className="skeleton-filter-row" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((item) => (
          <SkeletonBlock className="skeleton-filter-chip" key={item} />
        ))}
      </div>
      <div className="skeleton-content-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <article className="skeleton-card" key={item}>
            <SkeletonBlock className="skeleton-card-image" />
            <div className="skeleton-card-content">
              <SkeletonBlock className="skeleton-line skeleton-line-short" />
              <SkeletonBlock className="skeleton-line skeleton-line-heading" />
              <SkeletonBlock className="skeleton-line" />
              <SkeletonBlock className="skeleton-line skeleton-line-medium" />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <SkeletonHeading />
      <div className="skeleton-dashboard-grid" aria-hidden="true">
        {[0, 1].map((item) => (
          <section className="skeleton-dashboard-card" key={item}>
            <SkeletonBlock className="skeleton-line skeleton-line-heading" />
            <div className="skeleton-chart">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <SkeletonBlock
                  className={`skeleton-chart-bar skeleton-chart-bar-${bar + 1}`}
                  key={bar}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default function PageSkeleton({ variant = "content" }) {
  const Skeleton = {
    content: ContentSkeleton,
    menu: MenuSkeleton,
    dashboard: DashboardSkeleton,
  }[variant] ?? ContentSkeleton;

  return (
    <section
      className={`page-section page-skeleton page-skeleton-${variant}`}
      role="status"
      aria-label="Loading page content"
      aria-busy="true"
    >
      <Skeleton />
    </section>
  );
}
