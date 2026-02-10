"use client";

import { useAuth } from "@/context/auth-context";
import { withAuth } from "@/components/with-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log("DashboardPage: Checking user...", user);
        if (user) {
            console.log("DashboardPage: User roles:", user.roles);
            if (user.roles.includes("SUPER_ADMIN")) {
                console.log("Redirecting to Admin...");
                router.replace("/admin/dashboard");
            } else if (user.roles.includes("STUDENT")) {
                console.log("Redirecting to Student...");
                router.replace("/student/dashboard");
            } else if (user.roles.includes("MANAGER") || user.roles.includes("HOD") || user.roles.includes("TUTOR")) {
                console.log("Redirecting to Manager...");
                router.replace("/manager/entry");
            } else {
                console.warn("User has no matching roles for redirect.");
            }
        }
    }, [user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Redirecting to your dashboard...</h2>
                <button
                    onClick={logout}
                    className="mt-8 text-sm text-red-500 hover:underline"
                >
                    Cancel / Logout
                </button>
            </div>
        </div>
    );
}

export default withAuth(DashboardPage);
