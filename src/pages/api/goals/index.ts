import type { NextApiRequest, NextApiResponse } from 'next';
import { GoalService } from '@/features/dashboard/services/GoalService';
import { DashboardService } from '@/features/dashboard/services/DashboardService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In a real implementation:
  // const session = await auth.api.getSession({ headers: req.headers });
  // if (!session) return res.status(401).json({ error: 'Unauthorized' });
  const userId = "test-user-id"; 

  if (req.method === 'GET') {
    try {
      const goals = await GoalService.getGoalsForUser(userId);
      const summary = await DashboardService.getPortfolioSummary(userId);
      return res.status(200).json({ goals, summary });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const goal = await GoalService.createGoal(userId, req.body);
      // Immediately refresh the dashboard aggregate whenever a new goal is added
      await DashboardService.getPortfolioSummary(userId);
      return res.status(201).json(goal);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
