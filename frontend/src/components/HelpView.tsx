import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Mail,
  ExternalLink
} from "lucide-react";
import { MOCK_FAQS } from "../data/mockData";

export default function HelpView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

  const filteredFaqs = MOCK_FAQS.filter((faq) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  });

  const toggleFaq = (id: string) => {
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Title brief */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-primary" size={18} />
          <span className="text-primary font-label-caps text-[11px] uppercase tracking-widest font-bold">
            Documentation Center
          </span>
        </div>
        <h2 className="font-sans text-[28px] md:text-[32px] font-black text-on-surface">
          Knowledge Base & Support
        </h2>
        <p className="text-on-surface-variant font-body-lg text-[14px]">
          Have questions about semantic mapping, bias compliance, or billing? Explore our step-by-step guides.
        </p>
      </div>

      {/* Interactive search panel */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FAQs, documentation, or compliance briefings..."
          className="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-[13px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant outline-none"
        />
      </div>

      {/* Bento grid: Quick Help Topics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <BookOpen size={18} />
            </div>
            <h3 className="font-headline-sm text-on-surface text-[15px] font-bold">Semantic Core</h3>
            <p className="text-[12.5px] text-on-surface-variant mt-2 leading-relaxed">
              Learn how our language parsing models map candidates to your job description using context embeddings rather than absolute text keywords matching.
            </p>
          </div>
          <button 
            onClick={() => alert("Opening Semantic Mapping specification pdf")}
            className="text-primary text-[11px] font-label-caps font-bold mt-4 flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            Read Specification
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-4">
              <ShieldCheck size={18} fill="rgba(192,193,255,0.1)" />
            </div>
            <h3 className="font-headline-sm text-on-surface text-[15px] font-bold">NYC Bias Auditing</h3>
            <p className="text-[12.5px] text-on-surface-variant mt-2 leading-relaxed">
              TalentLens complies fully with AEDT (Automated Employment Decision Tools) mandates, providing PII masking, anonymous scoring, and third-party bias audits.
            </p>
          </div>
          <button 
            onClick={() => alert("Examine third-party bias scorecard")}
            className="text-secondary text-[11px] font-label-caps font-bold mt-4 flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            Review Compliance Scorecard
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="bg-surface-container p-5 rounded-xl border border-outline-variant flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-9 h-9 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary mb-4">
              <Layers size={18} />
            </div>
            <h3 className="font-headline-sm text-on-surface text-[15px] font-bold">Calibration Rules</h3>
            <p className="text-[12.5px] text-on-surface-variant mt-2 leading-relaxed">
              Tune your behavioral dimensions matrix. Refine importance weights across Quantified Impact, Mentorship, and System Depth dynamically to shape recommendations.
            </p>
          </div>
          <button 
            onClick={() => alert("Download weighting guideline manual")}
            className="text-tertiary text-[11px] font-label-caps font-bold mt-4 flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            View Weight Manual
            <ExternalLink size={12} />
          </button>
        </div>

      </section>

      {/* Accordion FAQ Area */}
      <section className="space-y-4">
        <h3 className="font-sans text-[18px] font-semibold text-on-surface">Frequently Asked Questions</h3>

        <div className="space-y-3 font-sans">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left px-5 py-4 focus:outline-none flex justify-between items-center bg-surface-container hover:bg-surface-variant/30 select-none cursor-pointer"
                  >
                    <span className="font-medium text-[14px] text-on-surface pr-4">
                      {faq.question}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="text-primary shrink-0" size={18} />
                    ) : (
                      <ChevronDown className="text-on-surface-variant shrink-0" size={18} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-on-surface-variant text-[13px] leading-relaxed select-text border-t border-outline-variant/30 bg-surface-container-low/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-on-surface-variant italic text-center py-6">
              No answers matched your query. Contact us at <strong className="text-primary">support@talentlens.ai</strong> for instant help.
            </p>
          )}
        </div>
      </section>

      {/* Sticky Support CTA Card */}
      <footer className="bg-gradient-to-r from-primary-container-low/10 to-surface-container p-6 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <h4 className="font-headline-sm text-primary font-bold text-[16px] flex items-center gap-2">
            <Cpu size={16} />
            Need Dedicated Custom Integrations?
          </h4>
          <p className="text-on-surface-variant text-[12.5px] mt-1 pr-4 max-w-2xl leading-relaxed">
            We provide direct database tunneling, custom LLM fine-tuning, and SLA integrations for Enterprise recruitment teams. Let's schedule an architectural overview session.
          </p>
        </div>
        <button
          onClick={() => {
            alert("Email triggered to integration-engineering@talentlens.ai from recruitment pod.");
          }}
          className="bg-primary text-on-primary font-label-caps font-bold px-6 py-3 rounded-lg text-[11px] uppercase whitespace-nowrap hover:brightness-110 cursor-pointer shadow-md shadow-primary/10 transition-all shrink-0 text-center flex items-center justify-center gap-2"
        >
          <Mail size={13} />
          Contact Core Engineering
        </button>
      </footer>
    </div>
  );
}
