"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config";

interface ViolationType {
    id: string;
    name: string;
    penalty: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export default function ViolationsPage() {
    const [violations, setViolations] = useState<ViolationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");
    const [formPenalty, setFormPenalty] = useState("");
    const [formSeverity, setFormSeverity] = useState("LOW");

    useEffect(() => {
        fetchViolations();
    }, []);

    const fetchViolations = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/violations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setViolations(res.data);
        } catch (err: unknown) {
            setError("Failed to fetch violations.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const data = {
            name: formName,
            penalty: Number(formPenalty),
            severity: formSeverity,
        };

        try {
            if (isEditing && editId) {
                await axios.patch(`${API_URL}/violations/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${API_URL}/violations`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            resetForm();
            fetchViolations();
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((err as any).response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this violation type?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/violations/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchViolations();
        } catch {
            alert("Failed to delete violation.");
        }
    };

    const startEdit = (v: ViolationType) => {
        setIsEditing(true);
        setEditId(v.id);
        setFormName(v.name);
        setFormPenalty(v.penalty.toString());
        setFormSeverity(v.severity);
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setFormName("");
        setFormPenalty("");
        setFormSeverity("LOW");
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Violation Configuration</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="bg-white p-6 rounded shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Violation" : "Add New Violation"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border rounded"
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                                placeholder="e.g. Late Attendance"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Penalty (Points)</label>
                            <input
                                type="number"
                                required
                                className="w-full p-2 border rounded"
                                value={formPenalty}
                                onChange={e => setFormPenalty(e.target.value)}
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Severity</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formSeverity}
                                onChange={e => setFormSeverity(e.target.value)}
                            >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                                <option value="CRITICAL">CRITICAL</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                {isEditing ? "Update" : "Create"}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Existing Violations</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Penalty</th>
                                    <th className="py-2">Severity</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {violations.map(v => (
                                    <tr key={v.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{v.name}</td>
                                        <td className="py-2 font-medium text-red-600">-{v.penalty}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${v.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                v.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                    v.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {v.severity}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <button onClick={() => startEdit(v)} className="text-blue-600 hover:underline mr-3">Edit</button>
                                            <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {violations.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-500">No violations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
