"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    AlertTriangle,
    FileBarChart,
    ShieldAlert,
    Menu,
    X,
    LogOut,
    GraduationCap
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const allMenuItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "HOD"] },
        { name: "User Management", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN"] },
        { name: "Student Profiles", href: "/admin/students", icon: GraduationCap, roles: ["SUPER_ADMIN", "MANAGER", "HOD", "TUTOR"] },
        { name: "Parameters", href: "/admin/parameters", icon: Settings, roles: ["SUPER_ADMIN"] },
        { name: "Violations Config", href: "/admin/violations", icon: ShieldAlert, roles: ["SUPER_ADMIN", "HOD"] },
        { name: "Dashboard Builder", href: "/admin/dashboards/builder", icon: FileBarChart, roles: ["SUPER_ADMIN"] },
        { name: "Audit Logs", href: "/admin/audit", icon: AlertTriangle, roles: ["SUPER_ADMIN"] },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!user?.roles) return false;
        return item.roles.some(r => user.roles.includes(r));
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-900 to-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:relative md:translate-x-0 shadow-xl`}
            >
                <div className="p-8 flex justify-between items-center border-b border-white/10">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black tracking-tight text-white">GROWTH CARD</h1>
                        <span className="text-xs text-indigo-300 uppercase tracking-widest font-semibold mt-1">Admin Console</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10"
                                    : "text-indigo-200 hover:bg-white/5 hover:text-white hover:translate-x-1"
                                    }`}
                            >
                                <item.icon size={22} className={isActive ? "text-indigo-300" : "text-indigo-400 group-hover:text-indigo-300"} />
                                <span className={`font-medium ${isActive ? "font-semibold" : ""}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white shadow-sm p-4 flex items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-semibold text-gray-800">Menu</span>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
