'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Settings2,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type SettingsData = {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  profile: any;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    currency: 'INR' | 'USD';
    emailAlerts: boolean;
  };
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'investor' | 'preferences' | 'account'
  >('profile');

  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');

        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }

        const json = await res.json();

        if (!json.success || !json.data) {
          throw new Error(json.error || 'Invalid profile response');
        }

        // IMPORTANT:
        // API returns { success, data: { user, profile, preferences } }
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'error'
  ) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const updateData = (section: string, updatedData: any) => {
    setData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [section]: {
          ...(prev as any)[section],
          ...updatedData,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span>{error || 'Failed to load settings'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}

          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        {/* Mobile dropdown */}
        <div className="sm:hidden mb-4">
          <select
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
            value={activeTab}
            onChange={(e) =>
              setActiveTab(
                e.target.value as
                  | 'profile'
                  | 'investor'
                  | 'preferences'
                  | 'account'
              )
            }
          >
            <option value="profile">Profile</option>
            <option value="investor">Investor Profile</option>
            <option value="preferences">Preferences</option>
            <option value="account">Account & Security</option>
          </select>
        </div>

        {/* Desktop tabs */}
        <nav
          className="hidden sm:-mb-px sm:flex sm:space-x-8"
          aria-label="Tabs"
        >
          {[
            {
              id: 'profile',
              name: 'Profile',
              icon: User,
            },
            {
              id: 'investor',
              name: 'Investor Profile',
              icon: Shield,
            },
            {
              id: 'preferences',
              name: 'Preferences',
              icon: Settings2,
            },
            {
              id: 'account',
              name: 'Account & Security',
              icon: ShieldAlert,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | 'profile'
                      | 'investor'
                      | 'preferences'
                      | 'account'
                  )
                }
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 mr-2 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                />

                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        {activeTab === 'profile' && (
          <ProfileSection
            user={data.user}
            showToast={showToast}
            updateData={updateData}
          />
        )}

        {activeTab === 'investor' && (
          <InvestorProfileSection
            profile={data.profile}
            showToast={showToast}
            updateData={updateData}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesSection
            preferences={data.preferences}
            showToast={showToast}
            updateData={updateData}
          />
        )}

        {activeTab === 'account' && (
          <AccountSection showToast={showToast} />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE
============================================================ */

function ProfileSection({
  user,
  showToast,
  updateData,
}: {
  user: any;
  showToast: any;
  updateData: any;
}) {
  const [name, setName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          data: {
            name,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || 'Failed to update profile'
        );
      }

      updateData('user', {
        name,
      });

      showToast('Profile updated', 'success');
    } catch (err: any) {
      showToast(
        err.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
            {(name || user?.email || 'U')
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <p className="font-medium text-gray-900">
              Profile Picture
            </p>

            <p className="text-sm text-gray-500">
              Managed via Better Auth.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <input
              type="email"
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
              value={user?.email || ''}
              readOnly
            />
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              name === (user?.name || '')
            }
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}

            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   INVESTOR PROFILE
============================================================ */

function InvestorProfileSection({
  profile,
  showToast,
  updateData,
}: {
  profile: any;
  showToast: any;
  updateData: any;
}) {
  const [formData, setFormData] = useState(() => ({
    age: profile?.age || 30,
    currentCapital: profile?.currentCapital || 0,
    monthlyInvestmentCap: profile?.monthlyInvestmentCap || 0,
    annualIncome: profile?.annualIncome || 0,
    riskAppetite: profile?.riskAppetite || 'Moderate',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profile',
          data: formData,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            'Failed to update investor profile'
        );
      }

      updateData('profile', formData);

      showToast(
        'Investor Profile updated',
        'success'
      );
    } catch (err: any) {
      showToast(
        err.message ||
          'Failed to update investor profile',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {!profile && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />

          <div>
            <p className="font-medium text-yellow-800">
              Profile Incomplete
            </p>

            <p className="text-sm text-yellow-700 mt-1">
              You haven't completed your investor
              profile yet. Some AI features may be
              limited.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>

            <input
              type="number"
              min="18"
              max="120"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.age}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age:
                    parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Risk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Appetite
            </label>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.riskAppetite}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  riskAppetite: e.target.value,
                })
              }
            >
              <option value="Low">
                Low (Conservative)
              </option>

              <option value="Moderate">
                Moderate
              </option>

              <option value="High">
                High (Aggressive)
              </option>

              <option value="Very High">
                Very High (Speculative)
              </option>
            </select>
          </div>

          {/* Capital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Capital (₹)
            </label>

            <input
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.currentCapital}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentCapital:
                    parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Monthly Investment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Investment Cap (₹)
            </label>

            <input
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={
                formData.monthlyInvestmentCap
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyInvestmentCap:
                    parseFloat(
                      e.target.value
                    ) || 0,
                })
              }
            />
          </div>

          {/* Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Income (₹)
            </label>

            <input
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.annualIncome}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  annualIncome:
                    parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}

            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   PREFERENCES
============================================================ */

function PreferencesSection({
  preferences,
  showToast,
  updateData,
}: {
  preferences: any;
  showToast: any;
  updateData: any;
}) {
  const [formData, setFormData] = useState(() => ({
    theme: preferences?.theme || 'system',
    currency: preferences?.currency || 'INR',
    emailAlerts: preferences?.emailAlerts ?? true,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'preferences',
          data: formData,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            'Failed to update preferences'
        );
      }

      updateData('preferences', formData);

      showToast(
        'Preferences updated',
        'success'
      );
    } catch (err: any) {
      showToast(
        err.message ||
          'Failed to update preferences',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.theme}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  theme: e.target.value,
                })
              }
            >
              <option value="light">
                Light
              </option>

              <option value="dark">
                Dark
              </option>

              <option value="system">
                System Preference
              </option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Currency
            </label>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.currency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currency: e.target.value,
                })
              }
            >
              <option value="INR">
                Indian Rupee (₹)
              </option>

              <option value="USD">
                US Dollar ($)
              </option>
            </select>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.emailAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailAlerts:
                      e.target.checked,
                  })
                }
              />

              <div
                className={`block w-10 h-6 rounded-full transition-colors ${
                  formData.emailAlerts
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              />

              <div
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  formData.emailAlerts
                    ? 'transform translate-x-4'
                    : ''
                }`}
              />
            </div>

            <div className="text-sm">
              <p className="font-medium text-gray-900">
                Email Notifications
              </p>

              <p className="text-gray-500">
                Receive alerts for AI health checks
                and goal milestones.
              </p>
            </div>
          </label>
        </div>

        {/* Save */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}

            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   ACCOUNT
