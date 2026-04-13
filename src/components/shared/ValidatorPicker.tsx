import { useState } from 'react';
import { UserCheck, RefreshCw } from 'lucide-react';
import type { GroupMemberStatus } from '../../types';

interface Props {
  members: GroupMemberStatus[];
  currentParticipantId: string;
  validatorId: string | null;
  validatorName: string | null;
  loading: boolean;
  onClaim: (participantId: string) => Promise<boolean>;
  onRelease: () => Promise<void>;
  moduleName: string;
}

export default function ValidatorPicker({
  members,
  currentParticipantId,
  validatorId,
  validatorName,
  loading,
  onClaim,
  onRelease,
  moduleName,
}: Props) {
  const [claiming, setClaiming] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const isMe = validatorId === currentParticipantId;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  // Validator already chosen
  if (validatorId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCheck size={20} className="text-primary-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {isMe ? 'You are' : `${validatorName} is`} the validator for {moduleName}
              </div>
              <div className="text-xs text-gray-500">
                {isMe
                  ? 'You can edit and validate the group consensus.'
                  : 'They will edit and validate. You can view the consensus in read-only.'}
              </div>
            </div>
          </div>
          {isMe && (
            <button
              onClick={async () => {
                setReleasing(true);
                await onRelease();
                setReleasing(false);
              }}
              disabled={releasing}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={12} className={releasing ? 'animate-spin' : ''} />
              Change validator
            </button>
          )}
        </div>
      </div>
    );
  }

  // No validator yet — show picker
  return (
    <div className="bg-amber-50 rounded-lg border border-amber-200 p-5">
      <h4 className="text-sm font-semibold text-amber-800 mb-1">
        Choose your group's validator for {moduleName}
      </h4>
      <p className="text-xs text-amber-600 mb-4">
        Discuss with your group. The validator will be the one editing and validating the consensus. Others will see it in read-only.
      </p>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={async () => {
              if (m.id !== currentParticipantId) return;
              setClaiming(true);
              await onClaim(m.id);
              setClaiming(false);
            }}
            disabled={claiming || m.id !== currentParticipantId}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              m.id === currentParticipantId
                ? 'border-primary-400 bg-white text-primary-700 hover:bg-primary-50 cursor-pointer'
                : 'border-gray-200 bg-white text-gray-400 cursor-not-allowed'
            }`}
          >
            {m.id === currentParticipantId ? "I'll be the validator" : m.name}
          </button>
        ))}
      </div>
      {members.length > 1 && (
        <p className="text-[10px] text-amber-500 mt-2 italic">
          Each person can only volunteer themselves — click "I'll be the validator" to claim the role.
        </p>
      )}
    </div>
  );
}
