import { auth } from '../lib/auth';

export class AuthService {
  static async login(email: string, password: string) {
    try {
      const response = await auth.api.signInEmail({
        email,
        password,
      });
      return { success: true, user: response.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async register(name: string, email: string, password: string) {
    try {
      const response = await auth.api.signUpEmail({
        email,
        password,
        name
      });
      return { success: true, user: response.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async logout() {
    await auth.api.signOut();
  }
}
