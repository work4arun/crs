"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import {
  LogOut, Star, Camera, Trophy, AlertTriangle, Rocket, TrendingUp, Printer
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

// --- Component: Animated Counter ---
// --- Component: Animated Counter ---
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));

  useEffect(() => {
    const controls = animate(count, value, { duration: 2.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

// --- Component: Rocket Animation ---
function RocketBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        initial={{ x: "-10vw", y: "110vh", rotate: 45, opacity: 0 }}
        animate={{
          x: "110vw",
          y: "-10vh",
          opacity: [0, 0.1, 0.1, 0] // Fade in/out, max opacity 0.1 (very subtle)
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
        className="absolute text-indigo-900/20"
      >
        <Rocket size={120} strokeWidth={1.5} />
        {/* Trail */}
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent blur-md"
        />
      </motion.div>
      {/* Smaller Rocket */}
      <motion.div
        initial={{ x: "-10vw", y: "80vh", rotate: 30, opacity: 0 }}
        animate={{
          x: "110vw",
          y: "-20vh",
          opacity: [0, 0.05, 0.05, 0]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
          delay: 10
        }}
        className="absolute text-indigo-400/10"
      >
        <Rocket size={60} strokeWidth={1} />
      </motion.div>
    </div>
  );
}

// --- Main Component ---
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
      // Refresh dashboard to get new photo URL
      await fetchDashboard();
      alert("Profile photo updated successfully!");
    } catch (err: unknown) {
      console.error("Upload failed", err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || "Upload failed. Please try again.";
      alert(msg);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-indigo-600">Loading Growth Card...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-slate-100">Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <RocketBackground />
      {/* --- 1. Header Card --- */}
      <div className="relative bg-indigo-600 pb-24 rounded-b-[2.5rem] shadow-2xl overflow-hidden z-10 transition-all duration-500 ease-in-out">
        {/* Reduced padding-bottom from 32 to 24, rounded-b reduced slightly */}

        {/* ... (existing header content) ... */}
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 pt-6 relative z-10">
          <header className="flex justify-between items-center mb-6 text-white">
            <div>
              <h1 className="text-lg font-bold tracking-tight opacity-90">RATHINAM GROWTH CARD</h1>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest mt-0.5">Student Portal</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.open('/student/report', '_blank')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm group"
                title="Print Growth Card"
              >
                <Printer size={16} className="text-white group-hover:text-indigo-100" />
              </button>
              <button onClick={logout} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* ... Profile Image ... */}
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="w-36 h-36 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-indigo-800 relative">
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <Image
                  src={data.student.profilePhoto ? `${API_URL}${data.student.profilePhoto}` : `https://api.dicebear.com/7.x/initials/svg?seed=${data.student.name}`}
                  alt="Profile"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="absolute bottom-0 right-2 p-2 bg-white rounded-full shadow-lg text-indigo-600 hover:bg-indigo-50 transition-colors z-20">
                <Camera size={20} />
              </div>
            </div>

            {/* Name & Stars */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight">{data.student.name}</h2>
              <p className="text-indigo-200 font-medium text-sm">{data.student.registerNumber} • {data.student.department}</p>
              <p className="text-indigo-300 text-xs mt-0.5">{data.student.email}</p>
            </div>

            {/* CRS Score Circle & Stars - Compacted */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* 1. Pulsing Core Glow */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl"
                />

                {/* 2. Rotating Gradient Ring (Outer) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-10px] rounded-full border-[3px] border-transparent border-t-indigo-400 border-r-indigo-300/50 opacity-50 blur-[1px]"
                />

                {/* 3. Counter-Rotating Particles Ring (Inner) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-4px] rounded-full border-2 border-dashed border-white/20"
                />

                {/* 4. Main Progress Circle Background */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] relative z-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="rgba(0,0,0,0.2)" />
                  {/* Progress Path with Gradient Stroke (Simulated via ID) */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c7d2fe" />
                    </linearGradient>
                  </defs>
                  <motion.circle
                    cx="50" cy="50" r="44"
                    stroke="url(#progressGradient)"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray="276" // 2 * PI * 44
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 276 - (276 * (data.student.currentCrs / 100)) }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_8px_rgba(165,180,252,0.6)]"
                  />
                </svg>

                {/* 5. Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                  <div className="text-6xl font-black tracking-tighter drop-shadow-2xl leading-none flex items-center text-white">
                    <AnimatedCounter value={data.student.currentCrs} />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center mt-1"
                  >
                    <span className="text-3xl font-bold uppercase tracking-[0.2em] text-indigo-100">CRS</span>
                    <div className="w-12 h-0.5 bg-indigo-400/50 rounded-full mt-1"></div>
                  </motion.div>
                </div>
              </div>

              {/* Stars - Compacted */}
              <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    fill={star <= data.student.starRating ? "#FBBF24" : "rgba(255,255,255,0.2)"}
                    className={star <= data.student.starRating ? "text-amber-400 drop-shadow-lg" : "text-transparent"}
                    stroke={star <= data.student.starRating ? "none" : "currentColor"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Performance Grid (Horizontal) --- */}
      <main className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-12">

        {/* Deductions Banner */}
        <AnimatePresence>
          {data.deductions.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 mb-6 shadow-sm overflow-hidden"
            >
              <div className="p-1.5 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-800">Violations Detected</h3>
                <p className="text-red-600 text-[10px]">Total deduction of <span className="font-bold">{data.deductions.total} points</span>.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-4 ml-1"
        >
          <div className="p-1 bg-white/10 rounded-md text-indigo-50 backdrop-blur-sm shadow-sm border border-white/10">
            <Trophy size={14} />
          </div>
          <h2 className="text-sm font-bold text-indigo-50 tracking-tight uppercase opacity-90">Performance Breakdown</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {data.report.map((param) => (
            <MainParamCard key={param.id} param={param} />
          ))}
        </motion.div>
      </main>

      {/* --- 3. Growth Graph --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 pb-12"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shadow-inner">
                <LineChartIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Growth Trajectory</h3>
              </div>
            </div>
            {/* Stats */}
            <div className="text-right hidden sm:block">
              <span className="text-lg font-black text-slate-800">{data.growthHistory.length}</span>
              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Checkpoints</span>
            </div>
          </div>

          <div className="h-[280px] w-full p-4 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growthHistory}>
                <defs>
                  <linearGradient id="colorCrs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  hide={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: '800', fontSize: '12px' }}
                  formatter={(value: number | undefined) => [value || 0, 'CRS']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="crs"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCrs)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// --- Component: Main Parameter Card (4x4 Adjusted) ---
function MainParamCard({ param }: { param: MainParamReport }) {
  // Dynamic color based on score
  const getScoreColor = (p: number) => {
    if (p >= 80) return "emerald";
    if (p >= 50) return "amber";
    return "rose";
  };
  const color = getScoreColor(param.percentage);

  const borderColorStr = color === "emerald" ? "border-t-emerald-500" : color === "amber" ? "border-t-amber-500" : "border-t-rose-500";
  const textColorStr = color === "emerald" ? "text-emerald-700" : color === "amber" ? "text-amber-700" : "text-rose-700";
  const bgSoftColorStr = color === "emerald" ? "bg-emerald-50" : color === "amber" ? "bg-amber-50" : "bg-rose-50";
  const getStarRating = (p: number) => {
    if (p >= 90) return 5;
    if (p >= 75) return 4;
    if (p >= 60) return 3;
    if (p >= 40) return 2;
    if (p > 0) return 1;
    return 0;
  };
  const starRating = getStarRating(param.percentage);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
      className={`bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 group border-t-[4px] ${borderColorStr} relative`}
    >
      {/* Background Decor */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgSoftColorStr} rounded-bl-full opacity-20 transition-transform group-hover:scale-150 duration-500`}></div>

      {/* Header */}
      <div className="px-5 py-5 flex justify-between items-start bg-white relative z-10">
        <div className="flex-1 pr-2">
          <div className="flex flex-col gap-1 mb-1">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug line-clamp-2 min-h-[2.5rem] flex items-center">
              {param.name}
            </h3>
            <span className="self-start text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
              Weightage: {param.weightage}%
            </span>
          </div>

          {/* Stars Row */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (star * 0.1) }}
              >
                <Star
                  size={16}
                  fill={star <= starRating ? "#FBBF24" : "#E2E8F0"}
                  className={star <= starRating ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}
                  stroke="none"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Big Score with Circular Progress */}
        <div className="relative pl-3 pt-2 pb-1">
          <svg className="w-20 h-20 transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50" cy="50" r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * (param.percentage / 100)) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              strokeLinecap="round"
              className={`${color === 'emerald' ? 'text-emerald-500' : color === 'amber' ? 'text-amber-500' : 'text-rose-500'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${textColorStr} leading-none`}>
              {param.percentage.toFixed(0)}<span className="text-[10px]">%</span>
            </span>
          </div>

          {/* Contribution Badge (Bottom Center Float) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap"
          >
            <span className={`px-2 py-0.5 rounded-full ${bgSoftColorStr} text-[10px] font-extrabold ${textColorStr} border border-white shadow-sm ring-1 ring-slate-100 uppercase tracking-wider flex items-center gap-1`}>
              <TrendingUp size={10} strokeWidth={3} /> +{param.contribution}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-50 mx-5 mt-4"></div>

      {/* Sub Parameters List */}
      <div className="p-4 flex-1 relative bg-slate-50/30">
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {param.subParameters.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex justify-between items-center text-xs bg-white px-3 py-2.5 rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] group/item hover:border-indigo-100 hover:shadow-md hover:-translate-x-1 transition-all"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sub.score > 0 ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                <p className={`font-semibold truncate ${sub.score > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{sub.name}</p>
              </div>
              <span className={`font-mono font-bold ml-2 ${sub.score > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                {sub.score}<span className="text-slate-300 mx-0.5">/</span>{sub.maxScore}
              </span>
            </motion.div>
          ))}
          {param.subParameters.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2 italic">No parameters yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Icon for Graph Header
function LineChartIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
