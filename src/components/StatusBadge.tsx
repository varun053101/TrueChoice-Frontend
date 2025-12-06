import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ElectionStatus } from '@/types';

interface StatusBadgeProps {
  status: ElectionStatus;
  className?: string;
}

const statusConfig: Record<ElectionStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-status-scheduled/15 text-status-scheduled',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-status-ongoing/15 text-status-ongoing',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {status === 'ongoing' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ongoing opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ongoing" />
        </span>
      )}
      {config.label}
    </motion.span>
  );
}
