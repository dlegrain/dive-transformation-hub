import { CheckCircle, Clock, AlertTriangle, Pencil } from 'lucide-react';
import type { ConsensusStatus } from '../../../types';

const STATUS_CONFIG: Record<ConsensusStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  none: { label: 'Not started', color: 'bg-gray-100 text-gray-500', icon: Clock },
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700', icon: Pencil },
  validated: { label: 'Validated', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  reopen_requested: { label: 'Reopen requested', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  reopened: { label: 'Reopened', color: 'bg-amber-100 text-amber-700', icon: Pencil },
};

interface Props {
  status: ConsensusStatus;
}

export default function ConsensusStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
