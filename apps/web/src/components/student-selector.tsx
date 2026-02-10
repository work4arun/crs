"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config";

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

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Student
            </label>
            <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter Name or Register Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
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
        </div>
    );
}
