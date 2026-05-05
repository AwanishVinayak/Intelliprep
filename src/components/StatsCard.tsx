import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
  className?: string;
  onClick?: () => void;
}

export default function StatsCard({ label, value, icon: Icon, trend, trendDirection, className, onClick }: StatsCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        onClick && "cursor-pointer hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-black text-white">
          <Icon size={20} />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-mono font-bold uppercase px-2 py-0.5 border",
            trendDirection === 'up' ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-50 mb-1">{label}</p>
      <h3 className="text-3xl font-black">{value}</h3>
    </div>
  );
}
