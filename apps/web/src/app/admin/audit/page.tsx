"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { History } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    resourceId?: string;
    userId: string | null;
    details: Record<string, unknown>;
    ipAddress?: string;
    createdAt: string;
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);

    const fetchLogs = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/audit?limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data);
        } catch (err: unknown) {
            console.error("Failed to fetch audit logs", err);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <History className="text-orange-500" size={32} />
                        System Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1">Track accurate history of all critical actions.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white border text-sm p-2 rounded shadow-sm"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <option value={50}>Last 50</option>
                        <option value={100}>Last 100</option>
                        <option value={500}>Last 500</option>
                    </select>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="p-4 w-48">Timestamp</th>
                                <th className="p-4 w-48">Action</th>
                                <th className="p-4 w-48">Resource</th>
                                <th className="p-4">User ID</th>
                                <th className="p-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading logs...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'LOGIN' ? 'bg-blue-100 text-blue-700' :
                                            log.action === 'SCORE_ADD' ? 'bg-green-100 text-green-700' :
                                                log.action === 'VIOLATION_RECORD' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-700 font-medium">
                                        {log.resource} <span className="text-gray-400 text-xs ml-1">#{log.resourceId?.slice(0, 8)}</span>
                                    </td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {log.userId || 'System'}
                                    </td>
                                    <td className="p-4">
                                        <pre className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded max-w-xs overflow-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
