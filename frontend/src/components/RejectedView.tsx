import React, { useState } from "react";
import { 
  FilterX, 
  Trash2, 
  Search, 
  Eye, 
  Info, 
  AlertOctagon, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Sliders,
  TrendingUp
} from "lucide-react";
import { RejectedCandidate } from "../types";

interface RejectedViewProps {
  rejectedCandidates: RejectedCandidate[];
}

export default function RejectedView({ rejectedCandidates }: RejectedViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = rejectedCandidates.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.currentRole.toLowerCase().includes(query) ||
      c.missingSkill.toLowerCase().includes(query) ||
      c.reason.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header section with instructions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FilterX className="text-error-red" size={18} />
          <span className="text-error-red font-label-caps text-[11px] uppercase tracking-widest font-bold">
            Hard Constraint Audit
          </span>
        </div>
        <h2 className="font-sans text-[28px] md:text-[32px] font-black text-on-surface mb-2">
          Filtered Out Candidates
        </h2>
        <p className="text-on-surface-variant font-body-lg text-[14px] max-w-2xl leading-relaxed">
          These candidates was removed automatically before AI scoring based on hard, non-negotiable requirements declared in the rubric. This keeps your scoring queue highly accurate.
        </p>
      </div>

      {/* Dashboard summary metric blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-surface-container p-4 border border-outline-variant rounded-xl flex flex-col justify-between shadow-sm">
          <p className="text-on-surface-variant text-[11px] font-label-caps uppercase">Total Filtered</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[22px] font-bold font-data-mono">{rejectedCandidates.length * 28 + 2}</span>
            <span className="text-error-red text-[11px] font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              12% vs last pool
            </span>
          </div>
        </div>

        <div className="bg-surface-container p-4 border border-outline-variant rounded-xl flex flex-col justify-between shadow-sm">
          <p className="text-on-surface-variant text-[11px] font-label-caps uppercase">Experience Gap</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[22px] font-bold font-data-mono">88</span>
            <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden shrink-0">
              <div className="bg-error-red h-full w-[62%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container p-4 border border-outline-variant rounded-xl flex flex-col justify-between shadow-sm">
          <p className="text-on-surface-variant text-[11px] font-label-caps uppercase">Skill Mismatch</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[22px] font-bold font-data-mono">45</span>
            <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden shrink-0">
              <div className="bg-warning-amber h-full w-[31%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container p-4 border border-outline-variant rounded-xl flex flex-col justify-between shadow-sm">
          <p className="text-on-surface-variant text-[11px] font-label-caps uppercase">Location/Remote</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[22px] font-bold font-data-mono">9</span>
            <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden shrink-0">
              <div className="bg-secondary h-full w-[7%]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Live search input specifically for rejected queue */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter audit logs by name, skill, or reason..."
          className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 pl-10 pr-4 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant transition-all outline-none"
        />
      </div>

      {/* Rejected candidates auditing Table */}
      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant text-[11px] font-label-caps tracking-wider uppercase text-on-surface-variant">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-center">Experience</th>
                <th className="px-6 py-4">Missing Skill</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-[13px] font-body-md">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-surface-variant/20 transition-all cursor-pointer group"
                    onClick={() => alert(`Acknowledge: ${item.name} was excluded due to absolute mismatch: ${item.reason}.`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold border border-outline-variant font-label-caps select-none text-[11px]">
                          {item.initials}
                        </div>
                        <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {item.currentRole}
                    </td>
                    <td className="px-6 py-4 text-center font-data-mono text-on-surface">
                      {item.experience}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-label-caps bg-surface-container-low px-2.5 py-0.5 rounded border border-outline-variant/40 text-on-surface-variant uppercase">
                        {item.missingSkill}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container/10 border border-error-red/20 text-error-red font-label-caps text-[10px] uppercase font-bold">
                        <span className="w-1 h-1 bg-error-red rounded-full"></span>
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Audit snippet: ${item.name} possesses ${item.experience} which fails minimum rubric requirements.`);
                        }}
                        className="text-on-surface-variant hover:text-primary p-2 transition-colors cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant italic font-body-md select-none">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-surface-container-high border-t border-outline-variant flex items-center justify-between text-[12px] font-sans">
          <p className="text-on-surface-variant">
            Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} audit logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Informational bottom box */}
      <div className="p-4 bg-surface-container-low border-l-4 border-primary rounded-r-lg flex gap-4 shadow-sm">
        <Info className="text-primary mt-1 shrink-0" size={18} />
        <div className="text-[12.5px] max-w-2xl">
          <h4 className="font-headline-sm text-primary font-bold">Evidence-First Filtering Transparency</h4>
          <p className="text-on-surface-variant mt-1 leading-relaxed">
            TalentLens filtering is fully deterministic and audit-logged. Excluded profiles did not satisfy the strict mandatory criteria declared in the JD assessment. You can always relax criteria inside the <strong className="text-primary font-semibold select-all">Rubric</strong> page to recalibrate the candidate flow.
          </p>
        </div>
      </div>
    </div>
  );
}
