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
    assetAllocation: Record<string, number>;
  };
}

export function useDashboard() {
  return useApi<DashboardData>('/api/dashboard');
}
