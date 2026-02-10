"use client";

import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { WIDGET_REGISTRY, WidgetConfig } from "@/components/widgets/registry";
import { Plus, Save, Trash } from "lucide-react";

export default function DashboardBuilder() {
    const [name, setName] = useState("");
    const [role, setRole] = useState("TUTOR");
    const [layout, setLayout] = useState<WidgetConfig[]>([]);
    const [saving, setSaving] = useState(false);

    const addWidget = (type: string) => {
        const newWidget: WidgetConfig = {
            id: `widget-${Date.now()}`,
            type,
            x: 0,
            y: 0,
            w: 1, // Default width (col-span-1)
            h: 1
        };
        setLayout([...layout, newWidget]);
    };

    const removeWidget = (id: string) => {
        setLayout(layout.filter(w => w.id !== id));
    };

    const saveDashboard = async () => {
        if (!name) return alert("Please enter a dashboard name");
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/dashboards`, {
                name,
                role,
                layout
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Dashboard created successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save dashboard.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Create New Dashboard</h1>
                <button
                    onClick={saveDashboard}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Dashboard'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-700">Settings</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Dashboard Name</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                placeholder="e.g. Tutor Overview"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Target Role</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option value="TUTOR">Tutor</option>
                                <option value="HOD">HOD</option>
                                <option value="MANAGER">Manager</option>
                                <option value="STUDENT">Student</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-700">Available Widgets</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(WIDGET_REGISTRY).map(([type, def]) => (
                                <button
                                    key={type}
                                    onClick={() => addWidget(type)}
                                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 text-left"
                                >
                                    <span className="text-sm font-medium text-gray-700">{def.label}</span>
                                    <Plus size={16} className="text-blue-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-gray-700">Layout Preview</h3>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                        {layout.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Select widgets to add to the dashboard.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {layout.map((widget) => {
                                    const def = WIDGET_REGISTRY[widget.type];
                                    return (
                                        <div key={widget.id} className="relative group border border-dashed border-gray-300 p-2 rounded hover:border-blue-500">
                                            <div className="absolute -top-2 -right-2 hidden group-hover:flex">
                                                <button onClick={() => removeWidget(widget.id)} className="bg-red-500 text-white p-1 rounded-full">
                                                    <Trash size={12} />
                                                </button>
                                            </div>
                                            <div className="pointer-events-none opacity-50">
                                                {/* Mock render for preview */}
                                                <div className="text-xs text-center p-4 bg-gray-50 rounded">
                                                    {def?.label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
