/**
 * Title validation shared by create and edit flows (todo-management).
 * Rules: non-empty after trimming, and at most 200 characters.
 */
import { validationError } from './errors.js';

export const TITLE_MAX_LENGTH = 200;

export const EMPTY_TITLE_MESSAGE = '标题不能为空';
export const TITLE_TOO_LONG_MESSAGE = '标题过长';

/**
 * Validate and normalise a title. Returns the trimmed title on success,
 * throws a validation ApiError otherwise.
 */
export function validateTitle(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw validationError(EMPTY_TITLE_MESSAGE);
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw validationError(EMPTY_TITLE_MESSAGE);
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    throw validationError(TITLE_TOO_LONG_MESSAGE);
  }
  return trimmed;
}
