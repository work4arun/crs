"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Users, AlertTriangle, Award, TrendingUp, Activity, GraduationCap, Download, Filter, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
    const { token } = useAuth();
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [department, setDepartment] = useState("");
    const [batch, setBatch] = useState("");

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (department) params.append("department", department);
            if (department && department !== "All") params.append("department", department);
            if (batch && batch !== "All") params.append("batch", batch);

            const res = await axios.get(`${API_URL}/analytics/admin/stats?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        } finally {
            setLoading(false);
        }
    }, [token, storedToken, department, batch]);

    useEffect(() => {
        if (token || storedToken) fetchStats();
        else setLoading(false);
    }, [fetchStats, token, storedToken]); // Added dependencies

    const handleDownloadCsv = async () => {
        try {
            const params = new URLSearchParams();
            if (department && department !== "All") params.append("department", department);
            if (batch && batch !== "All") params.append("batch", batch);

            const res = await axios.get(`${API_URL}/analytics/admin/export-csv?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });

            // Create blob and download
            const blob = new Blob([res.data.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `growthcard_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download CSV", err);
            alert("Failed to download report");
        }
    };

    if (loading && !stats) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h2>
                    <p className="text-slate-500 mt-1">Overview of institutional performance and health.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <Filter size={16} className="text-slate-400 ml-2" />
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="border-none text-sm font-medium text-slate-600 focus:ring-0 bg-transparent py-1 pl-2 pr-8 cursor-pointer"
                        >
                            <option value="">All Departments</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="MECH">MECH</option>
                            <option value="IT">IT</option>
                            <option value="BME">BME</option>
                            <option value="RA">RA</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <Filter size={16} className="text-slate-400 ml-2" />
                        <select
                            value={batch}
                            onChange={e => setBatch(e.target.value)}
                            className="border-none text-sm font-medium text-slate-600 focus:ring-0 bg-transparent py-1 pl-2 pr-8 cursor-pointer"
                        >
                            <option value="">All Batches</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchStats}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>

                    <button
                        onClick={handleDownloadCsv}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold text-sm"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Avg CRS Score"
                    value={stats?.averageCrs || 0}
                    subValue="/ 100"
                    icon={TrendingUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Violations (Recent)"
                    value={stats?.recentViolations?.length || 0}
                    icon={AlertTriangle}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Active Alerts"
                    value="3"
                    icon={Activity}
                    color="text-rose-600"
                    bg="bg-rose-50"
                    change="Requires attention"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Performers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Award className="text-yellow-500" size={20} />
                        Top Performers
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="p-3">Rank</th>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">CRS Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.topStudents?.map((s: { id: string, name: string, department: string, currentCrs: number }, i: number) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                                        <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                        <td className="p-3 text-gray-600">{s.department}</td>
                                        <td className="p-3 font-bold text-blue-600 text-lg">
                                            {Number((s.currentCrs / 10).toFixed(1))} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                                        </td>
                                    </tr>
                                )) || (
                                        <tr><td colSpan={4} className="text-center py-4 text-gray-400">No data available</td></tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity / Violations */}
                <div className="glass-card p-6 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        Recent Violations
                    </h3>
                    <div className="space-y-4">
                        {stats?.recentViolations?.map((v: { studentName?: string, student?: { name: string }, violationType?: { name: string }, violation?: string, createdAt?: string, date?: string }, i: number) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-start gap-3">
                                <div className="p-2 bg-red-50 rounded-full shrink-0">
                                    <AlertTriangle size={16} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{v.studentName || v.student?.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{v.violation || v.violationType?.name || "Violation"}</p>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(v.date || v.createdAt || "").toLocaleDateString()}</p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-center text-slate-400 py-4">No recent violations.</p>
                            )}
                    </div>
                </div>
            </div>

            {/* Department Stats Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="text-indigo-500" size={20} />
                    Department Performance
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="p-3">Department</th>
                                <th className="p-3">Student Count</th>
                                <th className="p-3">Avg CRS</th>
                                <th className="p-3">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.departmentStats?.map((dept: { department: string, count: number, averageCrs: number }) => (
                                <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{dept.department}</td>
                                    <td className="p-3 text-gray-600">{dept.count}</td>
                                    <td className="p-3 font-bold text-gray-800">{Number(dept.averageCrs).toFixed(1)}</td>
                                    <td className="p-3">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                            <div
                                                className="bg-indigo-500 h-1.5 rounded-full"
                                                style={{ width: `${Math.min(dept.averageCrs, 100)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            )) || (
                                    <tr><td colSpan={4} className="text-center py-4 text-gray-400">No data available</td></tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, subValue, icon: Icon, color, bg, change }: any) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${bg} ${color} transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                </div>
                {change && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{change}</span>}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                {subValue && <span className="text-sm text-slate-400 font-medium">{subValue}</span>}
            </div>
        </div>
    );
}
