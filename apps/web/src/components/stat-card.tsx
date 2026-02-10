import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    colorClass?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, colorClass = "bg-blue-600" }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                {trend && (
                    <p className={`text-xs font-medium mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                        <span className="text-gray-400 ml-1">vs last month</span>
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-white`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
    );
}
