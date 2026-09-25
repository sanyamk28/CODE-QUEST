import React, { useState, useEffect } from 'react';
import { ActiveTabType } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNavBar } from './components/MobileNavBar';
import { MobileHeader } from './components/MobileHeader';

// Feature Views
import { AuthView } from './features/auth/AuthView';
import { DashboardView } from './features/dashboard/DashboardView';
import { PracticeHubView } from './features/practice/PracticeHubView';
import { ArenaView } from './features/arena/ArenaView';
import { SqlLabView } from './features/sql/SqlLabView';
import { BattleArenaView } from './features/battles/BattleArenaView';
import { AiInterviewView } from './features/interview/AiInterviewView';
import { ResumeAtsView } from './features/resume/ResumeAtsView';
import { RoadmapsView } from './features/roadmaps/RoadmapsView';
import { AssessmentsView } from './features/assessments/AssessmentsView';
import { LeaderboardView } from './features/leaderboard/LeaderboardView';
import { ProfileView } from './features/profile/ProfileView';
import { SettingsView } from './features/settings/SettingsView';
import { CsFundamentalsView } from './features/mcqs/CsFundamentalsView';
import { BrainteasersView } from './features/puzzles/BrainteasersView';
import { CompanyScraperAgentView } from './features/company/CompanyScraperAgentView';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Global user state
  const [userName, setUserName] = useState<string>('Sanyam Kumar');
  const [targetRole, setTargetRole] = useState<string>('Data Engineer');
  const [streak, setStreak] = useState<number>(12);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isPhonePreview, setIsPhonePreview] = useState<boolean>(false);
  const [isNativeMobile, setIsNativeMobile] = useState<boolean>(false);

  // Detect screen size for automatic responsive behavior
  useEffect(() => {
    const checkScreen = () => {
      setIsNativeMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleLoginSuccess = (name: string, role: string) => {
    if (name) setUserName(name);
    if (role) setTargetRole(role);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('splash');
  };

  const handleUpdateProfile = (name: string, role: string) => {
    setUserName(name);
    setTargetRole(role);
  };

  // If user selected 'login', 'splash', or is logged out, render AuthView
  if (activeTab === 'login' || activeTab === 'splash' || !isLoggedIn) {
    return (
      <AuthView
        initialScreen={activeTab === 'login' ? 'login' : 'splash'}
        onLoginSuccess={handleLoginSuccess}
        onSkipToDashboard={() => {
          setIsLoggedIn(true);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Render the core view content
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            userName={userName}
            targetRole={targetRole}
            onNavigate={setActiveTab}
          />
        );
      case 'practice':
        return <PracticeHubView onNavigate={setActiveTab} />;
      case 'arena':
        return <ArenaView />;
      case 'sql':
        return <SqlLabView />;
      case 'battle':
        return <BattleArenaView />;
      case 'interview':
        return <AiInterviewView />;
      case 'resume':
        return <ResumeAtsView targetRole={targetRole} />;
      case 'roadmaps':
        return <RoadmapsView />;
      case 'assessments':
        return <AssessmentsView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'profile':
        return (
          <ProfileView
            userName={userName}
            targetRole={targetRole}
            streak={streak}
            onUpdateRole={(newRole) => setTargetRole(newRole)}
          />
        );
      case 'settings':
        return (
          <SettingsView
            userName={userName}
            targetRole={targetRole}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'company-intel':
        return (
          <CompanyScraperAgentView
            userRole={targetRole}
            onNavigate={setActiveTab}
          />
        );
      case 'mcqs':
        return <CsFundamentalsView />;
      case 'puzzles':
        return <BrainteasersView />;
      default:
        return (
          <DashboardView
            userName={userName}
            targetRole={targetRole}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  // If in Phone Preview frame mode on desktop
  if (isPhonePreview && !isNativeMobile) {
    return (
      <div className="min-h-screen bg-[#04060c] text-slate-100 flex flex-col items-center justify-center p-4 font-['Plus_Jakarta_Sans'] select-none">
        {/* Frame Top Switcher Bar */}
        <div className="w-full max-w-md flex items-center justify-between py-2 px-4 mb-3 bg-[#090d16] border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Mobile App Simulator (390 × 844)</span>
          </div>
          <button
            onClick={() => setIsPhonePreview(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Switch to Web</span>
          </button>
        </div>

        {/* iPhone Frame */}
        <div className="w-[390px] h-[844px] bg-[#070a13] rounded-[48px] border-[10px] border-slate-800/90 shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative ring-1 ring-slate-700/50">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <span className="h-2 w-2 rounded-full bg-blue-900/60" />
          </div>

          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-400 z-40 bg-[#070a13]">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span className="text-[10px]">100%</span>
            </div>
          </div>

          {/* Mobile App Header with Back button */}
          <MobileHeader
            activeTab={activeTab}
            userName={userName}
            targetRole={targetRole}
            streak={streak}
            onSelectTab={setActiveTab}
          />

          {/* Mobile Screen Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 scrollbar-none">
            {renderCurrentView()}
          </div>

          {/* Fixed Mobile Bottom Nav Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-50">
            <MobileNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
          </div>
        </div>
      </div>
    );
  }

  // Standard Responsive View (Web on Desktop, Native App on Mobile)
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-['Plus_Jakarta_Sans']">
      {/* Desktop Left Sidebar (hidden on mobile) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userName={userName}
        targetRole={targetRole}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070a13]">
        {/* Mobile Header (rendered on mobile) */}
        <div className="md:hidden">
          <MobileHeader
            activeTab={activeTab}
            userName={userName}
            targetRole={targetRole}
            streak={streak}
            onSelectTab={setActiveTab}
          />
        </div>

        {/* Desktop Header (rendered on md and up) */}
        <div className="hidden md:block">
          <Header
            activeTab={activeTab}
            userName={userName}
            targetRole={targetRole}
            streak={streak}
            onSelectTab={setActiveTab}
            isPhonePreview={isPhonePreview}
            onTogglePhonePreview={() => setIsPhonePreview(!isPhonePreview)}
          />
        </div>

        {/* Dynamic View Container */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto pb-24 md:pb-6">
          {renderCurrentView()}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (rendered on mobile) */}
        <div className="md:hidden">
          <MobileNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default App;
