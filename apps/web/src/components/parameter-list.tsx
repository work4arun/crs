"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { SubParameterForm } from "./sub-parameter-form";
import { FormEditor } from "./form-editor";

interface SubParameter {
    id: string;
    name: string;
    description: string;
    weightage: number;
    maxScore: number;
    scoringMode: "ACCUMULATIVE" | "DEDUCTION";
    calculationMode: "SUM" | "LATEST" | "AVERAGE" | "MAX";
    deductionValue?: number;
    minScore?: number;
    mappedManagerId?: string;
}

interface Parameter {
    id: string;
    name: string;
    description: string;
    weightage: number;
    maxScore: number;
    subParameters: SubParameter[];
}

interface ParameterListProps {
    refreshTrigger: number;
}

export function ParameterList({ refreshTrigger }: ParameterListProps) {
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingSubParamTo, setAddingSubParamTo] = useState<string | null>(null);
    const [editingSubParamId, setEditingSubParamId] = useState<string | null>(null);
    const [editingFormFor, setEditingFormFor] = useState<{ id: string, name: string } | null>(null);
    const { token } = useAuth();
    const [localRefresh, setLocalRefresh] = useState(0);

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/parameters`, {
                    headers: { Authorization: `Bearer ${token || storedToken}` }
                });
                setParameters(response.data);
            } catch (error) {
                console.error("Failed to fetch parameters", error);
            } finally {
                setLoading(false);
            }
        };

        fetchParameters();
    }, [token, refreshTrigger, localRefresh]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this parameter?")) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.delete(`${API_URL}/parameters/${id}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setLocalRefresh(prev => prev + 1);
        } catch (error) {
            console.error("Failed to delete parameter", error);
            alert("Failed to delete parameter");
        }
    };

    const handleSubParamDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sub-parameter?")) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.delete(`${API_URL}/sub-parameters/${id}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setLocalRefresh(prev => prev + 1);
        } catch (error) {
            console.error("Failed to delete sub-parameter", error);
            alert("Failed to delete sub-parameter");
        }
    };

    if (loading) return <div>Loading parameters...</div>;

    const totalWeightage = parameters.reduce((sum, p) => sum + p.weightage, 0);

    return (
        <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">
                Existing Parameters (Total Weightage: {totalWeightage}%)
            </h3>
            {parameters.length === 0 ? (
                <p className="text-gray-500">No parameters defined yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {parameters.map((param) => (
                        <li key={param.id} className="py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-md font-bold text-gray-900">{param.name}</h4>
                                    <p className="text-sm text-gray-500">{param.description}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 bg-blue-100 px-2 py-1 rounded">{param.weightage}%</span>
                                        <span className="text-sm text-gray-500 ml-2">Max: {param.maxScore}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAddingSubParamTo(param.id)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            Add Sub-Param
                                        </button>
                                        <button
                                            onClick={() => handleDelete(param.id)}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Parameters List */}
                            {param.subParameters && param.subParameters.length > 0 && (
                                <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                                    <ul className="space-y-2">
                                        {param.subParameters.map(sub => (
                                            <li key={sub.id} className="flex flex-col text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span>{sub.name} <span className="text-gray-400">({sub.weightage}%)</span></span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingFormFor({ id: sub.id, name: sub.name })}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            Manage Form
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingSubParamId(sub.id)}
                                                            className="text-xs text-orange-600 hover:text-orange-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleSubParamDelete(sub.id)}
                                                            className="text-gray-500 hover:text-red-600 font-semibold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Edit Sub-Parameter Form */}
                                                {editingSubParamId === sub.id && (
                                                    <SubParameterForm
                                                        parameterId={param.id}
                                                        initialData={sub}
                                                        isEditing={true}
                                                        onSuccess={() => {
                                                            setEditingSubParamId(null);
                                                            setLocalRefresh(prev => prev + 1);
                                                        }}
                                                        onCancel={() => setEditingSubParamId(null)}
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Add Sub-Parameter Form */}
                            {addingSubParamTo === param.id && (
                                <SubParameterForm
                                    parameterId={param.id}
                                    onSuccess={() => {
                                        setAddingSubParamTo(null);
                                        setLocalRefresh(prev => prev + 1);
                                    }}
                                    onCancel={() => setAddingSubParamTo(null)}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )
            }

            {/* Form Editor Modal */}
            {
                editingFormFor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Edit Form: {editingFormFor.name}</h2>
                                <button onClick={() => setEditingFormFor(null)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">×</button>
                            </div>
                            <FormEditor
                                subParameterId={editingFormFor.id}
                                subParameterName={editingFormFor.name}
                                onClose={() => {
                                    setEditingFormFor(null);
                                    setLocalRefresh(prev => prev + 1);
                                }}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
}
