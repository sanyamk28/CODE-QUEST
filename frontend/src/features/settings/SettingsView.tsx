import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Bell,
  Shield,
  Save,
  Camera,
  CheckCircle2,
  Sparkles,
  Briefcase
} from 'lucide-react';

interface SettingsViewProps {
  userName: string;
  targetRole: string;
  onUpdateProfile: (name: string, role: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userName,
  targetRole,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications' | 'security'>('account');
  const [fullName, setFullName] = useState(userName || 'Sanyam Kumar');
  const [username, setUsername] = useState('sanyam_kumar');
  const [role, setRole] = useState(targetRole || 'Data Engineer');
  const [bio, setBio] = useState('Passionate about data engineering and building scalable systems.');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (userName) setFullName(userName);
  }, [userName]);

  useEffect(() => {
    if (targetRole) setRole(targetRole);
  }, [targetRole]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(fullName, role);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const roleSuggestions = [
    'Data Engineer',
    'AI / Machine Learning Engineer',
    'Software Engineer',
    'Backend Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Cloud / DevOps Engineer',
    'Systems Architect',
    'Cybersecurity Analyst',
    'Data Scientist',
    'Quantitative Developer'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
      {/* Left Settings Tabs (~3 cols) matching Photo 12 */}
      <div className="lg:col-span-3 bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Settings</h2>

        {[
          { id: 'account', label: 'Account', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Area (~9 cols) matching Photo 12 */}
      <div className="lg:col-span-9 bg-[#0b101e] border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-white">Account Settings</h1>
            <p className="text-xs text-slate-400">Manage your profile details and target job role</p>
          </div>
          {savedFeedback && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-xl">
              <CheckCircle2 className="h-4 w-4" />
              <span>Changes saved successfully!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5 max-w-xl">
          {/* Avatar with Change Photo button */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-md">
              {fullName.substring(0, 2).toUpperCase() || 'SK'}
            </div>
            <div>
              <button
                type="button"
                onClick={() => alert('Photo updated successfully!')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2"
              >
                <Camera className="h-3.5 w-3.5 text-sky-400" />
                <span>Change Photo</span>
              </button>
              <div className="text-[10px] text-slate-500 mt-1">JPG, GIF or PNG. Max size 2MB</div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0e1424] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0e1424] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition font-mono"
              required
            />
          </div>

          {/* Target Role / Position - User can type ANY custom role */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-sky-400" />
                Target Job Role / Position
              </label>
              <span className="text-[10px] text-slate-400">Type any title or select below</span>
            </div>

            <div className="relative">
              <input
                type="text"
                list="roles-list"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Data Engineer, AI/ML Researcher, Cloud Architect..."
                className="w-full bg-[#0e1424] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition font-medium"
                required
              />
              <datalist id="roles-list">
                {roleSuggestions.map((sug) => (
                  <option key={sug} value={sug} />
                ))}
              </datalist>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Data Engineer', 'AI Engineer', 'Backend Dev', 'Full Stack', 'Cloud Architect'].map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => setRole(chip)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                    role === chip
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#0e1424] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition leading-relaxed"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
