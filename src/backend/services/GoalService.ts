import { GoalRepository } from '../repositories/GoalRepository';
import { CacheManager } from '../infrastructure/redis/cache/CacheManager';
import { CacheKeys } from '../infrastructure/redis/cache/CacheKeys';

export class GoalService {
  private repo = new GoalRepository();

  async getUserGoals(userId: string) {
    const cacheKey = CacheKeys.userGoals(userId);
    const cached = await CacheManager.get(cacheKey);
    if (cached) return cached;

    const goals = await this.repo.findAllByUserId(userId);
    await CacheManager.set(cacheKey, goals, 300); // Cache for 5 mins
    return goals;
  }

  async getGoalById(id: string, userId: string) {
    return this.repo.findByIdAndUserId(id, userId);
  }

  async createGoal(userId: string, data: any) {
    const goalName = data.name || `${data.goalType.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Goal`;
    const goal = await this.repo.createGoal({ ...data, name: goalName, user: { connect: { id: userId } } });
    await CacheManager.delete(CacheKeys.userGoals(userId));
    return goal;
  }

  async updateGoal(id: string, userId: string, data: any) {
    const goal = await this.repo.updateGoal(id, userId, data);
    await CacheManager.delete(CacheKeys.userGoals(userId));
    return goal;
  }

  async deleteGoal(id: string, userId: string) {
    const result = await this.repo.deleteGoal(id, userId);
    await CacheManager.delete(CacheKeys.userGoals(userId));
    return result;
  }
}
