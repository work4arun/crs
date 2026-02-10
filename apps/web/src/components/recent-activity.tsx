"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface ActivityItem {
    id: string;
    type: "SCORE" | "VIOLATION";
    title: string;
    points: number;
    date: string;
}

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
    if (activities.length === 0) {
        return <div className="text-gray-500 text-sm">No recent activity.</div>;
    }

    return (
        <div className="space-y-4">
            {activities.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`mt-1 ${item.type === 'SCORE' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.type === 'SCORE' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${item.type === 'SCORE' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'SCORE' ? '+' : '-'}{Math.abs(item.points)}
                    </div>
                </div>
            ))}
        </div>
    );
}
