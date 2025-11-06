// components/employee/TimeLogStatsCard.tsx

import { LucideIcon } from 'lucide-react';

interface TimeLogStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

export default function TimeLogStatsCard({ title, value, icon: Icon, colorClass }: TimeLogStatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 ${colorClass} rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}