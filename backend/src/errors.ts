/**
 * Unified error model. Every failure surfaced to a client becomes an
 * ApiError with a stable `code`, an HTTP `status` and a human message.
 * Handlers translate these into the `{ error: { code, message } }` envelope.
 */
export type ErrorCode =
  | 'unauthenticated'
  | 'validation_error'
  | 'not_found'
  | 'internal_error';

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const unauthenticated = (message = '未认证') =>
  new ApiError('unauthenticated', 401, message);

export const validationError = (message: string) =>
  new ApiError('validation_error', 400, message);

export const notFound = (message = '未找到') => new ApiError('not_found', 404, message);

export const internalError = (message = '服务器内部错误') =>
  new ApiError('internal_error', 500, message);
