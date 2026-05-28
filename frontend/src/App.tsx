/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  DEFAULT_CANDIDATES, 
  DEFAULT_RUBRIC, 
  REJECTED_CANDIDATES 
} from "./data/mockData";
import { Candidate, RubricDimension, ViewType } from "./types";

// Import modular components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import RubricView from "./components/RubricView";
import RankingsView from "./components/RankingsView";
import DetailView from "./components/DetailView";
import RejectedView from "./components/RejectedView";
import ExportView from "./components/ExportView";
import HelpView from "./components/HelpView";

// Import new fully functional interactive modals and screens
import NotificationsModal, { SystemNotification } from "./components/NotificationsModal";
import SettingsModal from "./components/SettingsModal";
import ProfileModal from "./components/ProfileModal";
import LogoutModal from "./components/LogoutModal";
import LockScreen from "./components/LockScreen";

import { Cpu, RefreshCw, Sparkles, CheckCircle } from "lucide-react";

export default function App() {
  const [currentView, setView] = useState<ViewType>("home");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("elena-rodriguez");
  const [rubric, setRubric] = useState<RubricDimension[]>(DEFAULT_RUBRIC);
  const [candidates, setCandidates] = useState<Candidate[]>(DEFAULT_CANDIDATES);
  const [rejectedCandidates, setRejectedCandidates] = useState(REJECTED_CANDIDATES);
  
  // Immersive AI analyzer state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStateText, setAnalysisStateText] = useState("Loading language models...");

  // Interactive dialog visibility states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Recruiter Profile Identity state
  const [userProfileName, setUserProfileName] = useState("Jane Doe");
  const [recruiterPersonaTitle, setRecruiterPersonaTitle] = useState("Principal Technical Recruiter");
  const [recruiterPersonaTeam, setRecruiterPersonaTeam] = useState("Enterprise Core Dev");

  // Custom Settings calibration states
  const [biasAuditMode, setBiasAuditMode] = useState(true);
  const [autoReRankEnabled, setAutoReRankEnabled] = useState(true);
  const [retentionThreshold, setRetentionThreshold] = useState(70);
  const [currentCluster, setCurrentCluster] = useState("East-Cluster (Primary)");

  // Real System Notification logs list
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "notif-1",
      title: "Model Calibration Succeeded",
      description: "Rubric dimension coefficients computed. Confidence boundaries normalized across 5 criteria dimensions.",
      time: "2 mins ago",
      type: "success",
      read: false,
    },
    {
      id: "notif-2",
      title: "Talent Vector Space Refreshed",
      description: "Finished matching 6 major candidates against high-performance ML System engineering criteria.",
      time: "10 mins ago",
      type: "info",
      read: false,
    },
    {
      id: "notif-3",
      title: "NYC Audit Compliance Clean",
      description: "Checked Local Law 144 compliance rules. No adverse technical bias detected in active calibrated weights.",
      time: "1 hour ago",
      type: "success",
      read: true,
    },
    {
      id: "notif-4",
      title: "Notice: Strict Retention Filter",
      description: "Custom retention score filter active at 70%. Candidates below this bar automatically bypass live review rankings.",
      time: "3 hours ago",
      type: "warning",
      read: true,
    },
  ]);

  // Handler for triggering TalentLens AI Ranking evaluation with a cool animation
  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStateText("Pasting job requirements and matching embeddings...");

    // Record unread starting notification log
    const startLog: SystemNotification = {
      id: "notif-start-" + Date.now(),
      title: "AI Analysis Scan Triggered",
      description: `Analyzing live candidate databases against configured criteria weights on cluster ${currentCluster}.`,
      time: "Just Now",
      type: "info",
      read: false,
    };
    setNotifications(prev => [startLog, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleResetAllData = () => {
    setRubric(DEFAULT_RUBRIC);
    setCandidates(DEFAULT_CANDIDATES);
    setRejectedCandidates(REJECTED_CANDIDATES);
    setUserProfileName("Jane Doe");
    setRecruiterPersonaTitle("Principal Technical Recruiter");
    setRecruiterPersonaTeam("Enterprise Core Dev");
    setBiasAuditMode(true);
    setAutoReRankEnabled(true);
    setRetentionThreshold(70);
    setCurrentCluster("East-Cluster (Primary)");
    
    // reset notifications list
    setNotifications([
      {
        id: "notif-reset-" + Date.now(),
        title: "Workspace Hard Reset Done",
        description: "Successfully cleared all parameters, customized weights, and restored initial candidate rosters.",
        time: "Just Now",
        type: "success",
        read: false,
      }
    ]);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const next = prev + 5;
        
        // Progress stage thresholds mapping detailed visual telemetry states
        if (next === 20) {
          setAnalysisStateText("Parsing candidate portfolio resumes...");
        } else if (next === 45) {
          setAnalysisStateText("Running behavioral semantic contrast maps...");
        } else if (next === 70) {
          setAnalysisStateText("Aligning GitHub stars, commit vectors & technical depth signals...");
        } else if (next === 90) {
          setAnalysisStateText("Finalizing confidence factors & Elo calibrations...");
        } else if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setView("rankings");

            // Post analysis success notification
            const endLog: SystemNotification = {
              id: "notif-end-" + Date.now(),
              title: "AI Analysis Scan Completed",
              description: "Shortlist confidence matrix recalibrated successfully. All active profiles indexed.",
              time: "Just Now",
              type: "success",
              read: false,
            };
            setNotifications(prev => [endLog, ...prev]);
          }, 600);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isAnalyzing, currentCluster]);

  // Map active views titles & subtitles
  let viewTitle = "Home";
  let viewSubtitle = "Setup your candidate analysis parameters";

  if (currentView === "rubric") {
    viewTitle = "Calibration";
    viewSubtitle = "Inspect and customize criteria weights";
  } else if (currentView === "rankings") {
    viewTitle = "Rankings";
    viewSubtitle = `Displaying evaluated candidate list`;
  } else if (currentView === "detail") {
    viewTitle = "Inspector";
    viewSubtitle = "Deep dive into selected behavioral and code evidence";
  } else if (currentView === "rejected") {
    viewTitle = "Hard Gaps";
    viewSubtitle = "Audit log of candidates failing baseline criteria";
  } else if (currentView === "export") {
    viewTitle = "Export";
    viewSubtitle = "Share shortlist briefs with recruitment pipelines";
  } else if (currentView === "help") {
    viewTitle = "Help Hub";
    viewSubtitle = "Platform specifications, NYC bias auditing compliance & manuals";
  }

  // Handle lockscreen mode if user is logged out
  if (isLoggedOut) {
    return (
      <LockScreen 
        defaultName={userProfileName} 
        onLogin={(name) => {
          if (name.trim()) setUserProfileName(name);
          setIsLoggedOut(false);
          
          // Post session established notification
          const loginLog: SystemNotification = {
            id: "notif-login-" + Date.now(),
            title: "Security Session Established",
            description: `Dashboard unlocked under authorized user key: ${name}.`,
            time: "Just Now",
            type: "success",
            read: false,
          };
          setNotifications(prev => [loginLog, ...prev]);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex antialiased">
      
      {/* Sidebar Layout */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        onRunTalentLens={handleTriggerAnalysis} 
        onLogoutClick={() => setIsLogoutOpen(true)}
      />

      {/* Main Panel Area: padded left to clear the fixed sidebar */}
      <div className="flex-1 pl-[260px] flex flex-col relative min-h-screen bg-background/50">
        
        {/* Navigation Top Header */}
        <Header 
          title={viewTitle} 
          subtitle={viewSubtitle} 
          pipelineActive={candidates.length > 0} 
          onNotificationsClick={() => setIsNotificationsOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onProfileClick={() => setIsProfileOpen(true)}
          unreadNotificationsCount={notifications.filter(n => !n.read).length}
          userProfileName={userProfileName}
        />

        {/* Dynamic Inner Page Loader Container */}
        <main className="flex-1 pb-16 relative">
          
          {isAnalyzing ? (
            /* Immersive Sci-Fi Neural Analyzer Panel */
            <div className="absolute inset-0 z-[100] bg-background/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="max-w-[480px] w-full glass-panel border border-outline-variant rounded-2xl p-8 space-y-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center text-primary relative">
                  <Cpu className="animate-spin-slow" size={32} />
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-primary animate-pulse" />
                </div>
                
                <div className="space-y-1.5 w-full">
                  <h3 className="font-headline-sm text-on-surface text-[18px] font-black tracking-tight flex items-center justify-center gap-2">
                    TalentLens AI Vector Parser
                  </h3>
                  <p className="text-[13px] text-primary/80 font-data-mono uppercase tracking-widest animate-pulse">
                    Scanning Candidate Database
                  </p>
                </div>

                {/* Progress bar container */}
                <div className="w-full space-y-2">
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden border border-outline-variant/30">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-100"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between font-data-mono text-[11px] text-on-surface-variant">
                    <span>{analysisProgress}% COMPLETED</span>
                    <span>1,248 TPS BOUND</span>
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant w-full min-h-[58px] flex items-center justify-center">
                  <p className="text-[12.5px] italic text-on-surface-variant leading-relaxed animate-in fade-in duration-300">
                    "{analysisStateText}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Static Page Switch Routing */
            <>
              {currentView === "home" && (
                <HomeView onRun={handleTriggerAnalysis} />
              )}

              {currentView === "rubric" && (
                <RubricView 
                  rubric={rubric} 
                  onUpdateRubric={setRubric} 
                  onContinue={() => setView("rankings")} 
                />
              )}

              {currentView === "rankings" && (
                <RankingsView 
                  candidates={candidates} 
                  onSelectCandidate={(id) => {
                    setSelectedCandidateId(id);
                    setView("detail");
                  }} 
                  biasAuditMode={biasAuditMode}
                />
              )}

              {currentView === "detail" && (
                <DetailView 
                  candidates={candidates} 
                  selectedCandidateId={selectedCandidateId} 
                  onSelectCandidate={setSelectedCandidateId} 
                  onBackToRankings={() => setView("rankings")} 
                />
              )}

              {currentView === "rejected" && (
                <RejectedView rejectedCandidates={rejectedCandidates} />
              )}

              {currentView === "export" && (
                <ExportView candidates={candidates} />
              )}

              {currentView === "help" && (
                <HelpView />
              )}
            </>
          )}

        </main>
      </div>

      {/* Interactive System Modals Overlay Collection */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        biasAuditMode={biasAuditMode}
        onToggleBiasAudit={setBiasAuditMode}
        autoReRankEnabled={autoReRankEnabled}
        onToggleAutoReRank={setAutoReRankEnabled}
        retentionThreshold={retentionThreshold}
        onChangeRetentionThreshold={setRetentionThreshold}
        currentCluster={currentCluster}
        onChangeCluster={setCurrentCluster}
        onResetAllData={handleResetAllData}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfileName={userProfileName}
        onUpdateName={setUserProfileName}
        recruiterPersonaTitle={recruiterPersonaTitle}
        onUpdateTitle={setRecruiterPersonaTitle}
        recruiterPersonaTeam={recruiterPersonaTeam}
        onUpdateTeam={setRecruiterPersonaTeam}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userProfileName={userProfileName}
        onConfirmLogout={() => setIsLoggedOut(true)}
      />

    </div>
  );
}

