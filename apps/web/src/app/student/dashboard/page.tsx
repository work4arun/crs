"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import {
  LogOut, Star, Camera, Trophy, AlertTriangle, TrendingUp, Printer,
  LayoutDashboard, User, ChevronDown, Sparkles, GraduationCap, Zap, Mail
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

// --- Types ---
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
  starRating?: number;
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

// --- Components ---

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}



// --- Main Dashboard Component ---
export default function StudentDashboard() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/students/me/dashboard`, {
        headers: { Authorization: `Bearer ${token || storedToken}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please upload an image under 5MB.");
      return;
    }

    const storedToken = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/students/me/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token || storedToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchDashboard();
      alert("Profile photo updated successfully!");
    } catch (err: unknown) {
      console.error("Upload failed", err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || "Upload failed. Please try again.";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#4285F4] border-r-[#EA4335] border-b-[#FBBC04] border-l-[#34A853] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-500">Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#202124] selection:bg-[#4285F4]/20 selection:text-[#4285F4] relative">
      <AnimatedBackground />

      {/* --- White Google Header --- */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
              <span className="font-bold text-xl">
                <span className="text-[#4285F4]">G</span>
              </span>
            </div>
            <span className="font-medium text-lg tracking-tight text-slate-600">GrowthCard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('/student/report', '_blank')}
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-[#1a73e8] hover:bg-slate-50 rounded-full transition-colors border border-transparent hover:border-slate-200"
            >
              <Printer size={16} />
              <span>Report</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10 space-y-8">

        {/* --- Hero Section (Layout Preserved) --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              y: -4,
              borderColor: "#4285F4",
              boxShadow: "0 10px 40px -10px rgba(66, 133, 244, 0.2)",
              transition: { duration: 0.3 }
            }}
            className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden group shadow-[0_4px_20px_rgb(0,0,0,0.08)]"
          >
            {/* Subtle Google Corner Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#4285F4]/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative cursor-pointer" onClick={handlePhotoClick}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="w-36 h-36 rounded-full overflow-hidden shadow-sm border-[4px] border-white ring-1 ring-slate-100 relative group/img">
                <Image
                  src={data.student.profilePhoto
                    ? (data.student.profilePhoto.startsWith('http') ? data.student.profilePhoto : `${API_URL}${data.student.profilePhoto}`)
                    : `https://api.dicebear.com/7.x/initials/svg?seed=${data.student.name}`}
                  alt="Profile"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white drop-shadow-md" size={24} />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 pt-2">
              <div>
                <h1 className="text-3xl font-medium text-[#202124] tracking-tight">{data.student.name}</h1>
                <p className="text-[#5f6368] text-sm">{data.student.registerNumber} • {data.student.department}</p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100 flex items-center gap-1.5">
                  <Mail size={14} className="shrink-0" />
                  {data.student.email}
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 pt-3 relative z-10">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.div
                    key={star}
                    animate={star <= data.student.starRating ? { scale: [1, 1.1, 1], filter: ["drop-shadow(0 0 2px #FBBC04)", "drop-shadow(0 0 8px #FBBC04)", "drop-shadow(0 0 2px #FBBC04)"] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: star * 0.1 }}
                  >
                    <Star
                      size={32}
                      className={
                        star <= data.student.starRating
                          ? "fill-[#FBBC04] text-[#FBBC04]"
                          : "fill-slate-100 text-slate-100"
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CRS Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{
              y: -4,
              borderColor: "#34A853",
              boxShadow: "0 10px 40px -10px rgba(52, 168, 83, 0.2)",
              transition: { duration: 0.3 }
            }}
            className="rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.08)]"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* --- Container: Enforce Square Aspect Ratio --- */}
            <div className="relative w-full aspect-square max-w-[260px] flex items-center justify-center select-none">

              {/* --- 0. Background Glow Pulse --- */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100/40 to-green-100/40 blur-2xl transform"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* --- 1. Outer Decorative Ring (Thin, Dashed, Slow Rotation) -> Darker & Larger --- */}
              <motion.svg
                className="absolute inset-0 w-full h-full opacity-60"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="50" cy="50" r="49" fill="none" stroke="#5f6368" strokeWidth="0.8" strokeDasharray="4 4" />
              </motion.svg>

              {/* --- 2. Middle Progress Ring (SVG) -> Adjusted Inset --- */}
              <div className="absolute inset-[4%] w-[92%] h-[92%]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="crsProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4285F4" />
                      <stop offset="50%" stopColor="#8AB4F8" />
                      <stop offset="100%" stopColor="#34A853" />
                    </linearGradient>
                  </defs>

                  {/* Background Track */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f3f4" strokeWidth="5" strokeLinecap="round" />

                  {/* Animated Progress Arc */}
                  <motion.circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="url(#crsProgressGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="276" // 2 * PI * 44 ~= 276.46
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 276 - (276 * (data.student.currentCrs / 100)) }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                    className="drop-shadow-[0_0_4px_rgba(66,133,244,0.4)]"
                  />
                </svg>
              </div>

              {/* --- 3. Inner Rotating Arc (Techy, Faster) -> Adjusted Inset --- */}
              <motion.div
                className="absolute inset-[15%] rounded-full border border-transparent border-t-blue-400/60 border-l-blue-400/60"
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              {/* --- 4. Particle Orbit (Small dot revolving) --- */}
              <motion.div
                className="absolute inset-[6%]"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#34A853] absolute top-[-2%] left-1/2 transform -translate-x-1/2"></div>
              </motion.div>

              {/* --- 5. Center Content --- */}
              <div className="absolute flex flex-col items-center justify-center z-10 w-full h-full pb-2">
                <div className="flex flex-col items-center justify-center">
                  {/* Value with Superscript % */}
                  <div className="flex items-start">
                    <span className="text-[3.5rem] font-bold text-[#202124] tracking-tighter tabular-nums leading-none">
                      <AnimatedCounter value={data.student.currentCrs} />
                    </span>
                    <span className="text-xl font-bold text-[#5f6368] mt-2 ml-1">%</span>
                  </div>

                  {/* Divider */}
                  <div className="h-0.5 w-8 bg-slate-200 rounded-full my-3"></div>

                  {/* Label: CRS (Bold, Strong) */}
                  <span className="text-xl font-black text-[#202124] tracking-widest uppercase mb-3">CRS</span>

                  {/* Bottom Progress Bar (Visual Only) */}
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.student.currentCrs}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- Stats Grid & Graph --- */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Stats Breakdowns */}
          <div className="lg:col-span-3 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#202124] flex items-center gap-2">
                <LayoutDashboard className="text-[#5f6368]" size={20} />
                Detailed Metrics
              </h2>
              {data.deductions.total > 0 && (
                <div className="px-3 py-1 bg-[#FCE8E6] text-[#C5221F] rounded-full text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={14} />
                  -{data.deductions.total} Deductions
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.report.map((param, index) => (
                <ModernParamCard key={param.id} param={param} index={index} />
              ))}
            </div>
          </div>

          {/* Right Column: Growth Graph */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{
                y: -4,
                borderColor: "#4285F4",
                boxShadow: "0 10px 40px -10px rgba(66, 133, 244, 0.2)",
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-3xl border border-slate-200 p-6 h-full flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#E8F0FE] text-[#1967D2] rounded-full">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-[#202124]">Growth</h3>
                  <p className="text-xs text-[#5f6368]">Trend Analysis</p>
                </div>
              </div>

              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.growthHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="googleBlueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4285F4" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#4285F4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#5f6368' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #dadce0', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#4285F4', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="crs"
                      stroke="#4285F4"
                      strokeWidth={3}
                      fill="url(#googleBlueFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#FAFAFA]">
      {/* 0. Slow Color Shift Base */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "linear-gradient(to bottom right, #E8F0FE, #FFFFFF, #FFFFFF)",
            "linear-gradient(to bottom right, #FFFFFF, #FCE8E6, #FFFFFF)",
            "linear-gradient(to bottom right, #FFFFFF, #FFFFFF, #E6F4EA)",
            "linear-gradient(to bottom right, #FEF7E0, #FFFFFF, #FFFFFF)",
            "linear-gradient(to bottom right, #E8F0FE, #FFFFFF, #FFFFFF)"
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* 2. Abstract Gradient Blobs (Milder & Slower) */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-[120px]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 40, 10, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-[120px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, -30, -10, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-teal-400/10 rounded-full mix-blend-multiply filter blur-[120px]"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 3. Noise Overlay for Texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
}

// --- Modern Card Component (Google White Edition) ---
function ModernParamCard({ param, index }: { param: MainParamReport, index: number }) {
  // Map score to Google Brand Colors
  const getTheme = (p: number) => {
    if (p >= 80) return { color: "#34A853", light: "#E6F4EA", shadow: "rgba(52, 168, 83, 0.4)" }; // Green
    if (p >= 50) return { color: "#4285F4", light: "#E8F0FE", shadow: "rgba(66, 133, 244, 0.4)" }; // Blue
    if (p >= 30) return { color: "#FBBC04", light: "#FEF7E0", shadow: "rgba(251, 188, 4, 0.4)" }; // Yellow
    return { color: "#EA4335", light: "#FCE8E6", shadow: "rgba(234, 67, 53, 0.4)" }; // Red
  };

  const theme = getTheme(param.percentage);

  // Calculate star rating (1-5) based on percentage
  const starRating = Math.max(1, Math.min(5, Math.ceil(param.percentage / 20)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (index * 0.1) }}
      whileHover={{
        y: -4,
        borderColor: theme.color,
        boxShadow: `0 10px 30px -5px ${theme.shadow}, 0 0 10px 0px ${theme.shadow}`,
        transition: { duration: 0.3 }
      }}
      className="group bg-white rounded-2xl border border-slate-200 transition-all duration-300 relative overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.08)]"
    >
      <div className="p-5 flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: theme.color }}></span>
            <div>
              <h3 className="font-medium text-[#202124] text-lg leading-none">{param.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#5f6368] font-bold uppercase tracking-wider">Weightage: {param.weightage}%</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-[#5f6368]">
                  +{param.contribution} pts
                </span>
              </div>
              {/* Added Star Rating to Param Cards */}
              <div className="flex gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= starRating ? "fill-[#FBBC04] text-[#FBBC04]" : "fill-slate-200 text-slate-200"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Circular Progress (Google Colors) */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#f1f3f4" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50" cy="50" r="45"
              stroke={theme.color}
              strokeWidth="8"
              fill="none"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * (param.percentage / 100)) }}
              transition={{ duration: 1.5, delay: 0.5 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-sm text-[#202124]">
              {param.percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sub Parameters */}
      <div className="px-5 pb-5">
        <div className="space-y-2 pt-3 border-t border-slate-100">
          {param.subParameters.map((sub) => (
            <div key={sub.id} className="flex justify-between items-center text-xs">
              <span className="text-[#5f6368] truncate">{sub.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#202124]">{sub.score}/{sub.maxScore}</span>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: sub.score > 0 ? theme.color : '#dadce0' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
