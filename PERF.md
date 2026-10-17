# Lighthouse Performance

## Latest results

The following Lighthouse 13.4.1 results were supplied on October 14, 2026.
Each row represents one reported run; device throttling, browser, and network
conditions were not recorded.

| Page | Device | Performance score | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Menu | Desktop | 98 | 0.6 s | 0.9 s | 80 ms | 0 | 1.1 s |
| Menu | Mobile | 80 | 2.6 s | 2.7 s | 390 ms | 0 | 4.4 s |
| Home | Desktop | 85 | 1.4 s | 1.7 s | 10 ms | 0.028 | 2.3 s |
| Home | Mobile | 3 | 3.3 s | 3.6 s | 710 ms | 0.027 | 5.1 s |

The desktop results are strong, while the reported mobile results identify the
home page as the main area for further performance work. The mobile menu also
has higher blocking time and a slower Speed Index than its desktop run.
Lighthouse scores are estimates and can vary between runs; these single
measurements are a snapshot, not a guarantee or a controlled comparison.

## Earlier menu mobile measurements

These results were recorded in an earlier audit and are retained for historical
context. They are not directly comparable with the latest results because
matching test conditions and run-by-run measurements are unavailable.

| Metric | Earlier baseline | Earlier optimized run |
| --- | ---: | ---: |
| Performance score | 39 | 60–88 (median 85 across three reported runs) |
| First Contentful Paint (FCP) | 3.1 s | 1.7 s |
| Largest Contentful Paint (LCP) | 7.4 s | 2.2 s |
| Total Blocking Time (TBT) | 1,790 ms | 480 ms |
| Cumulative Layout Shift (CLS) | 0.059 | 0 |
| Speed Index | 5.0 s | 2.8 s |

The optimized-run metrics are from the 85-point run. Metrics for the other two
scores were not recorded.

## Implemented optimizations

- Menu dish photos have pre-sized WebP variants. Responsive `srcSet` and
  `sizes` let the browser select a suitable image for the rendered card size.
- The first menu card image is loaded eagerly with high fetch priority; other
  card images use lazy loading.
- On narrow screens, below-the-first menu cards use `content-visibility` so the
  browser can defer offscreen card rendering until they approach the viewport.
- Menu cards and pagination are rendered on the server, and the menu page
  entrance animation is disabled.
- Leaflet styles are loaded with the delivery map instead of from the root
  layout, avoiding map-only CSS on unrelated pages such as the menu.
- The home page uses smaller responsive hero images and avoids unnecessary
  entrance animation and mobile image effects.

These changes are intended to reduce image transfer and rendering work, but
the latest measurements alone do not establish which change caused a metric
or score difference.

## Recommendations for repeatable audits

For a reliable trend, run Lighthouse at least three times for each page and
device using the same browser version, device emulation, throttling, and
network conditions. Prefer a clean/incognito session and compare medians.
Record each run's metrics, not only the final score.
