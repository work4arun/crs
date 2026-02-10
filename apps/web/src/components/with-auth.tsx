"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function ProtectedRoute(props: P) {
        const { isAuthenticated, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push("/login");
            }
        }, [isLoading, isAuthenticated, router]);

        if (isLoading) {
            return <div>Loading...</div>; // Or a spinner
        }

        if (!isAuthenticated) {
            return null;
        }

        return <Component {...props} />;
    };
}
