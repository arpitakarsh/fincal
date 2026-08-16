'use client';

import { useApi } from '@/hooks/useApi';

export interface DashboardGoal {
  id: string;
  name?: string;
  targetAmount?: number;
  timeHorizonYears?: number;
  investmentType?: 'sip' | 'lumpsum';
  sipAmount?: number;
  lumpsumAmount?: number;
  progressSnapshots?: Array<{ amount: number; percentage: number; date: string }>;
  recommendations?: Array<{
    fundName: string;
    reason?: string;
  }>;
}

export interface DashboardData {
  user: { name: string; email: string };
  profileCompleted: boolean;
  goals: {
    total: number;
    upcoming: DashboardGoal | null;
    list: DashboardGoal[];
  };
  portfolio: {
    totalValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    holdingsCount: number;
    assetAllocation: Array<{ name: string; value: number; percentage: number }>;
    categoryAllocation?: Array<{ name: string; value: number; percentage: number }>;
    amcAllocation?: Array<{ name: string; value: number; percentage: number }>;
    snapshots?: Array<{ date: string; totalValue: number; netInvested: number }>;
    lastUpdated?: string | null;
  };
  profile?: { riskAppetite: string; investmentStyle: string; investmentKnowledge: string } | null;
  insights?: Array<{ id: string; topic: string; insight: unknown; createdAt: string }>;
}

export function useDashboard() {
  return useApi<DashboardData>('/api/dashboard');
}
