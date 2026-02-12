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

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-50">
      {/* 1. Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* 2. Abstract Gradient Blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 40, 10, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, -30, -10, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-400/20 rounded-full mix-blend-multiply filter blur-[100px]"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 3. Noise Overlay for Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
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
    <div className="min-h-screen flex items-center justify-center bg-[#008F8C]/10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#008F8C]/30 border-t-[#008F8C] rounded-full animate-spin"></div>
        <p className="text-[#008F8C] font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-500">Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans text-slate-800 selection:bg-[#008F8C]/20 selection:text-[#008F8C] relative">
      <AnimatedBackground />

      {/* --- Sticky Glass Header --- */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/40 border-b border-white/40 shadow-sm supports-[backdrop-filter]:bg-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008F8C] rounded-lg flex items-center justify-center text-white shadow-[#008F8C]/30 shadow-lg">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Rathinam <span className="text-[#008F8C]">GrowthCard</span></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open('/student/report', '_blank')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#008F8C] hover:bg-[#008F8C]/10 rounded-full transition-colors"
            >
              <Printer size={16} />
              <span>Report</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 space-y-8">

        {/* --- Hero Section (ID Card Style) --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card (Deep Glass) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              y: -4,
              borderColor: "#008F8C",
              boxShadow: "0 20px 40px -10px rgba(0, 143, 140, 0.3), 0 0 20px 0px rgba(0, 143, 140, 0.1)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="md:col-span-2 bg-white/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group"
          >
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative cursor-pointer" onClick={handlePhotoClick}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-white ring-1 ring-slate-100 relative group/img">
                <Image
                  src={
                    data.student.profilePhoto
                      ? (data.student.profilePhoto.startsWith('/uploads') || data.student.profilePhoto.startsWith('/static')
                        ? `${API_URL}${data.student.profilePhoto}`
                        : data.student.profilePhoto)
                      : `https://api.dicebear.com/7.x/initials/svg?seed=${data.student.name}`
                  }
                  alt="Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  unoptimized
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white drop-shadow-md" size={24} />
                </div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3 pt-1">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{data.student.name}</h1>
                <p className="text-slate-500 font-medium">{data.student.registerNumber} • {data.student.department}</p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <div className="px-3 py-1 bg-[#008F8C]/10 text-[#008F8C] rounded-full text-xs font-bold border border-[#008F8C]/20 shadow-sm flex items-center gap-1.5 break-all">
                  <Mail size={14} className="shrink-0" />
                  {data.student.email}
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100 shadow-sm flex items-center gap-1.5">
                  <User size={14} />
                  Student
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 pt-2 relative z-10">
                {[1, 2, 3, 4, 5].map(star => (
                  <div key={star} className="relative transform transition-transform hover:scale-110 duration-200">
                    <Star
                      size={48}
                      className={
                        star <= data.student.starRating
                          ? "fill-amber-400 text-amber-500 drop-shadow-[0_6px_8px_rgba(245,158,11,0.4)]"
                          : "fill-slate-100 text-slate-200"
                      }
                      strokeWidth={1.5}
                    />
                  </div>
                ))}
                <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">Rating</span>
              </div>
            </div>
          </motion.div>

          {/* CRS Score Card (Themed Circular - Glass) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{
              y: -4,
              borderColor: "#008F8C",
              boxShadow: "0 20px 40px -10px rgba(0, 143, 140, 0.3), 0 0 20px 0px rgba(0, 143, 140, 0.1)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            className="rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="relative z-10 flex flex-col items-center justify-between h-full py-2">

              {/* Main Circle Container */}
              <div className="relative w-64 h-64 flex items-center justify-center">

                {/* 1. Vibrant Background Glows */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-blue-400/30 blur-3xl mix-blend-multiply"
                />
                <motion.div
                  animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-indigo-400/30 blur-3xl mix-blend-multiply"
                />

                {/* 2. Rotating Outer Ring (Vibrant Gradient Border) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-4px] rounded-full border-[3px] border-transparent border-t-blue-600 border-r-indigo-600/50"
                  style={{ filter: "drop-shadow(0 0 4px rgba(37, 99, 235, 0.3))" }}
                />

                {/* 3. Counter-Rotating Inner Ring (Cyan/Indigo) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-3 rounded-full border-[2px] border-dashed border-slate-400/60"
                />

                {/* 4. Main SVG Circle */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl relative z-10" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="vibrantCrsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" /> {/* Blue 600 */}
                      <stop offset="50%" stopColor="#4338ca" /> {/* Indigo 700 */}
                      <stop offset="100%" stopColor="#1e293b" /> {/* Slate 800 */}
                    </linearGradient>
                  </defs>

                  {/* Track */}
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" />

                  {/* Progress */}
                  <motion.circle
                    cx="50" cy="50" r="40"
                    stroke="url(#vibrantCrsGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="251"
                    initial={{ strokeDashoffset: 251 }}
                    animate={{ strokeDashoffset: 251 - (251 * (data.student.currentCrs / 100)) }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                  />
                </svg>

                {/* 5. Center Text (Solid Vibrant Color for Visibility) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className="flex items-baseline text-indigo-900">
                    <span className="text-5xl font-black tracking-tighter drop-shadow-sm filter">
                      <AnimatedCounter value={data.student.currentCrs} />
                    </span>
                    <sup className="text-3xl font-bold ml-1 text-indigo-900">%</sup>
                  </div>
                </div>
              </div>

              {/* Large CRS Label (Replaces Excellent Performance) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4"
              >
                <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 drop-shadow-sm">
                  CRS
                </h1>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* --- Stats Grid & Graph --- */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Stats Breakdowns */}
          <div className="lg:col-span-3 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="text-[#008F8C]" size={24} />
                Performance Breakdown
              </h2>
              {data.deductions.total > 0 && (
                <div className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={14} />
                  -{data.deductions.total} pts deduction applies
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

          {/* Right Column: Growth Graph Side Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{
                y: -4,
                borderColor: "#008F8C",
                boxShadow: "0 20px 40px -10px rgba(0, 143, 140, 0.3), 0 0 20px 0px rgba(0, 143, 140, 0.1)",
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 h-full flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#008F8C]/10 text-[#008F8C] rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">Growth Trend</h3>
                  <p className="text-xs text-slate-500">Last {data.growthHistory.length} checkpoints</p>
                </div>
              </div>

              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.growthHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCrsMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeOpacity: 0.2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="crs"
                      stroke="url(#crsGradient)" // Reusing gradient if possible, else solid color
                      strokeWidth={3}
                      fill="url(#colorCrsMobile)"
                    />
                    {/* Define local gradient for stroke if needed, or use solid */}
                    <defs>
                      <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="crs"
                      stroke="url(#chartStroke)"
                      strokeWidth={3}
                      fill="url(#colorCrsMobile)"
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

// --- Modern Card Component ---
function ModernParamCard({ param, index }: { param: MainParamReport, index: number }) {
  const getVariant = (p: number) => {
    if (p >= 80) return { color: "teal", text: "text-[#008F8C]", bg: "bg-[#008F8C]/10", stroke: "#008F8C" };
    if (p >= 50) return { color: "blue", text: "text-blue-700", bg: "bg-blue-50", stroke: "#2563eb" };
    return { color: "slate", text: "text-slate-700", bg: "bg-slate-50", stroke: "#475569" };
  };

  const variant = getVariant(param.percentage);

  const glowColor = variant.color === 'teal' ? 'rgba(0, 143, 140, 0.5)' :
    variant.color === 'blue' ? 'rgba(37, 99, 235, 0.5)' :
      'rgba(148, 163, 184, 0.5)';
  const hoverBorder = variant.color === 'teal' ? '#008F8C' :
    variant.color === 'blue' ? '#2563eb' :
      '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (index * 0.1) }}
      whileHover={{
        y: -5,
        borderColor: hoverBorder,
        boxShadow: `0 20px 40px -10px ${glowColor}, 0 0 15px 0px ${glowColor}`,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
    >
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-indigo-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="p-5 flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-8 rounded-full ${variant.bg.replace('50', '500')}`}></span>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-none">{param.name}</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weightage: {param.weightage}%</span>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  let starCount = 0;
                  if (param.percentage >= 90) starCount = 5;
                  else if (param.percentage >= 75) starCount = 4;
                  else if (param.percentage >= 60) starCount = 3;
                  else if (param.percentage >= 40) starCount = 2;
                  else if (param.percentage > 0) starCount = 1;

                  return (
                    <Star
                      key={star}
                      size={12}
                      className={star <= starCount ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-1 bg-[#0000ff]/10 rounded-lg text-xs font-bold flex items-center gap-1">
              <Zap size={10} className="text-[#0000ff]" fill="currentColor" />
              <span className="text-[#0000ff]">
                +{param.contribution} pts
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`blueGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0000ff" />
                <stop offset="100%" stopColor="#0000ff" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50" cy="50" r="45"
              stroke={`url(#blueGradient-${index})`}
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
            <span className="font-black text-sm text-[#0000ff]">
              {param.percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Expander / Details preview */}
      <div className="px-4 pb-4">
        <div className="space-y-1.5 pt-3 border-t border-slate-50">
          {param.subParameters.map((sub) => (
            <motion.div
              key={sub.id}
              whileHover={{
                scale: 1.02,
                x: 4,
                backgroundColor: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                zIndex: 10,
                borderColor: "rgba(99, 102, 241, 0.3)"
              }}
              className="flex justify-between items-center text-xs p-2 rounded-lg border border-transparent transition-all cursor-default"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sub.score > 0 ? "bg-indigo-500" : "bg-slate-300"}`} />
                <span className={`font-medium truncate ${sub.score > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{sub.name}</span>
              </div>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${sub.score > 0 ? 'bg-[#0000ff]/10 text-[#0000ff] font-bold' : 'bg-slate-50 text-slate-400'}`}>
                {sub.score}/{sub.maxScore}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
