import { Car, Plug, Clock, AlertTriangle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSummaryProps {
  counts: {
    total: number;
    inUse: number;
    waiting: number;
    idle: number;
    failure: number;
    offline: number;
  };
}

export function StatusSummary({ counts }: StatusSummaryProps) {
  const items = [
    {
      label: 'Em Uso',
      count: counts.inUse,
      icon: Car,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Aguardando',
      count: counts.waiting,
      icon: Plug,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Ociosos',
      count: counts.idle,
      icon: Clock,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    },
    {
      label: 'Com Falha',
      count: counts.failure,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'Offline',
      count: counts.offline,
      icon: WifiOff,
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      border: 'border-gray-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border",
            item.bg,
            item.border
          )}
        >
          <item.icon className={cn("h-5 w-5", item.color)} />
          <div>
            <p className={cn("text-xl font-bold", item.color)}>
              {item.count}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
