/**
 * Helpers for admin dashboard time-series (Prisma groupBy on DateTime is not bucketed by day/month).
 */

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

/** Last `count` calendar months from `now`, oldest first. */
export function getMonthBuckets(now, count) {
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    buckets.push({
      start,
      end,
      label: AR_MONTHS[d.getMonth()]
    });
  }
  return buckets;
}

/** Aggregate payments + booking counts per month bucket. */
export function aggregateRevenueAndBookingsByMonth(payments, bookings, buckets) {
  return buckets.map(({ start, end, label }) => {
    let revenue = 0;
    let bookingCount = 0;
    for (const p of payments) {
      if (p.createdAt >= start && p.createdAt <= end) {
        revenue += p.amount || 0;
      }
    }
    for (const b of bookings) {
      if (b.createdAt >= start && b.createdAt <= end) {
        bookingCount += 1;
      }
    }
    return { name: label, revenue, bookings: bookingCount };
  });
}

/** Four consecutive 7-day windows, oldest first (week 1 … week 4). */
export function getWeekBuckets(now) {
  const buckets = [];
  for (let w = 3; w >= 0; w--) {
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    buckets.push({
      start,
      end,
      name: `الأسبوع ${4 - w}`
    });
  }
  return buckets;
}

export function countUsersAndDoctorsInRanges(users, doctors, buckets) {
  return buckets.map(({ start, end, name }) => {
    let u = 0;
    let d = 0;
    for (const row of users) {
      if (row.createdAt >= start && row.createdAt <= end) {
        u += 1;
      }
    }
    for (const row of doctors) {
      if (row.createdAt >= start && row.createdAt <= end) {
        d += 1;
      }
    }
    return { name, users: u, doctors: d };
  });
}

/** Bucket payments by calendar month key `YYYY-M` since `sinceDate`. */
export function aggregatePaymentsByCalendarMonth(payments, sinceDate, monthsBack = 6) {
  const now = new Date();
  const buckets = getMonthBuckets(now, monthsBack);
  const since = sinceDate < buckets[0].start ? buckets[0].start : sinceDate;

  const filtered = payments.filter((p) => p.createdAt >= since);
  const map = new Map();
  for (const p of filtered) {
    const key = `${p.createdAt.getFullYear()}-${p.createdAt.getMonth()}`;
    map.set(key, (map.get(key) || 0) + (p.amount || 0));
  }

  return buckets.map(({ start, label }) => {
    const key = `${start.getFullYear()}-${start.getMonth()}`;
    return {
      name: label,
      revenue: map.get(key) || 0
    };
  });
}
