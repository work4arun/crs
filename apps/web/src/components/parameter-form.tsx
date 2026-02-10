"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";

interface ParameterFormProps {
    onSuccess: () => void;
}

export function ParameterForm({ onSuccess }: ParameterFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weightage, setWeightage] = useState("");
    const [maxScore, setMaxScore] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { token } = useAuth(); // Assuming token is exposed now

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const storedToken = localStorage.getItem('token');
            await axios.post("http://localhost:3001/parameters", {
                name,
                description,
                weightage: parseFloat(weightage),
                maxScore: parseFloat(maxScore),
            }, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });

            // Reset form
            setName("");
            setDescription("");
            setWeightage("");
            setMaxScore("");
            onSuccess();
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj.response?.data?.message || "Failed to create parameter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Main Parameter</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900 placeholder-gray-600"
                        placeholder="e.g. Academic Performance"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900 placeholder-gray-600"
                        placeholder="Brief description of the parameter"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-900">Weightage (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weightage}
                            onChange={(e) => setWeightage(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900 placeholder-gray-600"
                            placeholder="0-100"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-900">Max Score</label>
                        <input
                            type="number"
                            value={maxScore}
                            onChange={(e) => setMaxScore(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900 placeholder-gray-600"
                            placeholder="e.g. 100"
                            required
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {loading ? "Creating..." : "Create Parameter"}
                </button>
            </form>
        </div>
    );
}
