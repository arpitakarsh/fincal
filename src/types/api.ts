export interface ErrorResponse {
  error: string;
}

export interface AIParsingRequest {
  query: string;
}

export interface AIParsingResponse {
  goalType?: string;
  cost?: number;
  yrs?: number;
  inflation?: number;
  annualRet?: number;
}
