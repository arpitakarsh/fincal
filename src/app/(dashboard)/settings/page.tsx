'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, Shield, Settings2, Bell, ShieldAlert,
  Loader2, CheckCircle2, AlertTriangle, Save
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'investor' | 'preferences' | 'account'>('profile');
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateData = (section: string, updatedData: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...updatedData }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="flex space-x-4 border-b border-gray-200 pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        {error || 'Failed to load settings'}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-12 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Tabs (Mobile Select / Desktop Tabs) */}
      <div className="border-b border-gray-200">
        {/* Mobile dropdown */}
        <div className="sm:hidden mb-4">
          <select
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
          >
            <option value="profile">Profile</option>
            <option value="investor">Investor Profile</option>
            <option value="preferences">Preferences</option>
            <option value="account">Account & Security</option>
          </select>
        </div>
        
        {/* Desktop tabs */}
        <nav className="hidden sm:-mb-px sm:flex sm:space-x-8" aria-label="Tabs">
          {[
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'investor', name: 'Investor Profile', icon: Shield },
            { id: 'preferences', name: 'Preferences', icon: Settings2 },
            { id: 'account', name: 'Account & Security', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Areas */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        {activeTab === 'profile' && (
          <ProfileSection user={data.user} showToast={showToast} updateData={updateData} />
        )}
        
        {activeTab === 'investor' && (
          <InvestorProfileSection profile={data.profile} showToast={showToast} updateData={updateData} />
        )}
        
        {activeTab === 'preferences' && (
          <PreferencesSection preferences={data.preferences} showToast={showToast} updateData={updateData} />
        )}
        
        {activeTab === 'account' && (
          <AccountSection showToast={showToast} />
        )}
      </div>
    </div>
  );
}

// --- Sections ---

function ProfileSection({ user, showToast, updateData }: { user: any, showToast: any, updateData: any }) {
  const [name, setName] = useState(user.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', data: { name } })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      updateData('user', { name });
      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center space-x-6">
        <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">Profile Picture</h3>
          <p className="text-xs text-gray-500 mt-1">Managed via Better Auth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email"
            disabled
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
            value={user.email}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isSubmitting || name === user.name}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

function InvestorProfileSection({ profile, showToast, updateData }: { profile: any, showToast: any, updateData: any }) {
  const [formData, setFormData] = useState({
    age: profile?.age || 30,
    currentCapital: profile?.currentCapital || 0,
    monthlyInvestmentCap: profile?.monthlyInvestmentCap || 0,
    annualIncome: profile?.annualIncome || 0,
    riskAppetite: profile?.riskAppetite || 'Moderate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', data: formData })
      });
      if (!res.ok) throw new Error('Failed to update investor profile');
      updateData('profile', formData);
      showToast('Investor Profile updated', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {!profile && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start text-amber-700">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold mb-1">Profile Incomplete</p>
            <p>You haven't completed your investor profile yet. Some AI features may be limited.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input 
              type="number"
              min="18"
              max="120"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Appetite</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.riskAppetite}
              onChange={(e) => setFormData({...formData, riskAppetite: e.target.value})}
            >
              <option value="Low">Low (Conservative)</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High (Aggressive)</option>
              <option value="Very High">Very High (Speculative)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Capital (₹)</label>
            <input 
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.currentCapital}
              onChange={(e) => setFormData({...formData, currentCapital: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment Cap (₹)</label>
            <input 
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.monthlyInvestmentCap}
              onChange={(e) => setFormData({...formData, monthlyInvestmentCap: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
            <input 
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.annualIncome}
              onChange={(e) => setFormData({...formData, annualIncome: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

function PreferencesSection({ preferences, showToast, updateData }: { preferences: any, showToast: any, updateData: any }) {
  const [formData, setFormData] = useState({
    theme: preferences?.theme || 'system',
    currency: preferences?.currency || 'INR',
    emailAlerts: preferences?.emailAlerts ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'preferences', data: formData })
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      updateData('preferences', formData);
      showToast('Preferences updated', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={formData.theme}
            onChange={(e) => setFormData({...formData, theme: e.target.value})}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Preference</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Currency</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={formData.currency}
            onChange={(e) => setFormData({...formData, currency: e.target.value})}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={formData.emailAlerts}
              onChange={(e) => setFormData({...formData, emailAlerts: e.target.checked})}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.emailAlerts ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-gray-500">Receive alerts for AI health checks and goal milestones.</p>
          </div>
        </label>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Preferences
        </button>
      </div>
    </form>
  );
}

function AccountSection({ showToast }: { showToast: any }) {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      await authClient.signOut({
        fetchOptions: { onSuccess: () => { window.location.href = '/login'; } }
      });
    } catch (err: any) {
      showToast(err.message, 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Account Security</h3>
        <p className="text-sm text-gray-500 mb-4">Password changes and connected accounts are managed through Better Auth.</p>
        <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Manage Login Options
        </button>
      </div>

      <div className="pt-8 border-t border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your FinCal account and all associated data (portfolio, goals, AI history). This action is irreversible.
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input 
                type="text"
                required
                className="w-full max-w-sm px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <button 
              type="submit"
              disabled={deleteConfirm !== 'DELETE' || isDeleting}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
              Permanently Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
