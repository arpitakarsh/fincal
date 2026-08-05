export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string;
  message?: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
