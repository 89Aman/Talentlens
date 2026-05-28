import React from "react";
import { Bell, Settings } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  pipelineActive?: boolean;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  unreadNotificationsCount: number;
  userProfileName: string;
}

export default function Header({ 
  title, 
  subtitle, 
  pipelineActive = false,
  onNotificationsClick,
  onSettingsClick,
  onProfileClick,
  unreadNotificationsCount,
  userProfileName
}: HeaderProps) {
  // Extract user initials
  const initials = userProfileName
    ? userProfileName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "JD";

  return (
    <header className="w-full top-0 sticky z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 flex justify-between items-center h-16 px-6">
      {/* View Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-headline-md text-[20px] font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <p className="text-slate-500 text-[13px] font-body-md truncate max-w-[300px] md:max-w-[450px]">
              {subtitle}
            </p>
          </>
        )}
      </div>

      {/* Quick Settings & Profile Icons */}
      <div className="flex items-center gap-4">
        {pipelineActive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-label-caps text-slate-500 uppercase font-semibold">
              Pipeline Active
            </span>
          </div>
        )}

        {/* Notifications Icon with active bubble state */}
        <button 
          onClick={onNotificationsClick}
          aria-label="View notifications"
          className="relative group cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-all focus:outline-none"
        >
          <Bell className="text-slate-400 hover:text-blue-600 transition-colors" size={20} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center border border-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Settings Icon */}
        <button 
          onClick={onSettingsClick}
          aria-label="Application settings"
          className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all cursor-pointer focus:outline-none"
        >
          <Settings size={20} className="hover:text-blue-600 transition-colors" />
        </button>

        {/* Profile Avatar Trigger Button */}
        <button 
          onClick={onProfileClick}
          aria-label="User profile settings"
          className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 hover:bg-slate-100 rounded-full border border-transparent hover:border-slate-200 transition-all text-left focus:outline-none"
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 leading-none">{userProfileName}</span>
            <span className="text-[9px] text-slate-400 font-mono tracking-tight">Recruiter</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-600 transition-colors">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
}