============================================================ */

function AccountSection({
  showToast,
}: {
  showToast: any;
}) {
  const [deleteConfirm, setDeleteConfirm] =
    useState('');

  const [isDeleting, setIsDeleting] =
    useState(false);

  const handleDeleteAccount = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (deleteConfirm !== 'DELETE') {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            'Failed to delete account'
        );
      }

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/login';
          },
        },
      });
    } catch (err: any) {
      showToast(
        err.message ||
          'Failed to delete account',
        'error'
      );

      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Security */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Account Security
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Password changes and connected accounts
          are managed through Better Auth.
        </p>

        <button
          type="button"
          className="mt-4 px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Manage Login Options
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 mt-8 border-t border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-2">
          Danger Zone
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your FinCal account
          and all associated data (portfolio, goals,
          AI history). This action is irreversible.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <form
            onSubmit={handleDeleteAccount}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-red-800 mb-2">
                Type <strong>DELETE</strong> to
                confirm
              </label>

              <input
                type="text"
                required
                className="w-full max-w-sm px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                value={deleteConfirm}
                onChange={(e) =>
                  setDeleteConfirm(e.target.value)
                }
                placeholder="DELETE"
              />
            </div>

            <button
              type="submit"
              disabled={
                deleteConfirm !== 'DELETE' ||
                isDeleting
              }
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldAlert className="w-4 h-4 mr-2" />
              )}

              Permanently Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}