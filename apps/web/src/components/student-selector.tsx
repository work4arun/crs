"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { QrScanner } from "./qr-scanner";

interface Student {
    id: string;
    name: string;
    registerNumber: string;
    department: string;
}

interface StudentSelectorProps {
    onSelect: (student: Student) => void;
}

export function StudentSelector({ onSelect }: StudentSelectorProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (!search) {
            setFiltered([]);
            return;
        }
        const lower = search.toLowerCase();
        const results = students.filter(
            (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.registerNumber.toLowerCase().includes(lower)
        );
        setFiltered(results.slice(0, 5)); // Limit to 5 results
    }, [search, students]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const [showScanner, setShowScanner] = useState(false);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Student
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        className="w-full p-2 border rounded pr-10"
                        placeholder="Enter Name or Register Number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>

                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-md"
                    title="Scan QR/Barcode"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                    <span className="hidden sm:inline">Scan</span>
                </button>
            </div>

            {loading && <p className="text-xs text-gray-500 mt-1">Loading students...</p>}

            {filtered.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg max-h-60 overflow-auto">
                    {filtered.map((student) => (
                        <li
                            key={student.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => {
                                onSelect(student);
                                setSearch(`${student.name} (${student.registerNumber})`);
                                setFiltered([]);
                            }}
                        >
                            <div className="font-semibold">{student.name}</div>
                            <div className="text-xs text-gray-500">
                                {student.registerNumber} - {student.department}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* QR Scanner Modal */}
            {showScanner && (
                <QrScanner
                    onScan={(decodedText) => {
                        setShowScanner(false);
                        setSearch(decodedText);
                        // Trigger filter immediately if possible, or effects will catch it
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
