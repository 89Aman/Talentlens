import React, { useState } from "react";
import { 
  ArrowLeft, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  GitFork, 
  Star, 
  Calendar, 
  FileJson,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Award
} from "lucide-react";
import { Candidate } from "../types";

interface DetailViewProps {
  candidates: Candidate[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onBackToRankings: () => void;
}

export default function DetailView({ 
  candidates, 
  selectedCandidateId, 
  onSelectCandidate, 
  onBackToRankings 
}: DetailViewProps) {
  const [showRawResume, setShowRawResume] = useState(false);

  // Retrieve selected candidate object, defaulting to first item if not found
  const candidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectCandidate(e.target.value);
  };

  // Safe checks if breakdown or briefs are missing
  const breakdown = candidate.behavioralBreakdown || {
    quantifiedImpact: { score: 0, quote: "No data available", evidence: "N/A" },
    ownership: { score: 0, quote: "No data available", evidence: "N/A" },
    technicalDepth: { score: 0, quote: "No data available", evidence: "N/A" },
    mentorship: { score: 0, quote: "No data available", evidence: "N/A" }
  };

  const stats = candidate.githubStats || {
    repositories: 0,
    totalStars: "0",
    lastActive: "N/A",
    topLanguage: "N/A",
    commitVelocity: [0, 0, 0, 0, 0, 0, 0]
  };

  const briefs = candidate.hiringBrief || {
    fitSummary: [],
    gaps: [],
    interviewStrategy: { goal: "Evaluate technical limits.", question: "How do you define system thresholds?" }
  };

