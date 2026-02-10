"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardRenderer } from "@/components/widgets/dashboard-renderer";
import { useParams } from "next/navigation";

export default function DashboardViewer() {
    const { id } = useParams();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dashboard, setDashboard] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardAndData = async () => {
            try {
                const token = localStorage.getItem("token");

                // 1. Fetch Dashboard Layout
                const dashRes = await axios.get(`http://localhost:3001/dashboards/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboard(dashRes.data);

                // 2. Fetch Data (Optimized: only fetch if needed, but for now fetch generic admin stats)
                // In a real app, we might have specific endpoints based on Dashboard Role
                const statsRes = await axios.get("http://localhost:3001/analytics/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Adapt stats to match widget expectations
                setStats({
                    totalStudents: statsRes.data.totalStudents,
                    averageCrs: statsRes.data.averageCrs,
                    recentViolationsCount: statsRes.data.recentViolations.length,
                    topStudentScore: statsRes.data.topStudents?.[0]?.currentCrs || 'N/A'
                });

            } catch (err: unknown) {
                console.error(err);
                setError("Failed to load dashboard. Ensure you have permission.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDashboardAndData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!dashboard) return <div className="p-8 text-center text-gray-400">Dashboard not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b px-8 py-4 shadow-sm flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">{dashboard.name}</h1>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                    For: {dashboard.role}
                </span>
            </div>

            <DashboardRenderer layout={dashboard.layout} data={stats} />
        </div>
    );
}
