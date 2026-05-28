import React, { useState } from "react";
import { Cpu, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

interface LockScreenProps {
  onLogin: (name: string, role?: string) => void;
  defaultName: string;
}

export default function LockScreen({ onLogin, defaultName }: LockScreenProps) {
  const [formData, setFormData] = useState({
    name: defaultName || "Jane Doe",
    passcode: "••••••••",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(formData.name);
    }, 900);
  };

  return (
    <div className="absolute inset-0 z-[999] bg-slate-50 flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      {/* Background visual mesh details */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-300 to-indigo-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
      </div>

      <div className="max-w-[420px] w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 space-y-6 flex flex-col items-center relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glowing badge */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white relative shadow-lg shadow-blue-600/25">
          <Cpu className="text-white animate-pulse" size={32} />
          <Lock size={16} className="absolute -bottom-1 -right-1 text-blue-800 bg-white p-0.5 rounded-full border border-slate-200" />
        </div>

        {/* Branding header */}
        <div className="space-y-1.5 text-center">
          <h1 className="font-headline-sm text-2xl font-black text-slate-900 tracking-tight leading-none">
            TalentLens Gateway
          </h1>
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest leading-none mt-1">
            Lumina Operating System v4.12
          </p>
        </div>

        {/* Input credentials form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* Recruiter Name Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Officer Identity Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter recruiter name..."
            />
          </div>

          {/* Secure Passcode Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Cryptographic Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.passcode}
                onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Decrypt & Access CTA button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md shadow-blue-500/15 group transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Decrypting Workspace...</span>
              </>
            ) : (
              <>
                <span>Decrypt & Access Dashboard</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Quick select identities */}
        <div className="w-full pt-4 border-t border-slate-150 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Quick Identities
          </p>
          <div className="flex justify-center gap-2">
            {["Jane Doe", "Alex Rivera"].map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => setFormData({ name, passcode: "••••••••" })}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded text-[11px] font-semibold text-slate-700 transition-all cursor-pointer focus:outline-none"
              >
                {name} (Demo)
              </button>
            ))}
          </div>
        </div>

        {/* Footer Security details */}
        <div className="text-[9.5px] text-slate-400 font-mono flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full select-none">
          <ShieldCheck size={12} className="text-emerald-500" />
          SESSION ENCRYPTED AND NYC LAW 144 CLEAR
        </div>

      </div>
    </div>
  );
}
