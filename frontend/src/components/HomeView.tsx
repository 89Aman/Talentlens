import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  Users, 
  Terminal, 
  Bot, 
  Zap, 
  ExternalLink,
  HelpCircle,
  Database,
  ArrowRight
} from "lucide-react";

interface HomeViewProps {
  onRun: (jobDescription: string, poolSize: number, enableGithub: boolean, candidateFile: string) => void;
}

export default function HomeView({ onRun }: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [jobDescription, setJobDescription] = useState(
    "Lead Software Engineer focusing on high-scale recommendation engines, backend microservices, and reliable distributed systems. Must have strong evidence of microservices architecture migations, MLOps orchestration (Kubernetes or Kubeflow), or custom consensus protocol implementation (Raft or Paxos)."
  );
  const [shortlistSize, setShortlistSize] = useState(15);
  const [githubSignals, setGithubSignals] = useState(true);
  const [candidateFile, setCandidateFile] = useState("recommendation_engine_pool.csv");

  const sampleFiles = [
    "recommendation_engine_pool.csv",
    "senior_full_stack_candidates.csv",
    "backend_distributed_engineers.csv"
  ];

  const handleRun = () => {
    onRun(jobDescription, shortlistSize, githubSignals, candidateFile);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Hero Heading Section */}
      <section className="space-y-4">
        <h2 className="font-sans text-[32px] md:text-[38px] font-black text-on-surface tracking-tight leading-tight">
          Find the <span className="text-primary italic font-medium">right candidate</span>, not just the matching keyword.
        </h2>
        <p className="text-on-surface-variant text-[16px] max-w-xl leading-relaxed">
          TalentLens uses behavioral semantic analysis to rank candidates based on deep-fit signals rather than resume density.
        </p>
      </section>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Job Spec Ingestion */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant flex-1 flex flex-col">
            {/* Tabs Selector */}
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`pb-2 px-1 font-label-caps text-[11px] uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === "paste"
                      ? "text-primary border-primary font-semibold"
                      : "text-on-surface-variant border-transparent hover:text-on-surface"
                  }`}
                >
                  Paste Description
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`pb-2 px-1 font-label-caps text-[11px] uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === "upload"
                      ? "text-primary border-primary font-semibold"
                      : "text-on-surface-variant border-transparent hover:text-on-surface"
                  }`}
                >
                  Upload PDF
                </button>
              </div>
              <FileText className="text-on-surface-variant" size={18} />
            </div>

            {/* Ingestion Panels */}
            {activeTab === "paste" ? (
              <div className="flex-1 flex flex-col h-[380px]">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full flex-1 bg-surface-container-low border border-outline-variant rounded-lg p-4 font-body-md text-on-surface text-[14px] placeholder:text-outline focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Paste the job requirements, behavioral expectations, and technical stack here..."
                />
              </div>
            ) : (
              <div 
                className="h-[380px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low cursor-pointer hover:border-primary transition-colors group"
                onClick={() => {
                  alert("PDF ingestion requires OCR alignment. Simulated parsing successful! File has been locked.");
                  setActiveTab("paste");
                }}
              >
                <Upload className="text-outline group-hover:text-primary transition-colors mb-3" size={40} />
                <p className="font-headline-sm text-on-surface font-semibold text-[16px]">Upload Job Spec</p>
                <p className="font-body-sm text-on-surface-variant mt-1 text-[12px]">Supports PDF, DOCX, TXT</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Pool Ingestions */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                <h3 className="font-label-caps text-[11px] text-on-surface font-semibold tracking-wider uppercase flex items-center gap-2">
                  <Users size={16} />
                  Candidate Ingestion
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={candidateFile} 
                    onChange={(e) => setCandidateFile(e.target.value)}
                    className="bg-surface-container-high border border-outline-variant text-on-surface text-[11px] font-label-caps rounded px-2 py-1 outline-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {sampleFiles.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden h-[300px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-[12px]">
                    <thead className="bg-surface-variant text-on-surface-variant border-b border-outline-variant font-label-caps text-[10px]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">NAME</th>
                        <th className="px-4 py-3 font-semibold">CURRENT ROLE</th>
                        <th className="px-4 py-3 font-semibold">LOCATION</th>
                        <th className="px-4 py-3 font-semibold text-center">LINKEDIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-on-surface-variant">
                      <tr className="hover:bg-surface-variant/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">Alex Rivera</td>
                        <td className="px-4 py-3">Senior Engineer @ Vercel</td>
                        <td className="px-4 py-3">Remote (US)</td>
                        <td className="px-4 py-3 text-center">
                          <ExternalLink size={14} className="mx-auto text-outline" />
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-variant/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">Samantha Lee</td>
                        <td className="px-4 py-3">Technical Lead @ Stripe</td>
                        <td className="px-4 py-3">San Francisco, CA</td>
                        <td className="px-4 py-3 text-center">
                          <ExternalLink size={14} className="mx-auto text-outline" />
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-variant/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">Julian Chen</td>
                        <td className="px-4 py-3">Lead Architect @ Airbnb</td>
                        <td className="px-4 py-3">New York, NY</td>
                        <td className="px-4 py-3 text-center">
                          <ExternalLink size={14} className="mx-auto text-outline" />
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-variant/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">Maria Gonzalez</td>
                        <td className="px-4 py-3">Founding Engineer @ Stealth</td>
                        <td className="px-4 py-3">Austin, TX</td>
                        <td className="px-4 py-3 text-center">
                          <ExternalLink size={14} className="mx-auto text-outline" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-outline-variant/30 text-center bg-surface-container-low/50">
                  <p className="text-outline text-[12px] font-label-caps flex items-center justify-center gap-1.5">
                    <Database size={12} />
                    Total 42 candidates detected in <span className="text-on-surface">{candidateFile}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[12px] border-t border-outline-variant/30 pt-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-green"></span>
                <span className="text-on-surface-variant italic">Data parsing successful</span>
              </div>
              <p className="text-outline font-label-caps">Format: material-ui standard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Configuration Panel */}
      <section className="w-full">
        <div className="glass-panel rounded-xl p-5 border border-outline-variant">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            {/* Range slider for Shortlist Goals */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                  Target Shortlist Size
                </label>
                <span className="font-data-mono text-primary font-bold text-[14px]">
                  {shortlistSize} Candidates
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={shortlistSize}
                onChange={(e) => setShortlistSize(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-1 text-[9px] text-outline font-label-caps tracking-tight">
                <span>QUICK SCAN (5)</span>
                <span>DEEP DIVE (50)</span>
              </div>
            </div>

            {/* Toggle Switch for OSS Signals */}
            <div className="flex items-center justify-between border-l border-outline-variant/30 pl-0 md:pl-6 w-full md:w-auto gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-variant rounded-lg text-on-surface-variant">
                  <Terminal size={18} />
                </div>
                <div>
                  <h4 className="font-label-caps text-[11px] uppercase tracking-wider text-on-surface font-semibold">
                    Enable GitHub Signals
                  </h4>
                  <p className="text-[12px] text-on-surface-variant leading-tight">
                    Cross-reference OSS activity for technical depth
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGithubSignals(!githubSignals)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                  githubSignals ? "bg-primary" : "bg-surface-variant"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-surface-container rounded-full transition-transform duration-200 ${
                    githubSignals ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* CTA action button */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={handleRun}
                className="group relative w-full md:w-[260px] h-14 bg-primary text-on-primary font-sans text-[16px] font-bold rounded-lg overflow-hidden flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/25 cursor-pointer"
              >
                <span>Run TalentLens</span>
                <Zap size={16} fill="currentColor" className="group-hover:translate-x-1 duration-200 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5">
            <Bot size={20} fill="rgba(107,216,203,0.1)" />
          </div>
          <div>
            <p className="font-label-caps text-[9px] text-outline tracking-wider uppercase">TRUST FACTOR</p>
            <p className="font-sans text-[14px] text-on-surface font-semibold">Evidence-Backed Scoring</p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5">
            <Zap size={20} fill="rgba(107,216,203,0.1)" />
          </div>
          <div>
            <p className="font-label-caps text-[9px] text-outline tracking-wider uppercase">ANALYTICS ENGINE</p>
            <p className="font-sans text-[14px] text-on-surface font-semibold">Semantic Behavioral Fit</p>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary bg-primary/5">
            <Users size={20} />
          </div>
          <div>
            <p className="font-label-caps text-[9px] text-outline tracking-wider uppercase">BIAS MITIGATION</p>
            <p className="font-sans text-[14px] text-on-surface font-semibold">Anonymized Merit Ranking</p>
          </div>
        </div>
      </section>
    </div>
  );
}
