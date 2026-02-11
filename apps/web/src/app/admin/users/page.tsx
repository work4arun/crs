"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Trash2, UserPlus, Key } from "lucide-react";

export default function UserManagementPage() {
    const { token } = useAuth();
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Password Modal State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [passwordUser, setPasswordUser] = useState<any | null>(null);
    const [newPassword, setNewPassword] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "MANAGER",
        department: "",
        section: ""
    });

    const roles = ["MANAGER", "HOD", "TUTOR", "SUPER_ADMIN", "ADMIN"];
    const departments = ["CSE", "ECE", "MECH", "IT", "BME", "RA"];
    const sections = ["A", "B", "C", "D"];

    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err: unknown) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchUsers(); // eslint-disable-line
    }, [fetchUsers]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${API_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setUsers(users.filter(u => u.id !== id));
        } catch {
            alert("Failed to delete user");
        }
    };

    const handlePasswordSave = async () => {
        if (!passwordUser) return;
        try {
            const storedToken = localStorage.getItem('token');
            await axios.patch(`${API_URL}/users/${passwordUser.id}/password`,
                { password: newPassword },
                { headers: { Authorization: `Bearer ${token || storedToken}` } }
            );
            alert(`Password updated for ${passwordUser.email}`);
            setPasswordUser(null);
            setNewPassword("");
        } catch {
            alert("Failed to reset password");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/users`, formData, {
                headers: { Authorization: `Bearer ${token || storedToken}` }
            });
            setUsers([res.data, ...users]);
            setShowModal(false);
            setFormData({ email: "", password: "", role: "MANAGER", department: "", section: "" });
        } catch {
            alert("Failed to create user");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Management</h2>
                    <p className="text-slate-500 mt-1">Manage system access for Managers, HODs, and Tutors.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                    <UserPlus size={18} />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Email</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Role</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase">Access Scope</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-medium text-slate-800">{user.email}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        user.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            user.role === 'HOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                user.role === 'ADMIN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">
                                    {(user.role === 'HOD' || user.role === 'TUTOR') ? (
                                        <div className="flex gap-2">
                                            {user.department && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{user.department}</span>}
                                            {user.section && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{user.section}</span>}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => setPasswordUser(user)}
                                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                                        title="Reset Password"
                                    >
                                        <Key size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Password Modal */}
            {passwordUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Reset Password</h3>
                        <p className="text-sm text-slate-500 mb-4">Set a new password for <span className="font-mono text-slate-700">{passwordUser.email}</span>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    autoFocus
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="New secure password"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setPasswordUser(null); setNewPassword(""); }}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePasswordSave}
                                    disabled={!newPassword}
                                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Create New User</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="user@rathinam.in"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                <select
                                    className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
