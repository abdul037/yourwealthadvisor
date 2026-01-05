import { subDays, subMonths, startOfDay, isAfter } from 'date-fns';

export type Period = '1D' | '1W' | '3M' | 'ALL';

export function getPeriodDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = now;
  
  switch (period) {
    case '1D':
      return { start: subDays(startOfDay(now), 1), end };
    case '1W':
      return { start: subDays(now, 7), end };
    case '3M':
      return { start: subMonths(now, 3), end };
    case 'ALL':
    default:
      return { start: new Date(0), end };
  }
}

export function getPeriodLabel(period: Period): string {
  switch (period) {
    case '1D': return 'today';
    case '1W': return 'this week';
    case '3M': return 'past 3 months';
    case 'ALL': return 'all time';
    default: return '';
  }
}

export function getPeriodComparisonLabel(period: Period): string {
  switch (period) {
    case '1D': return 'vs yesterday';
    case '1W': return 'vs last week';
    case '3M': return 'vs 3 months ago';
    case 'ALL': return 'since inception';
    default: return '';
  }
}

// Simulate different performance changes based on period
export function getSimulatedChange(period: Period, baseChange: number = 2.4): number {
  switch (period) {
    case '1D':
      return (Math.random() - 0.3) * 1.5; // Small daily fluctuations (-0.45% to +1.05%)
    case '1W':
      return baseChange * 0.4 + (Math.random() - 0.5) * 2; // Weekly
    case '3M':
      return baseChange * 1.5 + (Math.random() - 0.3) * 3; // Quarterly - tends positive
    case 'ALL':
      return baseChange * 4 + Math.random() * 5; // All time - generally positive
    default:
      return baseChange;
  }
}

export function filterByPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  const { start } = getPeriodDateRange(period);
  return items.filter(item => isAfter(new Date(item.date), start));
}
