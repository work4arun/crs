"use client";

import { LucideIcon } from "lucide-react";

interface ParameterCardProps {
    title: string;
    points: number;
    icon: LucideIcon;
    colorClass: string;
}

export function ParameterCard({ title, points, icon: Icon, colorClass }: ParameterCardProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
                </div>
                <span className="text-2xl font-bold text-gray-800">{points}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{title}</h3>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${colorClass.replace("bg-", "bg-")}`} style={{ width: '45%' }}></div>
            </div>
        </div>
    );
}
