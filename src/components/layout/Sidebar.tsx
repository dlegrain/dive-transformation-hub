import { NavLink } from 'react-router-dom';
import {
  Radar,
  Users,
  Lightbulb,
  CalendarCheck,
  FileDown,
} from 'lucide-react';

const modules = [
  {
    to: '/module1',
    label: 'Maturity Diagnostic',
    day: 'Day 1',
    icon: Radar,
  },
  {
    to: '/module2',
    label: 'Resistance Mapping',
    day: 'Day 2',
    icon: Users,
  },
  {
    to: '/module3',
    label: 'Solutions Arsenal',
    day: 'Day 3',
    icon: Lightbulb,
  },
  {
    to: '/module4',
    label: '90-Day Plan',
    day: 'Day 4',
    icon: CalendarCheck,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-primary-950 text-white flex flex-col min-h-screen">
      {/* Logo / Title */}
      <div className="p-6 border-b border-primary-800">
        <h1 className="text-lg font-bold tracking-tight">DIVE</h1>
        <p className="text-xs text-primary-300 mt-1">Transformation Hub</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {modules.map((mod) => (
          <NavLink
            key={mod.to}
            to={mod.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-800 text-white border-r-2 border-primary-400'
                  : 'text-primary-300 hover:bg-primary-900 hover:text-white'
              }`
            }
          >
            <mod.icon size={18} />
            <div>
              <div className="font-medium">{mod.label}</div>
              <div className="text-xs opacity-60">{mod.day}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Export button */}
      <div className="p-4 border-t border-primary-800">
        <NavLink
          to="/export"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FileDown size={16} />
          Generate PDF Report
        </NavLink>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-primary-800">
        <p className="text-xs text-primary-400 text-center">
          DIVE Seminar 2026
        </p>
      </div>
    </aside>
  );
}
