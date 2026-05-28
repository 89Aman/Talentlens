import React, { useState } from "react";
import { 
  Share2, 
  Terminal, 
  Clipboard, 
  CheckCircle2, 
  ShieldAlert, 
  Coins, 
  Clock, 
  UserPlus, 
  Mail,
  Users2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Candidate } from "../types";

interface ExportViewProps {
  candidates: Candidate[];
}

export default function ExportView({ candidates }: ExportViewProps) {
  const [copied, setCopied] = useState(false);

  // Generate robust summary payload for clipboard sharing
  const generateHiringSummary = () => {
    let output = `--- TALENTLENS AI SHORTLIST BRIEF ---\n\n`;
    output += `Role: Lead ML System Engineer / Senior Full Stack architect\n`;
    output += `Target Pool size: 5 candidates successfully compiled\n`;
    output += `Average Semantic Match: 81.6%\n\n`;
    output += `TOP RANKED CANDIDATES:\n`;
    
    candidates.slice(0, 3).forEach((c, i) => {
      output += `${i + 1}. ${c.name} (Elo: ${c.eloRating}, Confidence: ${c.confidence})\n`;
      output += `   Role: ${c.role} (${c.experience}y exp)\n`;
      output += `   Semantic Fit: ${c.semanticScore}% | Behavioral Score: ${c.behavioralScore}/100\n`;
      output += `   Fit Highlight: ${c.bio || ""}\n\n`;
    });

    output += `Generated securely via TalentLens AI Engine. Copy-locked by client encryption.`;
    return output;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateHiringSummary())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        alert("Clipboard action failed. Please highlight the summary and copy manually!");
      });
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Page Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="text-secondary" size={18} />
          <span className="text-secondary font-label-caps text-[11px] uppercase tracking-widest font-bold">
            Pipeline Deliverables
          </span>
        </div>
        <h2 className="font-sans text-[28px] md:text-[32px] font-black text-on-surface">
          Export & Summary Hub
        </h2>
        <p className="text-on-surface-variant font-body-lg text-[14px] max-w-2xl">
          Share your calibrated candidate rankings, review token analytics, and copy AI briefs directly to your Slack channel or ATS pipeline.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Metadata and clipboard brief (7/12) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                AI Shortlist Summary Brief
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary px-3 py-1.5 rounded-lg text-[11px] font-label-caps uppercase flex items-center gap-2 transition-all cursor-pointer font-bold"
              >
                {copied ? <CheckCircle2 size={13} /> : <Clipboard size={13} />}
                {copied ? "Copied Brief!" : "Copy to Clipboard"}
              </button>
            </div>

            {/* Generated Brief preview block */}
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/40 overflow-hidden font-mono text-[12px] text-on-surface-variant/90 leading-relaxed whitespace-pre-wrap h-[340px] select-all custom-scrollbar">
              {generateHiringSummary()}
            </div>
          </div>
        </div>

        {/* Right Column: API token cost metrics & sharing channels (5/12) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* Detailed usage analytics bento container */}
          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col gap-4 shadow-md">
            <h3 className="font-headline-sm text-on-surface text-[16px] font-bold">
              Tokens & Usage Metrics
            </h3>
            
            <div className="space-y-3.5 font-sans">
              <div className="flex justify-between items-center text-[13px] border-b border-outline-variant/30 pb-2.5">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Mail className="text-outline shrink-0" size={15} />
                  Total Candidates Scanned
                </span>
                <span className="font-data-mono text-on-surface font-semibold">1,248</span>
              </div>

              <div className="flex justify-between items-center text-[13px] border-b border-outline-variant/30 pb-2.5">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Coins className="text-outline shrink-0" size={15} />
                  Calculated Tokens Used
                </span>
                <span className="font-data-mono text-on-surface font-semibold">1,184,392</span>
              </div>

              <div className="flex justify-between items-center text-[13px] border-b border-outline-variant/30 pb-2.5">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Coins className="text-outline shrink-0" size={15} />
                  Secure Gemini Billing
                </span>
                <span className="font-data-mono text-success-green font-bold">$1.85 USD</span>
              </div>

              <div className="flex justify-between items-center text-[13px] border-b border-outline-variant/30 pb-2.5">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Clock className="text-outline shrink-0" size={15} />
                  Execution Duration Time
                </span>
                <span className="font-data-mono text-primary font-bold">4m 12s</span>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <Users2 className="text-outline shrink-0" size={15} />
                  Shared with ATS Pod
                </span>
                <span className="font-data-mono text-secondary font-bold">In Sync</span>
              </div>
            </div>
            
            <div className="mt-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/40 text-[11px] text-on-surface-variant leading-relaxed">
              * Secure billing calculation uses custom enterprise discount coefficients mapping standard Gemini Pro rates.
            </div>
          </div>

          {/* Quick Sharing Slack/Teams links mock triggers */}
          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant shadow-md flex flex-col gap-3">
            <h3 className="font-headline-sm text-on-surface text-[15px] font-bold">
              ATS Synchronization
            </h3>
            <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
              Export and upload candidate scorecards into your recruitment channels in 1-click.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-1 text-[11px] font-label-caps uppercase font-bold font-sans">
              <button
                onClick={() => alert("Lever sync successful! Scorecards generated for top 5.")}
                className="bg-surface-container-high hover:bg-surface-variant border border-outline-variant rounded-lg p-2.5 text-center cursor-pointer transition-colors"
              >
                Sync with Lever
              </button>
              <button
                onClick={() => alert("Greenhouse ingestion completed securely.")}
                className="bg-surface-container-high hover:bg-surface-variant border border-outline-variant rounded-lg p-2.5 text-center cursor-pointer transition-colors"
              >
                Sync with Greenhouse
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Pairwise contrastive comparison reasoning cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={16} fill="rgba(107,216,203,0.1)" />
          <h3 className="font-sans text-[18px] font-semibold text-on-surface">AI Contrastive Alignment Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          
          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col justify-between shadow-sm">
            <div>
              <span className="font-data-mono text-[10px] text-primary uppercase font-bold bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full inline-block">
                Rank #1 vs Rank #2
              </span>
              <h4 className="font-headline-sm text-[15px] text-on-surface font-bold mt-2.5">
                Elena Rodriguez vs Sarah Chen
              </h4>
              <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">
                While <strong className="text-on-surface">Sarah Chen</strong> holds a 98% semantic similarity quotient, <strong className="text-on-surface">Elena Rodriguez</strong> is ranked #01 due to her direct Raft consensus algorithm implementation experience. This satisfies high-priority distributed caching needs that Sarah's browser canvas-centric expertise lacks.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-[12px] text-on-surface-variant">
              <span>Decision Weight gap: 3.5%</span>
              <span className="text-primary flex items-center gap-1 hover:underline cursor-pointer" onClick={() => alert("Opening contrast view")}>
                View Matrix
                <ArrowRight size={12} />
              </span>
            </div>
          </div>

          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col justify-between shadow-sm">
            <div>
              <span className="font-data-mono text-[10px] text-tertiary uppercase font-bold bg-tertiary/10 border border-tertiary/25 px-2 py-0.5 rounded-full inline-block">
                Rank #3 vs Rank #4
              </span>
              <h4 className="font-headline-sm text-[15px] text-on-surface font-bold mt-2.5">
                Marcus Rodriguez vs Jessica Lee
              </h4>
              <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">
                <strong className="text-on-surface">Marcus Rodriguez</strong> displays a significant, undeniable gap in low-level web styling design layout, but his 12 years of AWS cluster scaling results inside high-volume pods provide 4.2x more architectural leverage than <strong className="text-on-surface">Jessica Lee</strong>'s visual asset experience.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-[12px] text-on-surface-variant">
              <span>Decision Weight gap: 14.0%</span>
              <span className="text-primary flex items-center gap-1 hover:underline cursor-pointer" onClick={() => alert("Opening contrast view")}>
                View Matrix
                <ArrowRight size={12} />
              </span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
