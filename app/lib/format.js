
export const etb = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export const when = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

export const day = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function relative(value, now = Date.now()) {
  const timestamp =
    value instanceof Date ? value.getTime() : new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Time unavailable";
  }

  const seconds = Math.round((timestamp - now) / 1000);
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) {
    return relativeFormatter.format(seconds, "second");
  }

  const minutes = Math.round(seconds / 60);

  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);

  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return relativeFormatter.format(days, "day");
}
