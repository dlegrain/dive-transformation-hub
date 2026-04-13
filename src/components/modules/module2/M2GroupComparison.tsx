import { AlertTriangle, Shield } from 'lucide-react';
import { RESISTANCE_BEHAVIORS, ANXIETY_TYPES, MISSING_LEVERS } from '../../../lib/constants';
import GroupProgressIndicator from '../module1/GroupProgressIndicator';
import type { GroupStakeholderData, Stakeholder } from '../../../types';

interface Props {
  groupData: GroupStakeholderData;
}

function StakeholderMiniCard({ s, showAuthor }: { s: Stakeholder & { participant_name?: string }; showAuthor?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{s.name}</h4>
          <span className="text-xs text-gray-500">
            {s.role} {s.discipline && s.discipline !== 'Other' ? `(${s.discipline})` : ''}
          </span>
        </div>
        {showAuthor && s.participant_name && (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            by {s.participant_name}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
          s.behavior === 'supportive'
            ? 'bg-accent-50 text-accent-700 border-accent-200'
            : 'bg-danger-50 text-danger-700 border-danger-200'
        }`}>
          {RESISTANCE_BEHAVIORS.find((b) => b.value === s.behavior)?.label}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-warning-50 text-warning-700 border border-warning-200">
          {ANXIETY_TYPES.find((a) => a.value === s.anxiety)?.label}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-50 text-primary-700 border border-primary-200">
          {MISSING_LEVERS.find((l) => l.value === s.missing_lever)?.label}
        </span>
      </div>
      {s.generated_counter_measure && (
        <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
          s.behavior === 'supportive' || s.anxiety === 'ethical_engagement'
            ? 'bg-accent-50 border border-accent-200'
            : 'bg-primary-50 border border-primary-200'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            {s.behavior === 'supportive' || s.anxiety === 'ethical_engagement' ? (
              <Shield size={12} className="text-accent-600" />
            ) : (
              <AlertTriangle size={12} className="text-primary-600" />
            )}
            <span className="font-semibold text-[10px] uppercase tracking-wider text-gray-600">
              {s.behavior === 'supportive' ? 'Leverage Strategy' : 'Counter-Measure'}
            </span>
          </div>
          <p className="text-gray-700">{s.generated_counter_measure.split('\n\n')[0]}</p>
        </div>
      )}
    </div>
  );
}

export default function M2GroupComparison({ groupData }: Props) {
  const { members, individualStakeholders } = groupData;

  // Group stakeholders by member
  const byMember: Record<string, typeof individualStakeholders> = {};
  for (const s of individualStakeholders) {
    const pid = (s as unknown as { participant_id: string }).participant_id;
    if (!byMember[pid]) byMember[pid] = [];
    byMember[pid].push(s);
  }

  return (
    <div className="space-y-4">
      <GroupProgressIndicator
        members={members}
        completedCount={groupData.completedCount}
        totalCount={groupData.totalCount}
      />

      {individualStakeholders.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No stakeholders mapped yet by group members.
        </div>
      ) : (
        <div className="space-y-6">
          {members.filter((m) => byMember[m.id]?.length > 0).map((member) => (
            <div key={member.id}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {member.name}'s stakeholders ({byMember[member.id].length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {byMember[member.id].map((s) => (
                  <StakeholderMiniCard key={s.id} s={s} />
                ))}
              </div>
            </div>
          ))}

          {/* Summary stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Group Overview
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">{individualStakeholders.length}</div>
                <div className="text-xs text-gray-500">Total stakeholders</div>
              </div>
              <div>
                <div className="text-xl font-bold text-danger-600">
                  {individualStakeholders.filter((s) => s.behavior.startsWith('subtle')).length}
                </div>
                <div className="text-xs text-gray-500">Subtle resistance</div>
              </div>
              <div>
                <div className="text-xl font-bold text-accent-600">
                  {individualStakeholders.filter((s) => s.anxiety === 'ethical_engagement').length}
                </div>
                <div className="text-xs text-gray-500">Potential allies</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
