"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/config";
import { motion } from "framer-motion";
import { LucideLoader2, LucideLogIn, LucideMail, LucideLock } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            const { access_token } = response.data;

            // Fetch profile
            const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            login(access_token, profileResponse.data);
            router.push("/dashboard");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.message || "Login failed");
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
            },
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 overflow-hidden relative">
            {/* Animated Background Elements */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl"
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, 40, 10, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl"
                animate={{
                    x: [0, -40, 30, 0],
                    y: [0, -30, -10, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
                className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-pink-200/30 rounded-full mix-blend-multiply filter blur-3xl"
                animate={{
                    x: [0, 20, -20, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full max-w-5xl bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 z-10"
            >
                {/* Left Side - Hero Section */}
                <div className="hidden md:flex w-1/2 bg-indigo-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 z-0"
                    />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0 mask-image-gradient"></div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-5"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20 shadow-inner">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold mb-2 tracking-tight">Growth Card</h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 80 }}
                                transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                                className="h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                            />
                        </motion.div>
                    </div>

                    <div className="relative z-10">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="text-indigo-100 text-lg leading-relaxed font-light"
                        >
                            "Empowering institutions with real-time performance tracking and comprehensive student analytics."
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="relative z-10 text-xs text-indigo-300 uppercase tracking-widest"
                    >
                        © {new Date().getFullYear()} Rathinam Group
                    </motion.div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/40">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back!</h2>
                            <p className="text-gray-500 mt-2">Please enter your credentials to access the dashboard.</p>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-700 rounded-r-md text-sm shadow-sm"
                            >
                                <p className="flex items-center gap-2">
                                    <span className="font-bold">Error:</span> {error}
                                </p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <motion.div variants={itemVariants} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <LucideMail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm hover:border-gray-300"
                                        placeholder="name@rathinam.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="/auth/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wide">
                                        Forgot?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <LucideLock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm hover:border-gray-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <LucideLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <LucideLogIn className="ml-2 h-5 w-5 opacity-70" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-400">
                            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
