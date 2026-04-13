import { Users, Handshake } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { useGroupStakeholders } from '../../../lib/use-group-stakeholders';
import { useValidator } from '../../../lib/use-validator';
import M2ConsensusForm from './M2ConsensusForm';
import ValidatorPicker from '../../shared/ValidatorPicker';
import ConsensusStatusBadge from '../module1/ConsensusStatusBadge';

export default function Module2Page() {
  const { participant, group } = useAuth();
  const { data: groupData, refetch: refetchGroup } = useGroupStakeholders(group?.id);
  const validator = useValidator(group?.id, 'module2');

  const hasGroup = groupData && groupData.totalCount >= 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium mb-1">
          <span className="bg-primary-100 px-2 py-0.5 rounded">Day 2</span>
          Module 2
          {(groupData?.consensusStatus && groupData.consensusStatus !== 'none') && (
            <ConsensusStatusBadge status={groupData.consensusStatus} />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Human Resistance Mapping
        </h2>
        <p className="text-gray-500 mt-1">
          Import the stakeholders you identified this morning with J. Parisse, then enrich them with AI-specific research lenses.
        </p>
        <p className="text-xs text-gray-400 mt-2 italic">
          Based on Deacon et al. (2025), Cao et al. (2026), Singh & Strzelecki (2026), Verano-Tacoronte et al. (2025)
        </p>
      </div>

      {/* No group yet */}
      {!hasGroup && (
        <div className="text-center py-12 text-gray-400">
          <Users size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Waiting for your group to be formed.</p>
        </div>
      )}

      {/* Group flow */}
      {hasGroup && (
        <>
          {/* Step 1: Choose validator */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Handshake size={16} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Step 1 — Choose who types
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              One person per group enters the data. Everyone else discusses and dictates. The "validator" can be changed anytime.
            </p>
            <ValidatorPicker
              members={groupData.members}
              currentParticipantId={participant?.id || ''}
              validatorId={validator.validatorId}
              validatorName={validator.validatorName}
              loading={validator.loading}
              onClaim={validator.claim}
              onRelease={validator.release}
              moduleName="Module 2"
            />
          </div>

          {/* Step 2: Map stakeholders (only after validator chosen) */}
          {validator.validatorId && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Step 2 — Map your stakeholders
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Enter the key people you identified this morning. For each one, add the Power/Interest position from J. Parisse's matrix, then apply the three research-based lenses.
              </p>
              <M2ConsensusForm
                groupData={groupData}
                isValidator={validator.validatorId === participant?.id}
                onRefetch={refetchGroup}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
