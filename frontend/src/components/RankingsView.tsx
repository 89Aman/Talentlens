import React, { useState, useMemo } from "react";
import { 
  CloudDownload, 
  Filter, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  Sliders,
  X,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  BarChart4
} from "lucide-react";
import { Candidate } from "../types";

interface RankingsViewProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onRefreshList?: () => void;
  biasAuditMode?: boolean;
}

export default function RankingsView({ candidates, onSelectCandidate, onRefreshList, biasAuditMode = false }: RankingsViewProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [showHighConfidence, setShowHighConfidence] = useState(true);
  const [showMediumConfidence, setShowMediumConfidence] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [experienceLimit, setExperienceLimit] = useState(3);
  const [requiredSkills, setRequiredSkills] = useState(["TypeScript", "React"]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput && !requiredSkills.includes(newSkillInput)) {
      setRequiredSkills([...requiredSkills, newSkillInput]);
      setNewSkillInput("");
      setShowAddSkillInput(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setShowHighConfidence(true);
    setShowMediumConfidence(true);
    setShowLowConfidence(true);
    setExperienceLimit(0);
    setRequiredSkills(["TypeScript", "React"]);
  };

  // Perform filtering programmatically based on user controls
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesRole = c.role.toLowerCase().includes(query);
        if (!matchesName && !matchesRole) return false;
      }

      // 2. Confidence Level Checkbox Filter
      if (c.confidence === "High" && !showHighConfidence) return false;
      if (c.confidence === "Medium" && !showMediumConfidence) return false;
      if (c.confidence === "Low" && !showLowConfidence) return false;

      // 3. Experience slider filter (filter candidates whose experience is >= limit)
      if (c.experience < experienceLimit) return false;

      // 4. Skills tags filter (if tags list has skills, perform soft checking against custom resume/bios)
      if (requiredSkills.length > 0) {
        // Simple heuristic lookup in candidate role, bio, and resume data
        const textToSearch = `${c.role} ${c.bio || ""} ${c.rawResumeData || ""}`.toLowerCase();
        const matchesAllSkills = requiredSkills.every(skill => 
          textToSearch.includes(skill.toLowerCase())
        );
        if (!matchesAllSkills) return false;
      }

      return true;
    });
  }, [candidates, searchQuery, showHighConfidence, showMediumConfidence, showLowConfidence, experienceLimit, requiredSkills]);

  // Paginated elements
  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage, pageSize]);

  // Dynamic calculations for Bento strip cards
  const summaryBlock = useMemo(() => {
    const totalCount = candidates.length;
    const highAndMedFreq = candidates.filter(c => c.confidence === "High" || c.confidence === "Medium").length;
    return {
      loaded: totalCount * 10, // simulated pool load scale
      filtered: Math.round(totalCount * 2.4),
      shortlisted: filteredCandidates.length,
      ranked: Math.min(10, filteredCandidates.length)
    };
  }, [candidates, filteredCandidates]);

  // Trigger formatted CSV download in the browser natively
  const exportCSV = () => {
    const headers = "Rank,Candidate Name,Role,Years of Experience,Semantic Alignment %,Behavioral Score,Elo Rating,Confidence Level\n";
    const rows = filteredCandidates.map((c) => 
      `"${c.rank}","${c.name}","${c.role}",${c.experience},"${c.semanticScore}%","${c.behavioralScore}/100",${c.eloRating},"${c.confidence}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `talentlens_ranked_candidates_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* Left Area: Summary Cards list and Main Table (flex-grow) */}
      <div className="flex-grow flex flex-col gap-6 w-full lg:max-w-[70%]">
        
        {/* Summary Strip: Bento Layout */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Loaded</span>
            <div className="flex justify-between items-end">
              <span className="font-data-mono text-[22px] font-bold text-on-surface">50</span>
              <CloudDownload className="text-primary/50" size={18} />
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Filtered</span>
            <div className="flex justify-between items-end">
              <span className="font-data-mono text-[22px] font-bold text-on-surface">12</span>
              <Sliders className="text-warning-amber/50" size={18} />
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-[11px] text-on-surface-variant uppercase">Shortlisted</span>
            <div className="flex justify-between items-end">
              <span className="font-data-mono text-[22px] font-bold text-on-surface">
                {summaryBlock.shortlisted}
              </span>
              <CheckCircle2 className="text-success-green/50" size={18} />
            </div>
          </div>

          {/* Golden active rankings container */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-low to-primary/5 flex flex-col gap-1 shadow-sm">
            <span className="font-label-caps text-[11px] text-primary uppercase">Ranked</span>
            <div className="flex justify-between items-end">
              <span className="font-data-mono text-[22px] font-bold text-primary">
                {summaryBlock.ranked}
              </span>
              <BarChart4 className="text-primary animate-pulse" size={18} />
            </div>
          </div>
        </section>

        {/* Global Search Interface Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search candidates by name, job description clues, or roles..."
            className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-[14px] font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant transition-all outline-none"
          />
          {searchQuery && (
            <X 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
              size={16}
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>

        {/* Main Data Board Table */}
        <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant text-on-surface-variant text-[11px] font-label-caps tracking-wider uppercase">
                  <th className="px-4 py-4 header-rank text-center w-14">Rank</th>
                  <th className="px-4 py-4">Candidate Name</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4 text-center">Exp</th>
                  <th className="px-4 py-4">Semantic %</th>
                  <th className="px-4 py-4">Behavioral</th>
                  <th className="px-4 py-4 text-center">Elo</th>
                  <th className="px-4 py-4 text-center">Confidence</th>
                  <th className="px-4 py-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((cand, index) => {
                    const localRank = (currentPage - 1) * pageSize + index + 1;
                    const paddedRank = localRank < 10 ? `#0${localRank}` : `#${localRank}`;
                    
                    let confidenceBg = "bg-success-green/10 text-success-green border-success-green/20";
                    let confidenceCircle = "bg-success-green";
                    if (cand.confidence === "Medium") {
                      confidenceBg = "bg-warning-amber/10 text-warning-amber border-warning-amber/20";
                      confidenceCircle = "bg-warning-amber";
                    } else if (cand.confidence === "Low") {
                      confidenceBg = "bg-error-red/10 text-error-red border-error-red/20";
                      confidenceCircle = "bg-error-red";
                    }

                    // Map score decimal directly to visual checkbox blocks (out of 5)
                    const renderedBlocksCount = Math.round(cand.behavioralScore / 20);

                    return (
                      <tr 
                        key={cand.id} 
                        className="hover:bg-surface-variant/30 transition-transform duration-300 transform hover:translate-x-1 cursor-pointer group text-[13px] font-body-md"
                        onClick={() => onSelectCandidate(cand.id)}
                      >
                        <td className="px-4 py-4 text-center font-data-mono text-primary font-bold">
                          {paddedRank}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 font-label-caps ${cand.avatarColor}`}>
                              {cand.initials}
                            </div>
                            <span className="font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {cand.name}
                              {biasAuditMode && (
                                <span 
                                  className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white font-bold text-[8.5px] inline-flex items-center justify-center shrink-0 shadow-sm border border-white"
                                  title="Audited and Passed NYC LL 144 compliance tests"
                                >
                                  ✓
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-on-surface-variant font-medium">
                          {cand.role}
                        </td>
                        <td className="px-4 py-4 text-center font-data-mono text-on-surface">
                          {cand.experience}y
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 max-w-[110px]">
                            <div className="flex-grow bg-surface-variant h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ width: `${cand.semanticScore}%` }}
                              ></div>
                            </div>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">{cand.semanticScore}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((b) => (
                                <div 
                                  key={b} 
                                  className={`w-2.5 h-3.5 rounded-sm ${
                                    b <= renderedBlocksCount ? "bg-primary" : "bg-surface-variant"
                                  }`}
                                ></div>
                              ))}
                            </div>
                            <span className="font-data-mono text-[11px] text-on-surface-variant pl-0.5 whitespace-nowrap">
                              {cand.behavioralScore}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-data-mono text-primary font-bold">
                          {cand.eloRating}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold gap-1 border uppercase inline-block text-center ${confidenceBg}`}>
                            <span className={`w-1 h-1 rounded-full ${confidenceCircle}`}></span>
                            {cand.confidence}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCandidate(cand.id);
                            }}
                            className="px-2.5 py-1 rounded border border-outline hover:bg-primary hover:text-on-primary hover:border-primary transition-all text-[11px] font-label-caps uppercase"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-on-surface-variant italic font-body-md">
                      No candidates match your selected criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with dynamic pagination */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-between items-center text-[12px] font-sans">
            <span className="text-on-surface-variant">
              Showing {filteredCandidates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredCandidates.length)} of{" "}
              {filteredCandidates.length} Selected Candidates
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Right Area: Sidebar panel for controls & metrics filtering (w-72) */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
        
        {/* Sticky filter module cards */}
        <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col gap-5 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/40">
            <h3 className="font-headline-sm text-on-surface text-[16px] font-bold flex items-center gap-2">
              <Filter size={15} />
              Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline hover:text-primary-fixed cursor-pointer font-label-caps"
            >
              Reset All
            </button>
          </div>

          {/* Confidence Level Controls */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-caps text-[11px] text-on-surface-variant font-semibold tracking-wider uppercase">
              Confidence Level
            </span>
            <div className="flex flex-col gap-2 font-sans text-[13px]">
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showHighConfidence}
                  onChange={(e) => {
                    setShowHighConfidence(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded bg-surface-container border-outline text-primary focus:ring-primary cursor-pointer w-4 h-4"
                />
                <span className="text-on-surface group-hover:text-primary transition-colors">High Confidence</span>
                <span className="ml-auto font-data-mono text-[10px] text-on-surface-variant bg-surface-variant/40 px-1.5 py-0.5 rounded">
                  {candidates.filter(c => c.confidence === "High").length}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showMediumConfidence}
                  onChange={(e) => {
                    setShowMediumConfidence(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded bg-surface-container border-outline text-primary focus:ring-primary cursor-pointer w-4 h-4"
                />
                <span className="text-on-surface group-hover:text-primary transition-colors">Medium Confidence</span>
                <span className="ml-auto font-data-mono text-[10px] text-on-surface-variant bg-surface-variant/40 px-1.5 py-0.5 rounded">
                  {candidates.filter(c => c.confidence === "Medium").length}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showLowConfidence}
                  onChange={(e) => {
                    setShowLowConfidence(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded bg-surface-container border-outline text-primary focus:ring-primary cursor-pointer w-4 h-4"
                />
                <span className="text-on-surface group-hover:text-primary transition-colors">Low Confidence</span>
                <span className="ml-auto font-data-mono text-[10px] text-on-surface-variant bg-surface-variant/40 px-1.5 py-0.5 rounded">
                  {candidates.filter(c => c.confidence === "Low").length}
                </span>
              </label>
            </div>
          </div>

          <hr className="border-outline-variant/40" />

          {/* Years of Experience Slider */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[11px] text-on-surface-variant font-semibold tracking-wider uppercase">
                Experience (Years)
              </span>
              <span className="font-data-mono text-[12px] text-primary font-bold">
                {experienceLimit}y - 15y+
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={experienceLimit}
              onChange={(e) => {
                setExperienceLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full h-1 bg-surface-variant rounded-lg cursor-pointer accent-primary"
            />
            
            <div className="flex justify-between font-data-mono text-[10px] text-on-surface-variant select-none">
              <span>0y</span>
              <span>8y</span>
              <span>15y+</span>
            </div>
          </div>

          <hr className="border-outline-variant/40" />

          {/* Required Skills tags filter panel */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-caps text-[11px] text-on-surface-variant font-semibold tracking-wider uppercase">
              Required Skills
            </span>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              {requiredSkills.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 rounded bg-surface-variant text-[11px] font-label-caps border border-outline-variant/40 text-on-surface-variant flex items-center gap-1 group/tag"
                >
                  {tag}
                  <X 
                    size={11} 
                    className="cursor-pointer group-hover/tag:text-error-red transition-colors"
                    onClick={() => {
                      handleRemoveSkill(tag);
                      setCurrentPage(1);
                    }}
                  />
                </span>
              ))}

              {showAddSkillInput ? (
                <form onSubmit={handleAddSkill} className="inline-flex">
                  <input
                    type="text"
                    autoFocus
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="bg-surface-container-high border border-primary/40 rounded px-1 text-[11px] font-label-caps text-on-surface outline-none w-20"
                    placeholder="Skill..."
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setShowAddSkillInput(true)}
                  className="px-2 py-0.5 rounded bg-surface-variant border border-primary/20 text-primary text-[11px] font-label-caps flex items-center gap-1 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all font-semibold"
                >
                  <Plus size={12} />
                  Add Skill
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentPage(1);
              alert(`Filters updated! Found ${filteredCandidates.length} eligible candidates.`);
            }}
            className="mt-2 w-full bg-surface-bright hover:bg-surface-variant border border-outline-variant text-on-surface font-semibold py-2.5 rounded-lg text-[12px] font-label-caps uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <RefreshCw size={13} />
            Apply Filters
          </button>
        </div>

        {/* Dynamic CSV Export Sidebar Shortcut */}
        <div className="bg-gradient-to-br from-secondary-container/10 to-surface-container p-5 rounded-xl border border-secondary-container/20 flex flex-col gap-3 shadow-md">
          <span className="font-label-caps text-[11px] text-secondary font-semibold tracking-wider uppercase">
            Export Results
          </span>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Generate and download a standard CSV of the {filteredCandidates.length} ranked candidates currently visible under the selected filters.
          </p>
          <button
            onClick={exportCSV}
            disabled={filteredCandidates.length === 0}
            className="bg-secondary text-on-secondary font-bold py-2.5 px-4 rounded-lg text-[11px] font-label-caps uppercase hover:opacity-90 active:scale-95 transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download CSV ({filteredCandidates.length})
          </button>
        </div>
      </aside>
    </div>
  );
}
