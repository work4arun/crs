"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Loader2, Printer } from "lucide-react";
import Image from "next/image";

// --- Types (Reused) ---
interface SubParamScore {
    id: string;
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    date: string | null;
}

interface MainParamReport {
    id: string;
    name: string;
    weightage: number;
    percentage: number;
    contribution: number;
    subParameters: SubParamScore[];
}

interface DashboardData {
    student: {
        id: string;
        name: string;
        registerNumber: string;
        department: string;
        email: string;
        currentCrs: number;
        starRating: number;
        qrCode: string;
        profilePhoto?: string;
    };
    report: MainParamReport[];
    deductions: {
        total: number;
        history: unknown[];
    };
    growthHistory: { date: string; crs: number }[];
}

export default function StudentReportPage() {
    const { token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const authToken = token || storedToken;
                if (!authToken) return;

                const res = await axios.get(`${API_URL}/students/me/dashboard`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [token]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    if (!data) return <div className="p-10 text-center text-red-500">Failed to load report.</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans print:p-0 p-8">
            {/* Print Controls (Hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-end print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Printer size={18} />
                    Print Report
                </button>
            </div>

            {/* A4 Container */}
            <div className="max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none shadow-xl print:shadow-none border print:border-none p-[10mm] min-h-[297mm] relative">

                {/* Header */}
                <header className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Rathinam Growth Card</h1>
                        <p className="text-slate-500 uppercase tracking-widest text-xs mt-1">Student Performance Report</p>
                    </div>
                    <div className="text-right">
                        <Image
                            src="https://rathinam.edu.in/wp-content/uploads/2019/10/Rathinam-Group-Institutions.png"
                            alt="Rathinam Logo"
                            width={200}
                            height={48}
                            className="h-12 w-auto object-contain grayscale opacity-80"
                            unoptimized
                        />
                    </div>
                </header>

                {/* Student Profile Section */}
                <section className="flex items-start gap-8 mb-10">
                    <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <Image
                            src={data.student.profilePhoto ? data.student.profilePhoto : `https://api.dicebear.com/7.x/initials/svg?seed=${data.student.name}`}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Student Name</p>
                            <h2 className="text-xl font-bold text-slate-900">{data.student.name}</h2>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Register Number</p>
                            <p className="text-lg font-mono font-medium text-slate-700">{data.student.registerNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Department</p>
                            <p className="text-base font-medium text-slate-700">{data.student.department}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
                            <p className="text-sm text-slate-600">{data.student.email}</p>
                        </div>
                    </div>

                    {/* CRS Big Score */}
                    <div className="w-40 text-center border-l border-slate-200 pl-8">
                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Current CRS</p>
                        <div className="text-5xl font-black text-slate-900 tracking-tighter">
                            {data.student.currentCrs.toFixed(0)}
                        </div>
                        <div className="flex justify-center mt-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= data.student.starRating ? "#0f172a" : "#e2e8f0"} className="text-slate-900">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Violations Warning (if any) */}
                {data.deductions.total > 0 && (
                    <div className="mb-8 p-3 border border-red-200 bg-red-50 rounded text-red-700 text-sm flex justify-between items-center">
                        <span><strong>Notice:</strong> Violations detected.</span>
                        <span className="font-bold">-{data.deductions.total} Points Deduced</span>
                    </div>
                )}

                {/* Breakdown Table */}
                <section>
                    <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-2 mb-4">Performance Breakdown</h3>

                    <div className="space-y-6">
                        {data.report.map((param) => (
                            <div key={param.id} className="break-inside-avoid">
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                        {param.name}
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 tracking-normal">Weight: {param.weightage}%</span>
                                    </h4>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-slate-900">{param.percentage.toFixed(0)}%</span>
                                        <span className="text-xs text-slate-500 ml-2">(+{param.contribution} CRS)</span>
                                    </div>
                                </div>

                                {/* Progress Bar (Static for print) */}
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3 print:border print:border-slate-200">
                                    <div
                                        className="h-full bg-slate-800 print:bg-slate-800"
                                        style={{ width: `${param.percentage}%` }}
                                    ></div>
                                </div>

                                {/* Sub Params Grid */}
                                {param.subParameters.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-1">
                                        {param.subParameters.map(sub => (
                                            <div key={sub.id} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                                                <span className="text-slate-600 truncate pr-2">{sub.name}</span>
                                                <span className="font-mono font-medium text-slate-900">
                                                    {sub.score} <span className="text-slate-400">/ {sub.maxScore}</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic pl-1">No activity recorded.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="absolute bottom-[10mm] left-[10mm] right-[10mm] flex justify-between items-end text-xs text-slate-400 mt-12 pt-4 border-t border-slate-100">
                    <div>
                        <p>Generated via Rathinam Growth Card System</p>
                        <p>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="h-10 border-b border-slate-300 w-32 mb-1"></div>
                        <p>Authorized Signature</p>
                    </div>
                </footer>

            </div>

            <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white;
            color: black;
          }
          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
        </div>
    );
}
