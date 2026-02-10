"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";

interface SubParameterFormProps {
    parameterId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function SubParameterForm({ parameterId, onSuccess, onCancel }: SubParameterFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weightage, setWeightage] = useState("");
    const [maxScore, setMaxScore] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth();
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // New Fields
    const [scoringMode, setScoringMode] = useState<"ACCUMULATIVE" | "DEDUCTION">("ACCUMULATIVE");
    const [calculationMode, setCalculationMode] = useState<"SUM" | "LATEST" | "AVERAGE" | "MAX">("LATEST");
    const [deductionValue, setDeductionValue] = useState("");
    const [minScore, setMinScore] = useState("0");
    const [mappedManagerId, setMappedManagerId] = useState("");
    const [managers, setManagers] = useState<{ id: string, email: string }[]>([]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const authToken = token || storedToken;
                if (!authToken) return;

                const response = await axios.get(`${API_URL}/users?role=MANAGER`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setManagers(response.data);
            } catch (err) {
                console.error("Failed to fetch managers", err);
            }
        };

        fetchManagers();
    }, [token, storedToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post(`${API_URL}/sub-parameters`, {
                name,
                description,
                weightage: parseFloat(weightage),
                maxScore: parseFloat(maxScore),
                parameterId,
                scoringMode,
                calculationMode,
                deductionValue: scoringMode === "DEDUCTION" ? parseFloat(deductionValue) : undefined,
                minScore: scoringMode === "DEDUCTION" ? parseFloat(minScore) : undefined,
                mappedManagerId: mappedManagerId || undefined,
            }, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });

            onSuccess();
        } catch (err) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || "Failed to create sub-parameter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded mt-4 border border-gray-200">
            <h4 className="text-sm font-semibold mb-2">Add Sub-Parameter</h4>
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Name & Description (Same as before) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Paper Presentation"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900 placeholder-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">Description</label>
                        <input
                            type="text"
                            placeholder="Brief details"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Scoring Mode & Manager */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded border border-gray-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">Scoring Mode</label>
                        <select
                            value={scoringMode}
                            onChange={(e) => setScoringMode(e.target.value as "ACCUMULATIVE" | "DEDUCTION")}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900"
                        >
                            <option value="ACCUMULATIVE">Accumulative (Add Points)</option>
                            <option value="DEDUCTION">Deduction (Violations)</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            {scoringMode === "ACCUMULATIVE"
                                ? "Checklists, Events, exams. Score starts at 0."
                                : "Discipline, Late Coming. Score starts at Max."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">Calculation Logic</label>
                        <select
                            value={calculationMode}
                            onChange={(e) => setCalculationMode(e.target.value as "SUM" | "LATEST" | "AVERAGE" | "MAX")}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900"
                        >
                            <option value="LATEST">Latest Score (Overwrite)</option>
                            <option value="SUM">Sum of All Scores</option>
                            <option value="AVERAGE">Average of All Scores</option>
                            <option value="MAX">Best Score (Max)</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">
                            How multiple entries are handled.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-800 mb-1">Assign Manager (SPOC)</label>
                        <select
                            value={mappedManagerId}
                            onChange={(e) => setMappedManagerId(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900"
                        >
                            <option value="">-- No Specific Manager --</option>
                            {managers.map(m => (
                                <option key={m.id} value={m.id}>{m.email}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Deduction Specific Fields */}
                {scoringMode === "DEDUCTION" && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-red-50 rounded border border-red-100">
                        <div>
                            <label className="block text-xs font-bold text-red-800 mb-1">Deduction Value</label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Points to cut per violation"
                                value={deductionValue}
                                onChange={(e) => setDeductionValue(e.target.value)}
                                className="block w-full text-sm rounded-md border-red-300 border p-2 text-gray-900 placeholder-red-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-800 mb-1">Min Score Floor</label>
                            <input
                                type="number"
                                value={minScore}
                                onChange={(e) => setMinScore(e.target.value)}
                                className="block w-full text-sm rounded-md border-red-300 border p-2 text-gray-900 placeholder-red-300"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-800 mb-1">Weight (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="0-100"
                            value={weightage}
                            onChange={(e) => setWeightage(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900 placeholder-gray-600"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-800 mb-1">Max Score</label>
                        <input
                            type="number"
                            placeholder="e.g. 10"
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="block w-full text-sm rounded-md border-gray-400 border p-2 text-gray-900 placeholder-gray-600"
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-3 py-1 text-xs rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {loading ? "Adding..." : "Add"}
                    </button>
                </div>
            </form>
        </div>
    );
}
