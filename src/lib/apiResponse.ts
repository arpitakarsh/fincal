import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Standard node uuid

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export function createSuccessResponse<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID ? crypto.randomUUID() : 'req-uuid-fallback',
  };
  return NextResponse.json(payload, { status });
}

export function createErrorResponse(error: string, status = 500) {
  const payload: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID ? crypto.randomUUID() : 'req-uuid-fallback',
  };
  return NextResponse.json(payload, { status });
}
