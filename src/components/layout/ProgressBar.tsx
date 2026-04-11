import { useLocation } from 'react-router-dom';

const steps = [
  { path: '/module1', label: 'Diagnostic', day: 1 },
  { path: '/module2', label: 'Resistance', day: 2 },
  { path: '/module3', label: 'Solutions', day: 3 },
  { path: '/module4', label: '90-Day Plan', day: 4 },
];

export default function ProgressBar() {
  const location = useLocation();
  const currentIndex = steps.findIndex((s) => location.pathname.startsWith(s.path));

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.path} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-accent-500 text-white'
                      : isCurrent
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : step.day}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isCompleted ? 'bg-accent-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
