import RadarChart from './RadarChart';
import GroupProgressIndicator from './GroupProgressIndicator';
import type { DimensionKey, DimensionAssessment, CustomDimension, GroupAssessmentData } from '../../../types';

interface Props {
  groupData: GroupAssessmentData;
  personalDimensions: Record<DimensionKey, DimensionAssessment>;
  customDimensions: CustomDimension[];
  hiddenDimensions: DimensionKey[];
}

export default function GroupComparisonOverlay({
  groupData,
  personalDimensions,
  customDimensions,
  hiddenDimensions,
}: Props) {
  const allCompleted = groupData.completedCount === groupData.totalCount && groupData.totalCount > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress indicator */}
        <GroupProgressIndicator
          members={groupData.members}
          completedCount={groupData.completedCount}
          totalCount={groupData.totalCount}
        />

        {/* Status info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">How this works</h4>
          <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
            <li>Each member completes their individual assessment above</li>
            <li>The radar below shows your scores vs. the anonymous group average</li>
            <li>Once everyone has completed, discuss the differences</li>
            <li>Then build a single consensus diagnostic for your institution</li>
          </ol>
          {allCompleted && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-medium">
              All members have completed! You can now start the group consensus below.
            </div>
          )}
        </div>
      </div>

      {/* Overlay radar: personal vs group average */}
      {groupData.groupAverage && (
        <RadarChart
          dimensions={personalDimensions}
          customDimensions={customDimensions}
          hiddenDimensions={hiddenDimensions}
          comparisonDimensions={groupData.groupAverage as Record<DimensionKey, DimensionAssessment>}
          primaryLabel="My Assessment"
          comparisonLabel="Group Average"
        />
      )}
    </div>
  );
}
