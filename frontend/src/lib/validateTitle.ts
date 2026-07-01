/**
 * Client-side title validation mirroring the backend rules so users get instant
 * feedback. Returns an error message, or null when valid.
 */
export const TITLE_MAX_LENGTH = 200;
export const EMPTY_TITLE_MESSAGE = '标题不能为空';
export const TITLE_TOO_LONG_MESSAGE = '标题过长';

export function validateTitle(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return EMPTY_TITLE_MESSAGE;
  if (trimmed.length > TITLE_MAX_LENGTH) return TITLE_TOO_LONG_MESSAGE;
  return null;
}
