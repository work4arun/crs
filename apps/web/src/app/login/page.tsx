"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/config";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { access_token } = response.data;
            // In a real app, you'd fetch the user details here or decode the token
            // For now, we'll manually set a user object since the login response just gives a token
            // But ideally the login response should return user details too, or we fetch /profile immediately

            // Let's fetch profile to be sure
            const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            login(access_token, profileResponse.data);
            router.push("/dashboard");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.message || "Login failed");
            console.error(err); // Keep logging the error for debugging
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Left Side - Illustration/Branding */}
                <div className="hidden md:flex w-1/2 bg-indigo-900 text-white flex-col justify-center items-center p-12 relative">
                    <div className="absolute inset-0 bg-indigo-900 opacity-90 pattern-grid-lg"></div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-4">Rathinam Growth Card</h1>
                        <p className="text-indigo-200 text-lg">Empowering student success through comprehensive performance tracking.</p>
                        <div className="mt-8">
                            {/* Simple SVG Illustration Placeholder */}
                            <svg className="w-64 h-64 mx-auto text-indigo-400 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Please sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="name@rathinam.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <a href="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Need help? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Contact Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