  // Find max value in velocity array to scale the SVG commit bars correctly
  const commitMax = Math.max(...stats.commitVelocity, 1);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  return (
    <div className="max-w-[1240px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Mini Profile Switcher & Back Arrow Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToRankings}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group text-[13px] font-label-caps cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 duration-200 transition-transform" />
            <span>Back to Rankings</span>
          </button>
          
          <div className="h-6 w-px bg-outline-variant"></div>
          
          {/* Candidate selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-label-caps text-on-surface-variant uppercase">Inspector:</span>
            <select
              value={candidate.id}
              onChange={handleCandidateChange}
              className="bg-surface-container border border-outline-variant text-[14px] font-semibold text-primary rounded px-3 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Confidence scores badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-success-green/10 border border-success-green/20 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-green"></span>
            <span className="font-label-caps text-[11px] text-success-green font-bold">
              High Confidence (94%)
            </span>
          </div>

          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
            <span className="font-data-mono text-[13px] text-primary">{`Elo: ${candidate.eloRating}`}</span>
          </div>
        </div>
      </header>

      {/* Candidate Persona Hero Card */}
      <div className="bg-surface-container rounded-xl p-5 border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm bg-gradient-to-r from-surface-container to-primary-container-low/5">
        <div>
          <h2 className="font-sans text-[26px] font-black text-on-surface leading-tight">
            {candidate.name}
          </h2>
          <p className="text-on-surface-variant text-[14px] font-medium mt-1 select-none">
            {candidate.role} • {candidate.location || "Silicon Valley, CA"} • {candidate.experience} Years Experience
          </p>
          <p className="text-on-surface-variant text-[13px] italic mt-2 text-on-surface/80 max-w-xl">
            "{candidate.bio || "Staff engineering candidate focusing on high scale system reliability blueprints."}"
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-[18px] font-label-caps shrink-0 border border-outline-variant ${candidate.avatarColor}`}>
          {candidate.initials}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Section: Score Breakdowns (8/12) */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-[18px] font-semibold text-on-surface">Behavioral Analysis</h3>
            <span className="text-on-surface-variant text-[12px]">Based on 14 analyzed work samples</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Quantified Impact card */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-primary shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-[15px] font-semibold text-on-surface">Quantified Impact</h4>
                  <p className="text-on-surface-variant text-[11px] font-body-sm">Ability to drive business value</p>
                </div>
                <span className="font-data-mono text-primary text-[16px] font-bold">{breakdown.quantifiedImpact.score}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const checkVal = indexToScores(breakdown.quantifiedImpact.score);
                  return (
                    <div 
                      key={idx} 
                      className={`h-1.5 flex-1 rounded-full ${idx <= checkVal ? "bg-primary" : "bg-surface-variant"}`}
                    ></div>
                  );
                })}
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 select-text">
                <p className="text-[12px] italic text-on-surface-variant">"{breakdown.quantifiedImpact.quote}"</p>
                <div className="mt-2.5 flex items-center gap-1 text-[9px] text-primary uppercase font-bold font-label-caps">
                  <CheckCircle2 size={12} />
                  Evidence: {breakdown.quantifiedImpact.evidence}
                </div>
              </div>
            </div>

            {/* Ownership card */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-secondary shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-[15px] font-semibold text-on-surface">Ownership</h4>
                  <p className="text-on-surface-variant text-[11px] font-body-sm">End-to-end responsibility</p>
                </div>
                <span className="font-data-mono text-secondary text-[16px] font-bold">{breakdown.ownership.score}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const checkVal = indexToScores(breakdown.ownership.score);
                  return (
                    <div 
                      key={idx} 
                      className={`h-1.5 flex-1 rounded-full ${idx <= checkVal ? "bg-secondary" : "bg-surface-variant"}`}
                    ></div>
                  );
                })}
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 select-text">
                <p className="text-[12px] italic text-on-surface-variant">"{breakdown.ownership.quote}"</p>
                <div className="mt-2.5 flex items-center gap-1 text-[9px] text-secondary uppercase font-bold font-label-caps">
                  <CheckCircle2 size={12} />
                  Evidence: {breakdown.ownership.evidence}
                </div>
              </div>
            </div>

            {/* Technical Depth card */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-tertiary shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-[15px] font-semibold text-on-surface">Technical Depth</h4>
                  <p className="text-on-surface-variant text-[11px] font-body-sm">Architecture & complex logic</p>
                </div>
                <span className="font-data-mono text-tertiary text-[16px] font-bold">{breakdown.technicalDepth.score}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const checkVal = indexToScores(breakdown.technicalDepth.score);
                  return (
                    <div 
                      key={idx} 
                      className={`h-1.5 flex-1 rounded-full ${idx <= checkVal ? "bg-tertiary" : "bg-surface-variant"}`}
                    ></div>
                  );
                })}
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 select-text">
                <p className="text-[12px] italic text-on-surface-variant">"{breakdown.technicalDepth.quote}"</p>
                <div className="mt-2.5 flex items-center gap-1 text-[9px] text-tertiary uppercase font-bold font-label-caps">
                  <CheckCircle2 size={12} />
                  Evidence: {breakdown.technicalDepth.evidence}
                </div>
              </div>
            </div>

            {/* Mentorship card */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-success-green shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-[15px] font-semibold text-on-surface">Mentorship</h4>
                  <p className="text-on-surface-variant text-[11px] font-body-sm">Levelling up the team</p>
                </div>
                <span className="font-data-mono text-success-green text-[16px] font-bold">{breakdown.mentorship.score}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const checkVal = indexToScores(breakdown.mentorship.score);
                  return (
                    <div 
                      key={idx} 
                      className={`h-1.5 flex-1 rounded-full ${idx <= checkVal ? "bg-success-green" : "bg-surface-variant"}`}
                    ></div>
                  );
                })}
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 select-text">
                <p className="text-[12px] italic text-on-surface-variant">"{breakdown.mentorship.quote}"</p>
                <div className="mt-2.5 flex items-center gap-1 text-[9px] text-success-green uppercase font-bold font-label-caps">
                  <CheckCircle2 size={12} />
                  Evidence: {breakdown.mentorship.evidence}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Right Section: GitHub Stats Summary Sidebar (4/12) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-headline-sm text-on-surface text-[18px] font-bold flex items-center gap-2">
            <Terminal size={18} />
            GitHub Signals
          </h3>

          <div className="grid grid-cols-2 gap-3 font-sans">
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
              <p className="text-on-surface-variant text-[10px] font-label-caps uppercase">Repositories</p>
              <p className="text-[18px] font-bold font-data-mono text-primary mt-1">{stats.repositories}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
              <p className="text-on-surface-variant text-[10px] font-label-caps uppercase">Total Stars</p>
              <p className="text-[18px] font-bold font-data-mono text-primary mt-1">{stats.totalStars}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
              <p className="text-on-surface-variant text-[10px] font-label-caps uppercase">Last Active</p>
              <p className="text-[18px] font-bold font-data-mono text-on-surface mt-1">{stats.lastActive}</p>
            </div>
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col gap-1 shadow-sm">
              <p className="text-on-surface-variant text-[10px] font-label-caps uppercase">Top Language</p>
              <p className="text-[18px] font-bold font-data-mono text-secondary mt-1">{stats.topLanguage}</p>
            </div>
          </div>

          {/* Interactive commit velocity graph chart */}
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-3">
            <h4 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Commit Velocity
            </h4>
            
            {/* SVG custom bar graph visualization rendering */}
            <div className="flex items-end gap-1.5 h-24 pt-2">
              {stats.commitVelocity.map((val, idx) => {
                const heightPercentage = Math.round((val / commitMax) * 100);
                return (
                  <div 
                    key={idx} 
                    style={{ height: `${heightPercentage}%` }}
                    className="flex-1 bg-primary/25 hover:bg-primary rounded-sm transition-all duration-300 relative group/bar cursor-pointer"
                  >
                    {/* Tooltip on hovering graph bar */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-surface-container-high border border-outline-variant text-[10px] font-data-mono text-on-surface px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap mb-1 z-30 shadow-md">
                      {val} commits
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-[10px] text-on-surface-variant font-data-mono uppercase">
              <span>{months[0]}</span>
              <span>{months[months.length - 1]}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Structured Strategy Brief Section */}
      <section className="space-y-4">
        <h3 className="font-sans text-[18px] font-semibold text-on-surface">Hiring Brief & Strategy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          
          {/* Gaps bullet checklist container (Green boundary) */}
          <div className="bg-surface-container p-5 rounded-xl border-l-4 border-success-green shadow-sm">
            <h4 className="font-label-caps text-[11px] text-success-green font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Fit Summary
            </h4>
            <ul className="space-y-2 text-[12.5px] text-on-surface leading-relaxed">
              {briefs.fitSummary.length > 0 ? (
                briefs.fitSummary.map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-success-green text-[14px] font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-on-surface-variant italic">No fits compiled</li>
              )}
            </ul>
          </div>

          {/* Gaps bullet checklist container (Amber boundary) */}
          <div className="bg-surface-container p-5 rounded-xl border-l-4 border-warning-amber shadow-sm">
            <h4 className="font-label-caps text-[11px] text-warning-amber font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle size={13} />
              Identified Gaps
            </h4>
            <ul className="space-y-2 text-[12.5px] text-on-surface leading-relaxed">
              {briefs.gaps.length > 0 ? (
                briefs.gaps.map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-warning-amber text-[14px] font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-on-surface-variant italic select-none">No notable gaps identified</li>
              )}
            </ul>
          </div>

          {/* Interview Question Box (Golden backdrop container) */}
          <div className="bg-secondary-container/10 p-5 rounded-xl border border-secondary/20 relative overflow-hidden shadow-sm">
            <div className="absolute -right-4 -top-4 opacity-5">
              <MessageSquare size={120} className="text-secondary" />
            </div>
            
            <h4 className="font-label-caps text-[11px] text-secondary font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={13} fill="rgba(192,193,255,0.1)" />
              Interview Strategy
            </h4>
            
            <div className="space-y-3 relative z-10 text-[12.5px]">
              <p className="text-on-surface font-medium leading-tight">
                {briefs.interviewStrategy.goal}
              </p>
              <div className="bg-surface-container-high/60 p-3 rounded border border-secondary/15 italic text-secondary text-[12px] leading-relaxed select-text">
                "{briefs.interviewStrategy.question}"
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Raw Resume Segment (Accordion Collapse with detailed view details) */}
      <section className="pt-2">
        <button 
          onClick={() => setShowRawResume(!showRawResume)}
          className="w-full bg-surface-container p-4 rounded-xl border border-outline-variant flex items-center justify-between hover:bg-surface-variant transition-colors select-none group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3">
            <FileJson className="text-on-surface-variant group-hover:text-primary transition-colors" size={18} />
            <span className="font-headline-sm text-on-surface font-semibold text-[15px]">Raw Resume & Profile Data</span>
          </div>
          {showRawResume ? (
            <ChevronUp className="text-on-surface-variant" size={18} />
          ) : (
            <ChevronDown className="text-on-surface-variant" size={18} />
          )}
        </button>

        {showRawResume && (
          <div className="overflow-hidden mt-2 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-inner transition-all duration-300">
            <pre className="font-mono text-[11px] text-on-surface-variant/90 leading-relaxed whitespace-pre-wrap overflow-x-auto select-all custom-scrollbar">
              {candidate.rawResumeData}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}

// Convert score metrics from decimal format (e.g. 9.2) to checklist block index integers out of 5
function indexToScores(val: number): number {
  return Math.round(val / 2);
}
