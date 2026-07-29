import { GoalService } from '../services/GoalService';

describe('Dashboard Services', () => {
  describe('Goal Health Scoring', () => {
    it('Should return EXCELLENT if goal is >= 80% funded', () => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 2);
      
      const health = GoalService.calculateHealthScore(85000, 100000, targetDate);
      expect(health).toBe('EXCELLENT');
    });

    it('Should return CRITICAL if < 20% funded and < 3 years remaining', () => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 1);
      
      const health = GoalService.calculateHealthScore(10000, 100000, targetDate);
      expect(health).toBe('CRITICAL');
    });
  });
});
