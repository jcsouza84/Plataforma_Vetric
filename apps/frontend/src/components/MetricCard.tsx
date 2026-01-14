import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  comparison?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  comparison,
  variant = 'default',
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!comparison) return null;
    
    if (comparison.startsWith('+')) {
      return <TrendingUp className="h-3 w-3" />;
    } else if (comparison.startsWith('-')) {
      return <TrendingDown className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getComparisonColor = () => {
    if (!comparison) return '';
    
    // For cost metrics, negative is good (green), positive is bad (red)
    // For consumption/usage, it depends on context
    if (comparison.startsWith('+')) {
      return variant === 'error' ? 'text-destructive' : 'text-success';
    } else if (comparison.startsWith('-')) {
      return variant === 'success' ? 'text-success' : 'text-muted-foreground';
    }
    return 'text-muted-foreground';
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-card p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 h-1 w-full gradient-primary opacity-80" />
      
      {/* Icon */}
      <div className="mb-3 inline-flex items-center justify-center rounded-lg bg-vetric-orange-light p-2.5 text-primary">
        {icon}
      </div>

      {/* Label */}
      <p className="mb-1 text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>

      {/* Value */}
      <p className="text-2xl font-bold text-card-foreground">
        {value}
      </p>

      {/* Comparison */}
      {comparison && (
        <div className={cn(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          getComparisonColor()
        )}>
          {getTrendIcon()}
          <span>{comparison}</span>
        </div>
      )}
    </div>
  );
}
