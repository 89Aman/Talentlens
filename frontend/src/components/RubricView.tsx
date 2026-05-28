import React, { useState } from "react";
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Flame,
  Wand2,
  ListFilter,
  ArrowRight
} from "lucide-react";
import { RubricDimension } from "../types";

interface RubricViewProps {
  rubric: RubricDimension[];
  onUpdateRubric: (updatedRubric: RubricDimension[]) => void;
  onContinue: () => void;
}

export default function RubricView({ rubric, onUpdateRubric, onContinue }: RubricViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleWeightChange = (index: number, val: number) => {
    const updated = [...rubric];
    updated[index].weight = val;
    onUpdateRubric(updated);
  };

  const handleNormalizeWeights = () => {
    const sum = rubric.reduce((acc, curr) => acc + curr.weight, 0);
    if (sum === 0) return;
    const normalized = rubric.map((dim) => ({
      ...dim,
      weight: Math.round((dim.weight / sum) * 100)
    }));
    // adjust rounding error to sum to exactly 100
    const finalSum = normalized.reduce((acc, curr) => acc + curr.weight, 0);
    if (finalSum !== 100 && normalized.length > 0) {
      normalized[0].weight += (100 - finalSum);
    }
    onUpdateRubric(normalized);
  };

  const totalWeight = rubric.reduce((sum, item) => sum + item.weight, 0);

  // SVG calculations for the dynamic donut chart
  let cumulativeOffset = 0;
  const donutSegments = rubric.map((dim) => {
    const percentage = totalWeight > 0 ? (dim.weight / totalWeight) * 100 : 0;
    const dashArray = `${percentage} ${100 - percentage}`;
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += percentage;

    let strokeColor = "#cbd5e1"; // fallback slate-300
    if (dim.id === "ml-system") strokeColor = "#2563eb"; // blue-600
    else if (dim.id === "quantified-impact") strokeColor = "#4f46e5"; // indigo-600
    else if (dim.id === "research-bridge") strokeColor = "#f59e0b"; // amber-500
    else if (dim.id === "distributed-computing") strokeColor = "#10b981"; // emerald-500
    else if (dim.id === "leadership-mentorship") strokeColor = "#64748b"; // slate-500

    return {
      id: dim.id,
      name: dim.name,
      percentage,
      dashArray,
      dashOffset,
      strokeColor
    };
  });

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Page header and Continue to rankings button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6 py-2">
        <div>
          <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">Rubric Calibration</span>
          <h1 className="font-sans text-[28px] md:text-[32px] font-bold text-on-surface">
            Evaluation Rubric — Senior ML Engineer
          </h1>
          <p className="text-on-surface-variant font-body-lg text-[14px] mt-1">
            Defined from JD: "Lead the development of high-scale recommendation engines and neural search architectures."
          </p>
        </div>
        <button
          onClick={onContinue}
          className="bg-primary text-on-primary font-label-caps font-semibold text-[12px] uppercase px-6 py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10"
        >
          Continue to Rankings
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Dimensions Cards LIST (8/12) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {rubric.map((dim, idx) => {
            let accentBorderColor = "border-primary";
            let indicatorBg = "bg-primary";
            if (dim.id === "quantified-impact") {
              accentBorderColor = "border-secondary";
              indicatorBg = "bg-secondary";
            } else if (dim.id === "research-bridge") {
              accentBorderColor = "border-tertiary";
              indicatorBg = "bg-tertiary";
            } else if (dim.id === "distributed-computing") {
              accentBorderColor = "border-success-green";
              indicatorBg = "bg-success-green";
            } else if (dim.id === "leadership-mentorship") {
              accentBorderColor = "border-outline";
              indicatorBg = "bg-outline";
            }

            return (
              <div
                key={dim.id}
                className="bg-surface-container p-5 rounded-xl border border-outline-variant relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${indicatorBg}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="max-w-[75%]">
                    <h3 className="font-headline-sm text-on-surface text-[18px] font-semibold flex items-center gap-2">
                      {dim.name}
                    </h3>
                    <p className="text-[12px] md:text-[13px] text-on-surface-variant mt-1">
                      {dim.description}
                    </p>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded border border-outline-variant">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={dim.weight}
                        onChange={(e) => handleWeightChange(idx, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-12 bg-transparent text-primary text-center font-data-mono text-[13px] outline-none"
                      />
                      <span className="font-data-mono text-outline text-[12px]">%</span>
                    </div>
                  ) : (
                    <div className="bg-primary-container-low border border-primary/20 text-primary font-data-mono px-3 py-1 rounded-full text-[12px] font-bold">
                      {dim.weight}% Weight
                    </div>
                  )}
                </div>

                {/* Weights slider control in editing mode */}
                {isEditing && (
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={dim.weight}
                      onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                      className="w-full h-1 bg-surface-variant rounded-lg cursor-pointer accent-primary"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Progress Signals display bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-caps text-[10px] tracking-wider text-on-surface-variant">
                      <span>{dim.precisionSignalName}</span>
                      <span className="text-primary font-data-mono">{dim.precisionValue}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${indicatorBg}`}
                        style={{ width: `${dim.weight}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Signals list or blockquotes */}
                  {dim.id === "ml-system" && dim.keySignals && dim.redFlags && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                        <p className="font-label-caps text-[10px] uppercase text-primary font-bold mb-1.5">Key Signals</p>
                        <ul className="text-[12px] text-on-surface space-y-1">
                          {dim.keySignals.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                        <p className="font-label-caps text-[10px] uppercase text-warning-amber font-bold mb-1.5">Red Flags</p>
                        <ul className="text-[12px] text-on-surface space-y-1">
                          {dim.redFlags.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-warning-amber rounded-full"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {dim.id === "quantified-impact" && dim.evidenceText && (
                    <div className="bg-surface-container-low p-3 rounded-lg border-l-4 border-secondary/40 border border-outline-variant/30 italic text-[13px] text-on-surface leading-relaxed">
                      "{dim.evidenceText}"
                    </div>
                  )}

                  {dim.id === "research-bridge" && dim.tags && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {dim.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="bg-surface-variant text-on-surface px-2.5 py-1 rounded text-[11px] font-label-caps border border-outline-variant hover:text-primary transition-colors hover:border-primary/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Weight visualization and prompts AI Insights (4/12) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* SVG Donut Chart */}
          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col items-center shadow-md">
            <h3 className="font-headline-sm text-[16px] text-on-surface mb-6 w-full text-center font-bold">
              Weight Distribution
            </h3>
            
            <div className="relative w-44 h-44 mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle 
                  className="text-surface-variant" 
                  cx="18" 
                  cy="18" 
                  r="15.915" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="3"
                ></circle>
                
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.id}
                    className="donut-segment transition-all duration-300"
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke={seg.strokeColor}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    strokeWidth="3"
                  ></circle>
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`font-sans text-[26px] font-bold ${totalWeight === 100 ? "text-primary" : "text-error-red animate-pulse"}`}>
                  {totalWeight}%
                </span>
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wide leading-tight">
                  {totalWeight === 100 ? "Total Allocation" : "Requires 100%!"}
                </span>
              </div>
            </div>

            {/* Legends & sliders indicators */}
            <div className="w-full space-y-3 border-t border-outline-variant/40 pt-4">
              {donutSegments.map((seg) => {
                let dotColor = "bg-primary";
                if (seg.id === "quantified-impact") dotColor = "bg-secondary";
                else if (seg.id === "research-bridge") dotColor = "bg-tertiary";
                else if (seg.id === "distributed-computing") dotColor = "bg-success-green";
                else if (seg.id === "leadership-mentorship") dotColor = "bg-outline";

                return (
                  <div key={seg.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden truncate max-w-[80%]">
                      <span className={`w-2.5 h-2.5 rounded ${dotColor} shrink-0`}></span>
                      <span className="text-[12px] text-on-surface-variant truncate">{seg.name}</span>
                    </div>
                    <span className="font-data-mono text-[12px] text-on-surface font-semibold shrink-0">
                      {Math.round(seg.percentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
            
            {totalWeight !== 100 && (
              <button
                onClick={handleNormalizeWeights}
                className="mt-4 w-full bg-error-red/10 hover:bg-error-red/20 text-error border border-error-red/20 py-2 rounded text-[11px] font-label-caps tracking-wide font-semibold cursor-pointer transition-colors"
              >
                Auto-Normalize to 100%
              </button>
            )}
          </div>

          {/* AI Insights Insights Brief */}
          <div className="bg-surface-container-high p-5 rounded-xl border border-outline-variant shadow-lg">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles size={14} className="animate-pulse" />
              <span className="font-label-caps text-[11px] font-semibold uppercase tracking-wider">AI Insight</span>
            </div>
            
            <p className="text-[13px] text-on-surface leading-relaxed">
              Based on your JD, TalentLens has weighted <strong className="text-primary font-semibold">ML System Depth</strong> highest. This aligns perfectly with the recruitment expectation for "high-scale recommendation engines" which necessitates deep low-latency infrastructure knowledge over theoretical pure research.
            </p>
            
            <hr className="my-4 border-outline-variant/40" />
            
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-on-surface-variant font-body-sm">Confidence Level:</span>
              <span className="flex items-center gap-1.5 text-success-green font-semibold">
                <span className="w-1.5 h-1.5 bg-success-green rounded-full"></span>
                High Confidence
              </span>
            </div>
          </div>

          {/* Generative Image Showcase */}
          <div className="rounded-xl overflow-hidden border border-outline-variant group">
            <img
              alt="Machine Learning Data Visualizer"
              className="w-full h-36 object-cover brightness-75 group-hover:scale-105 duration-700 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiuJyAmOzEPg5GFxVbNtq00gGvE8Jm2t7TI1cSeBuKKi9tS2xDlNOVjUtQ0kODZaO0rjRJpv-tHoTIVVMl-reevdDKG3mfI4LmnkEgiVKElKiOa-5S3dKTkj5GGVgtV0im0H4klt7tpZhgemcgD4krpogxML3dId0SovXSA0vNG_r6nZjCUB2j89HHjJWL-4QdlKwZ44cBrm6vyTTHNtgA4w1LDC-NNyvIB7vRKg2fJMDevSRVpWpKI926BlHEzui7OV-o-WYAfNuI"
            />
            <div className="bg-surface-container p-3 flex justify-between items-center text-[12px]">
              <span className="text-on-surface-variant italic">Generated from JD Analysis</span>
              <CheckCircle2 size={14} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Contextual Bar */}
      <div className="sticky bottom-6 left-0 right-0 bg-surface-container/90 backdrop-blur-md border border-outline-variant p-4 rounded-xl shadow-2xl flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <Info className="text-on-surface-variant hidden sm:block shrink-0" size={18} />
          <p className="text-[13px] text-on-surface font-body-sm">
            {isEditing 
              ? "Change weights using the sliders. Click Normalize or click Done to save weights." 
              : "Weights represent the focus level. You can manually refine weights in Edit mode."
            }
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2 hover:bg-surface-variant border border-outline rounded-lg text-[11px] font-label-caps uppercase transition-colors pointer-events-auto cursor-pointer"
          >
            {isEditing ? "Save & Lock" : "Edit Weights"}
          </button>
          
          <button
            onClick={onContinue}
            disabled={totalWeight !== 100}
            className="px-6 py-2 bg-primary text-on-primary font-label-caps font-semibold text-[11px] uppercase rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue Rankings
          </button>
        </div>
      </div>
    </div>
  );
}
