"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { QrScanner } from "@/components/qr-scanner";

interface Student {
    id: string;
    name: string;
    registerNumber: string;
    department: string;
    photoUrl?: string; // If we had one
}

interface ViolationType {
    id: string;
    name: string;
    severity: string;
    penalty: number;
}

export default function RecordViolationPage() {
    const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
    const [scannedCode, setScannedCode] = useState("");
    const [manualInput, setManualInput] = useState("");
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
    const [selectedViolation, setSelectedViolation] = useState("");
    const [comments, setComments] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchViolationTypes();
    }, []);

    const fetchViolationTypes = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/violations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setViolationTypes(res.data);
        } catch (err) {
            console.error("Failed to fetch violation types", err);
        }
    };

    const handleScan = (decodedText: string) => {
        if (scannedCode !== decodedText) {
            setScannedCode(decodedText);
            fetchStudentByQR(decodedText);
        }
    };

    const handleError = () => {
        // console.warn(err); // Ignore frequent scan errors
    };

    const fetchStudentByQR = async (qr: string) => {
        setLoading(true);
        setError("");
        setStudent(null);
        try {
            const token = localStorage.getItem("token");
            // Assuming we have an endpoint to find by QR. 
            // If not, we might need to search by ID if QR contains ID.
            // Let's assume QR contains a UUID or mapped code.
            // In Phase 2 we generated unique QR codes mapped to student records.
            // We might need an endpoint `GET /students/qr/:code`?
            // Or if QR contains the student ID directly.
            // Let's assume for now it's the `qrCode` field in Student model.
            // We'll trust `GET /students?qrCode=...` or similar.
            // Actually `StudentsController.findAll` supports filtering?
            // I'll check `StudentsService` later. If not, I'll need to update it.
            // For now, let's assume we can search by Register Number via manual input too.

            // Temporary: Assume QR contains Register Number for simplicity in this prototype if QR not fully mocked?
            // No, let's try strict.
            const res = await axios.get(`${API_URL}/students/qr/${qr}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudent(res.data);
        } catch {
            // Fallback: maybe QR contains just the ID?
            try {
                const token = localStorage.getItem("token");
                const res2 = await axios.get(`${API_URL}/students/${qr}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(res2.data);
            } catch {
                setError("Student not found.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setStudent(null);
        try {
            const token = localStorage.getItem("token");
            // Search by register number
            // We can use the existing `findAll` if it supports filtering or search.
            // Let's try `GET /students?registerNumber=...` or similar?
            // Or just generic search endpoint if one exists.
            // Checking `StudentsController.findAll`... it calls `findAll`.
            // Let's use `GET /students` and filter client side if needed (not efficient but okay for prototype) 
            // OR better, rely on a specific search endpoint.
            // Let's try `GET /students/register/${manualInput}` (if not exists, I'll add it).
            // Actually `verify-scores.js` used: `GET /students` and filtered.
            // I'll do the same for now to stay safe.
            const res = await axios.get(`${API_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const found = res.data.find((s: Student) =>
                s.registerNumber.toLowerCase() === manualInput.toLowerCase() ||
                s.name.toLowerCase().includes(manualInput.toLowerCase())
            );
            if (found) setStudent(found);
            else setError("Student not found.");
        } catch (err: unknown) {
            console.error("Search failed", err);
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitViolation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student || !selectedViolation) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/violations/record`, {
                studentId: student.id,
                violationTypeId: selectedViolation,
                comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmitted(true);
            // Reset after 2 seconds
            setTimeout(() => {
                setSubmitted(false);
                setStudent(null);
                setComments("");
                setSelectedViolation("");
                if (activeTab === 'scan') setScannedCode("");
            }, 2000);
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            alert(errorObj.response?.data?.message || "Failed to record violation");
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4 text-center">Record Violation</h1>

            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={`flex-1 py-2 text-center ${activeTab === "scan" ? "border-b-2 border-blue-600 font-bold" : "text-gray-500"}`}
                    onClick={() => setActiveTab("scan")}
                >
                    Scan QR
                </button>
                <button
                    className={`flex-1 py-2 text-center ${activeTab === "manual" ? "border-b-2 border-blue-600 font-bold" : "text-gray-500"}`}
                    onClick={() => setActiveTab("manual")}
                >
                    Manual Search
                </button>
            </div>

            {/* Scanner / Search */}
            <div className="bg-white p-4 rounded shadow mb-6">
                {!student ? (
                    <>
                        {activeTab === "scan" && (
                            <div className="text-center">
                                <QrScanner onScan={handleScan} />
                                <p className="text-sm text-gray-500 mt-2">Point camera at Growth Card QR</p>
                            </div>
                        )}
                        {activeTab === "manual" && (
                            <form onSubmit={handleManualSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded"
                                    placeholder="Enter Register Number or Name"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 rounded">
                                    Search
                                </button>
                            </form>
                        )}
                        {loading && <p className="text-center mt-4">Searching...</p>}
                        {error && <p className="text-center mt-4 text-red-600 font-medium">{error}</p>}
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-gray-500">
                            {student.name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold">{student.name}</h3>
                        <p className="text-gray-600">{student.registerNumber}</p>
                        <p className="text-sm text-gray-500">{student.department}</p>
                        <button
                            onClick={() => setStudent(null)}
                            className="mt-3 text-sm text-blue-600 underline"
                        >
                            Wrong student? Scan again
                        </button>
                    </div>
                )}
            </div>

            {/* Violation Form */}
            {student && !submitted && (
                <form onSubmit={handleSubmitViolation} className="bg-white p-4 rounded shadow border border-red-100">
                    <h3 className="font-semibold mb-3 text-red-700">Add Violation Details</h3>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Violation Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedViolation}
                            onChange={e => setSelectedViolation(e.target.value)}
                            required
                        >
                            <option value="">-- Select Type --</option>
                            {violationTypes.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.name} (Severity: {v.severity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Comments (Optional)</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={3}
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            placeholder="e.g. Disrespectful behavior..."
                        />
                    </div>

                    <button type="submit" className="w-full bg-red-600 text-white py-3 rounded font-bold text-lg hover:bg-red-700">
                        RECORD VIOLATION
                    </button>
                </form>
            )}

            {submitted && (
                <div className="bg-green-100 p-6 rounded text-center text-green-800 animate-pulse">
                    <h2 className="text-2xl font-bold mb-2">Recorded!</h2>
                    <p>Violation has been logged successfully.</p>
                </div>
            )}
        </div>
    );
}
