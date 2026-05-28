import React from "react";
import { X, LogOut, ShieldCheck, Lock } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  userProfileName: string;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirmLogout,
  userProfileName,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative max-w-sm w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col p-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer focus:outline-none"
        >
          <X size={16} />
        </button>

        {/* Dynamic Art/Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <LogOut size={22} className="relative left-[1px]" />
        </div>

        {/* Text */}
        <h3 className="font-bold text-slate-900 text-lg leading-tight">Confirm Secure Sign Out</h3>
        <p className="text-xs text-slate-500 leading-normal mt-2.5">
          Hi, <span className="font-semibold text-slate-800">{userProfileName}</span>. Are you sure you want to end your secure Lumina OS TalentLens session? 
        </p>

        {/* Security Warning banner */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-2.5 text-left">
          <Lock size={16} className="text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-normal">
            Ending the session triggers cryptographic state preservation. All customized local weight settings will remain stored in local workspace caches.
          </p>
        </div>

        {/* Actions Button Row */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all border border-slate-200/80 cursor-pointer focus:outline-none"
          >
            Stay Signed In
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-rose-500/10 cursor-pointer focus:outline-none"
          >
            Yes, Sign Out
          </button>
        </div>

        <div className="mt-4 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-emerald-500" />
          SESSION SECURITY LAYER HIGH
        </div>

      </div>
    </div>
  );
}
