import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Period } from '@/lib/periodUtils';

interface DashboardPeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '3M', label: '3M' },
  { value: 'ALL', label: 'All' },
];

export function DashboardPeriodSelector({ value, onChange }: DashboardPeriodSelectorProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(val) => val && onChange(val as Period)}
      className="bg-muted/50 rounded-lg p-1"
    >
      {periods.map((period) => (
        <ToggleGroupItem
          key={period.value}
          value={period.value}
          size="sm"
          className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md"
        >
          {period.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
