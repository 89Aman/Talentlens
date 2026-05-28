import React from "react";
import { X, Save, ShieldAlert, Sliders, RotateCcw, Activity } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Settings States
  biasAuditMode: boolean;
  onToggleBiasAudit: (val: boolean) => void;
  autoReRankEnabled: boolean;
  onToggleAutoReRank: (val: boolean) => void;
  retentionThreshold: number;
  onChangeRetentionThreshold: (val: number) => void;
  currentCluster: string;
  onChangeCluster: (cluster: string) => void;
  onResetAllData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  biasAuditMode,
  onToggleBiasAudit,
  autoReRankEnabled,
  onToggleAutoReRank,
  retentionThreshold,
  onChangeRetentionThreshold,
  currentCluster,
  onChangeCluster,
  onResetAllData,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative max-w-lg w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">TalentLens Preferences</h3>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight leading-none mt-0.5">
                Workspace Configuration Panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-all cursor-pointer focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Algorithmic Settings */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
              Algorithmic Calibrations
            </h4>
            <div className="space-y-4">
              
              {/* Auto Run Switch */}
              <div className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="max-w-[75%]">
                  <p className="text-[12.5px] font-semibold text-slate-800">Dynamic Re-Ranking Engine</p>
                  <p className="text-[11.5px] text-slate-500 leading-normal mt-0.5">
                    Automatically triggers candidate confidence calibration whenever rubric weights are adjusted.
                  </p>
                </div>
                <button
                  onClick={() => onToggleAutoReRank(!autoReRankEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    autoReRankEnabled ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ${
                      autoReRankEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* NYC Audit Mode Selector */}
              <div className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-2">
                    <p className="text-[12.5px] font-semibold text-slate-800">NYC Audit Cleared Indicator</p>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[8.5px] rounded-sm font-mono tracking-wider uppercase">
                      Compliance
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-normal mt-0.5">
                    Add audit-cleared flags and telemetry to the Shortlist table to satisfy NYC Local Law 144 requirements.
                  </p>
                </div>
                <button
                  onClick={() => onToggleBiasAudit(!biasAuditMode)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    biasAuditMode ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ${
                      biasAuditMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Section 2: Retention Filter slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Shortlist Retention Level
              </h4>
              <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Score &gt;= {retentionThreshold}%
              </span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={retentionThreshold}
                onChange={(e) => onChangeRetentionThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                <span>50% (Inclusive)</span>
                <span>70% (Balanced)</span>
                <span>85% (High Bar only)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Dev Infrastructure Cluster info */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">
              Deployment Environment Location
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {["East-Cluster (Primary)", "Staging-Cluster (EU)"].map((cluster) => {
                const isActive = currentCluster === cluster;
                return (
                  <button
                    key={cluster}
                    onClick={() => onChangeCluster(cluster)}
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-50/50 border-blue-500 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cluster}</span>
                    {isActive && <Activity size={12} className="text-blue-600 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Deep Danger Reset Area */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={16} />
              </div>
              <div className="flex-1 space-y-2 text-left">
                <p className="text-[12.5px] font-semibold text-rose-900 leading-none">Diagnostic Maintenance</p>
                <p className="text-[11.5px] text-rose-700 leading-normal">
                  Reset pipeline parameters, criteria ratings, list shortlists, and dismissed backlogs back to default seed configurations.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all evaluation changes, customized weights, and audit statuses back to factory defaults?")) {
                      onResetAllData();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold text-[11px] uppercase tracking-wide hover:bg-rose-700 inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
                >
                  <RotateCcw size={12} />
                  Perform Fresh Hard Seed Reset
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save size={14} />
            Apply Preference Rules
          </button>
        </div>

      </div>
    </div>
  );
}
