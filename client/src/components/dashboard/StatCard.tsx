import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColorClass: string;
  textColorClass: string;
}

export default function StatCard({ title, value, icon, bgColorClass, textColorClass }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${bgColorClass}`}>
          <span className={`${textColorClass}`}>{icon}</span>
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
