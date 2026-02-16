"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/config";
import { StudentSelector } from "@/components/student-selector";
import { FormRenderer } from "@/components/form-renderer";
import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";

interface Parameter {
    id: string;
    name: string;
    subParameters: SubParameter[];
}

interface SubParameter {
    id: string;
    name: string;
    maxScore: number;
    scoringMode?: "ACCUMULATIVE" | "DEDUCTION";
    formTemplate?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: any;
    };
}

export default function DataEntryPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [entryMode, setEntryMode] = useState<"single" | "bulk">("single");
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [student, setStudent] = useState<any>(null);
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [selectedParam, setSelectedParam] = useState<string>("");
    const [selectedSubParam, setSelectedSubParam] = useState<string>("");
    const [subParamDetails, setSubParamDetails] = useState<SubParameter | null>(null);

    const [score, setScore] = useState<number | "">("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchParameters = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await axios.get(`${API_URL}/parameters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParameters(res.data);
        } catch (err: unknown) {
            console.error("Failed to fetch parameters", err);
            // setError("Failed to load parameters.");
        }
    }, [router]);

    useEffect(() => {
        // eslint-disable-next-line
        fetchParameters();
    }, [fetchParameters]);

    useEffect(() => {
        if (selectedParam && selectedSubParam) {
            const param = parameters.find((p) => p.id === selectedParam);
            const sub = param?.subParameters.find((s) => s.id === selectedSubParam);
            // eslint-disable-next-line
            setSubParamDetails(sub || null);
            setFormData({});
            setScore("");
        }
    }, [selectedParam, selectedSubParam, parameters]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student || !selectedSubParam) return;
        if (score === "" && !subParamDetails?.formTemplate) {
            setMessage({ type: "error", text: "Please enter a score." });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${API_URL}/scores`,
                {
                    studentId: student.id,
                    subParameterId: selectedSubParam,
                    obtainedScore: Number(score),
                    data: formData,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: "success", text: "Score recorded successfully!" });
            setScore("");
            setFormData({});
        } catch (error: unknown) {
            console.error(error);
            const errorObj = error as { response?: { data?: { message?: string } } };
            setMessage({
                type: "error",
                text: errorObj.response?.data?.message || "Failed to record score.",
            });
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkFile || !selectedSubParam) {
            setMessage({ type: "error", text: "Please select a file and parameter." });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split("\n").slice(1); // Skip header
            const bulkData = rows
                .filter((row) => row.trim() !== "")
                .map((row) => {
                    const [registerNumber, score, data] = row.split(",");
                    return {
                        registerNumber: registerNumber.trim(),
                        subParameterId: selectedSubParam,
                        obtainedScore: Number(score.trim()),
                        data: data ? JSON.parse(data.trim() || "{}") : {},
                    };
                });

            try {
                const token = localStorage.getItem("token");
                const res = await axios.post(
                    `${API_URL}/scores/bulk-upload`,
                    bulkData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({
                    type: res.data.failed > 0 ? "error" : "success",
                    text: `Processed: ${res.data.success} success, ${res.data.failed} failed. ${res.data.errors.length > 0 ? 'Check console for errors.' : ''}`
                });
                if (res.data.errors.length > 0) console.error("Bulk Upload Errors:", res.data.errors);
                setBulkFile(null);
            } catch (error: unknown) {
                console.error(error);
                setMessage({ type: "error", text: "Bulk upload failed." });
            }
        };
        reader.readAsText(bulkFile);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Data Entry & Scoring</h1>
                <div className="bg-gray-200 p-1 rounded-lg flex text-sm font-medium">
                    <button
                        onClick={() => setEntryMode("single")}
                        className={`px-4 py-2 rounded-md transition-all ${entryMode === "single" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Single Entry
                    </button>
                    <button
                        onClick={() => setEntryMode("bulk")}
                        className={`px-4 py-2 rounded-md transition-all ${entryMode === "bulk" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Bulk Upload
                    </button>
                    <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
                    <button
                        onClick={logout}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {message && (
                <div
                    className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {entryMode === "single" && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">1. Select Student</h2>
                    <StudentSelector onSelect={setStudent} />
                    {student && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                            Selected: <strong>{student.name}</strong> ({student.registerNumber})
                        </div>
                    )}
                </div>
            )}

            {(student || entryMode === "bulk") && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">{entryMode === "single" ? "2. Select Parameter" : "1. Select Parameter for Bulk Upload"}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Main Parameter
                            </label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedParam}
                                onChange={(e) => {
                                    setSelectedParam(e.target.value);
                                    setSelectedSubParam("");
                                }}
                            >
                                <option value="">-- Select Parameter --</option>
                                {parameters.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub-Parameter
                            </label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedSubParam}
                                onChange={(e) => setSelectedSubParam(e.target.value)}
                                disabled={!selectedParam}
                            >
                                <option value="">-- Select Sub-Parameter --</option>
                                {selectedParam &&
                                    parameters
                                        .find((p) => p.id === selectedParam)
                                        ?.subParameters?.map((sp) => (
                                            <option key={sp.id} value={sp.id}>
                                                {sp.name} (Max: {sp.maxScore})
                                            </option>
                                        ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {entryMode === "single" && student && selectedSubParam && subParamDetails && (
                <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        3. Enter {subParamDetails.scoringMode === "DEDUCTION" ? "Deduction Details" : "Score Data"}
                        {subParamDetails.scoringMode === "DEDUCTION" && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Violation Mode</span>
                        )}
                    </h2>

                    <div className="space-y-6">
                        {/* Form Renderer for JSON Schema */}
                        {subParamDetails.formTemplate && subParamDetails.formTemplate.schema ? (
                            <div className="mb-6 border-b pb-6">
                                <h3 className="font-medium mb-2 text-gray-700">Form Details</h3>
                                <FormRenderer
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    schema={subParamDetails.formTemplate.schema as any}
                                    onChange={setFormData}
                                    onSubmit={() => { }} // Not used as we capture data via onChange
                                    hideSubmit={true}
                                    noFormTag={true}
                                />
                            </div>
                        ) : null}

                        {/* DEDUCTION MODE UI */}
                        {subParamDetails.scoringMode === "DEDUCTION" ? (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
                                <p className="text-sm text-red-600">
                                    <strong>Note:</strong> This parameter starts at <strong>{subParamDetails.maxScore}</strong> points.
                                    Any value entered below will be <strong>subtracted</strong> from the total.
                                </p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Amount to Deduct
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-red-500">-</span>
                                        <input
                                            type="number"
                                            min="0"
                                            // max={subParamDetails.maxScore} // Technically can deduct more than max over time, handled by clamping
                                            className="w-full p-2 border rounded border-red-200 focus:ring-red-500 focus:border-red-500"
                                            placeholder="e.g. 5"
                                            value={score}
                                            onChange={(e) => setScore(Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for Deduction <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500"
                                        rows={3}
                                        placeholder="Explain the violation..."
                                        value={formData.reason || ""}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            // STANDARD SCORE INPUT
                            <div className="mb-6">
                                {!subParamDetails.formTemplate && (
                                    <p className="text-gray-500 mb-4 italic">No specific form for this parameter. Please enter score directly.</p>
                                )}
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Score (Max: {subParamDetails.maxScore})
                                </label>
                                <input
                                    type="number"
                                    max={subParamDetails.maxScore}
                                    className="w-full p-2 border rounded"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e)}
                            className={`w-full py-3 px-4 rounded font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] ${subParamDetails.scoringMode === "DEDUCTION"
                                ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                                }`}
                        >
                            {subParamDetails.scoringMode === "DEDUCTION" ? "Record Violation" : "Submit Score"}
                        </button>
                    </div>
                </div>
            )}

            {entryMode === "bulk" && selectedSubParam && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">2. Upload CSV File</h2>
                    <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                        <p className="font-bold mb-1">CSV Format Required:</p>
                        <code className="block bg-gray-100 p-2 rounded">registerNumber, score, data(optional JSON)</code>
                        <p className="mt-2 text-gray-500">Example: <br /> 21CS001, 85 <br /> 21CS002, 90, {"{"}&quot;comment&quot;: &quot;Good job&quot;{"}"}</p>
                    </div>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all mb-4"
                    />

                    <button
                        onClick={handleBulkSubmit}
                        disabled={!bulkFile}
                        className={`w-full py-2 px-4 rounded font-medium ${bulkFile ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Upload and Process Scores
                    </button>
                </div>
            )}
        </div>
    );
}
