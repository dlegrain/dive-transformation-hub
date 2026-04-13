import { CheckCircle, Circle } from 'lucide-react';
import type { GroupMemberStatus } from '../../../types';

interface Props {
  members: GroupMemberStatus[];
  completedCount: number;
  totalCount: number;
}

export default function GroupProgressIndicator({ members, completedCount, totalCount }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Group Progress</h4>
        <span className="text-xs font-medium text-gray-500">
          {completedCount}/{totalCount} completed
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full transition-all duration-500 bg-primary-500"
          style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
        />
      </div>
      {/* Member list */}
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2 text-xs">
            {m.has_completed ? (
              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={14} className="text-gray-300 flex-shrink-0" />
            )}
            <span className={m.has_completed ? 'text-gray-700' : 'text-gray-400'}>
              {m.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
