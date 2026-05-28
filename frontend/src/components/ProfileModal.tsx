import React from "react";
import { X, User, Briefcase, Award, ShieldCheck } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Recruiter Profile state
  userProfileName: string;
  onUpdateName: (val: string) => void;
  recruiterPersonaTitle: string;
  onUpdateTitle: (val: string) => void;
  recruiterPersonaTeam: string;
  onUpdateTeam: (val: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  userProfileName,
  onUpdateName,
  recruiterPersonaTitle,
  onUpdateTitle,
  recruiterPersonaTeam,
  onUpdateTeam,
}: ProfileModalProps) {
  if (!isOpen) return null;

  const initials = userProfileName
    ? userProfileName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "JD";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Colorful top accent banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-all cursor-pointer focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Container */}
        <div className="relative p-6 pt-0 flex flex-col items-center">
          
          {/* Circular avatar overlapping the banner */}
          <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl -mt-10 border-4 border-white shadow-md relative z-10 select-none">
            {initials}
          </div>

          <div className="text-center mt-3 w-full">
            <h3 className="text-lg font-bold text-slate-900">{userProfileName}</h3>
            <p className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck size={14} />
              Verified Enterprise Admin
            </p>
          </div>

          {/* Form fields */}
          <div className="w-full mt-6 space-y-4">
            
            {/* Recruiter Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 select-none">
                <User size={12} />
                Full Recruiter Name
              </label>
              <input
                type="text"
                value={userProfileName}
                onChange={(e) => onUpdateName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Title description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 select-none">
                <Briefcase size={12} />
                Corporate Title
              </label>
              <input
                type="text"
                value={recruiterPersonaTitle}
                onChange={(e) => onUpdateTitle(e.target.value)}
                placeholder="e.g. Principal Technical Recruiter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Enterprise Division focus Team */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 select-none">
                <Award size={12} />
                Assigned Talent Pipeline
              </label>
              <input
                type="text"
                value={recruiterPersonaTeam}
                onChange={(e) => onUpdateTeam(e.target.value)}
                placeholder="e.g. Core OS Engineering"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

          </div>

          {/* Quick System Badge */}
          <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200/60 mt-6 flex divide-x divide-slate-200 text-center font-mono">
            <div className="flex-1 px-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase select-none">Permission</p>
              <p className="text-xs text-slate-800 font-black mt-0.5">OWNER</p>
            </div>
            <div className="flex-1 px-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase select-none">Security Key</p>
              <p className="text-xs text-slate-800 font-black mt-0.5">AES-256</p>
            </div>
            <div className="flex-1 px-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase select-none">License Type</p>
              <p className="text-xs text-blue-600 font-black mt-0.5">UNLIMITED</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
          >
            Save Recruiter Profile
          </button>
        </div>

      </div>
    </div>
  );
}
