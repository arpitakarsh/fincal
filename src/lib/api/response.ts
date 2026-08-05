import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

function requestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}`;
}

export function createSuccessResponse<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: requestId(),
  };
  return NextResponse.json(payload, { status });
}

export function createErrorResponse(error: string, status = 500) {
  const payload: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId: requestId(),
  };
  return NextResponse.json(payload, { status });
}
