import React from "react";
import { 
  Home, 
  Award, 
  BarChart2, 
  UserRoundSearch, 
  UserRoundX, 
  Share2, 
  HelpCircle, 
  LogOut, 
  Cpu, 
  Play
} from "lucide-react";
import { ViewType } from "../types";

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onRunTalentLens: () => void;
  onLogoutClick: () => void;
}

export default function Sidebar({ currentView, setView, onRunTalentLens, onLogoutClick }: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "rubric", label: "Rubric", icon: Award },
    { id: "rankings", label: "Rankings", icon: BarChart2 },
    { id: "detail", label: "Candidate Detail", icon: UserRoundSearch },
    { id: "rejected", label: "Rejected", icon: UserRoundX },
    { id: "export", label: "Export", icon: Share2 }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-50">
      {/* Brand Logo & Header */}
      <div className="mb-8 flex items-center gap-3 p-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/15">
          <Cpu className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-headline-sm text-[18px] font-black text-white leading-tight">TalentLens</h1>
          <p className="font-label-caps text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">
            AI Candidate Ranking
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <IconComponent 
                size={20} 
                className={isActive ? "text-white" : "text-slate-400 group-hover:text-white transition-colors"} 
              />
              <span className="font-label-caps text-[12px] tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom controls & Run Action */}
      <div className="mt-auto pt-4 border-t border-slate-800 space-y-1">
        <button
          onClick={onRunTalentLens}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 mb-2 cursor-pointer"
        >
          <Play size={16} fill="currentColor" />
          <span className="font-label-caps text-[12px] uppercase">Run TalentLens</span>
        </button>

        <button
          onClick={() => setView("help")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
            currentView === "help"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <HelpCircle size={18} />
          <span className="font-label-caps text-[12px] uppercase">Help</span>
        </button>

        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-rose-400 transition-all text-left focus:outline-none cursor-pointer"
        >
          <LogOut size={18} />
          <span className="font-label-caps text-[12px] uppercase">Logout</span>
        </button>
      </div>
    </aside>
  );
}
