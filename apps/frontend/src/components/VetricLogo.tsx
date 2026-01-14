import { cn } from '@/lib/utils';
import vetricLogo from '@/assets/vetric-logo.png';

interface VetricLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function VetricLogo({ 
  size = 'full', 
  className 
}: VetricLogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    full: 'w-full max-w-[180px]',
  };

  return (
    <img 
      src={vetricLogo} 
      alt="Vetric" 
      className={cn(sizes[size], 'w-auto', className)}
    />
  );
}
