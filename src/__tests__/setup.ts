// @ts-nocheck
import { vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { prisma } from '@/backend/infrastructure/database/client';

// Mock PrismaClient globally
const prismaMock = mockDeep<PrismaClient>();

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      return prismaMock;
    }
  }
}));

// Mock ioredis globally to avoid ECONNREFUSED
vi.mock('ioredis', () => {
  return {
    default: class {
      get = vi.fn();
      set = vi.fn();
      setex = vi.fn();
      del = vi.fn();
      on = vi.fn();
      quit = vi.fn();
    }
  };
});

beforeEach(() => {
  mockReset(prismaMock);
  vi.clearAllMocks();
});

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn(),
    }
  }
}));

export { prismaMock };
