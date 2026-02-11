"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Edit2, Key, Trash2 } from "lucide-react";

interface Student {
    id: string;
    name: string;
    registerNumber: string;
    department: string;
    section?: string;
    batch: string;
    email: string;
}

export function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    // Edit Modal State
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editForm, setEditForm] = useState<Partial<Student>>({});

    // Password Modal State
    const [passwordStudent, setPasswordStudent] = useState<Student | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // Delete Modal State
    // const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

    const fetchStudents = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/students`, {
                headers: { Authorization: `Bearer ${token || storedToken}` },
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleEditClick = (student: Student) => {
        setEditingStudent(student);
        setEditForm(student);
    };

    const handleEditSave = async () => {
        if (!editingStudent) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.patch(`${API_URL}/students/${editingStudent.id}`, editForm, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...editForm } as Student : s));
            setEditingStudent(null);
        } catch {
            alert("Failed to update student");
        }
    };

    const handleDelete = async (student: Student) => {
        if (!confirm(`Are you sure you want to delete ${student.name} (${student.registerNumber})? This action cannot be undone.`)) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.delete(`${API_URL}/students/${student.id}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setStudents(students.filter(s => s.id !== student.id));
        } catch (error) {
            console.error("Failed to delete student", error);
            alert("Failed to delete student");
        }
    };

    const handlePasswordSave = async () => {
        if (!passwordStudent) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.post(`${API_URL}/students/${passwordStudent.id}/reset-password`,
                { password: newPassword },
                { headers: { Authorization: `Bearer ${token || storedToken}` } }
            );
            alert(`Password updated for ${passwordStudent.name}`);
            setPasswordStudent(null);
            setNewPassword("");
        } catch {
            alert("Failed to reset password");
        }
    };

    if (loading) return <div>Loading students...</div>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Student List</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Name</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Reg No</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Department</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Section</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Batch</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-medium text-slate-800">{student.name}</td>
                                <td className="p-4 text-slate-600 font-mono text-sm">{student.registerNumber}</td>
                                <td className="p-4 text-slate-600">{student.department}</td>
                                <td className="p-4 text-slate-600">{student.section || "-"}</td>
                                <td className="p-4 text-slate-600">{student.batch}</td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(student)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                        title="Edit Profile"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setPasswordStudent(student)}
                                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                                        title="Set Password"
                                    >
                                        <Key size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(student)}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                        title="Delete Student"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Student</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input
                                    className="w-full rounded-lg border-slate-300"
                                    value={editForm.name || ""}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Register Number</label>
                                <input
                                    className="w-full rounded-lg border-slate-300"
                                    value={editForm.registerNumber || ""}
                                    onChange={e => setEditForm({ ...editForm, registerNumber: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                    <input
                                        className="w-full rounded-lg border-slate-300"
                                        value={editForm.department || ""}
                                        onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Section</label>
                                    <input
                                        className="w-full rounded-lg border-slate-300"
                                        value={editForm.section || ""}
                                        onChange={e => setEditForm({ ...editForm, section: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Batch</label>
                                <input
                                    className="w-full rounded-lg border-slate-300"
                                    value={editForm.batch || ""}
                                    onChange={e => setEditForm({ ...editForm, batch: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-6">
                            <button onClick={() => setEditingStudent(null)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleEditSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {passwordStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Reset Password</h3>
                        <p className="text-slate-500 mb-4 text-sm">Set a new password for <span className="font-bold text-slate-800">{passwordStudent.name}</span>.</p>
                        <input
                            type="password"
                            className="w-full rounded-lg border-slate-300 mb-4"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setPasswordStudent(null)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Cancel</button>
                            <button onClick={handlePasswordSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold">Update Password</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
