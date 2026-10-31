import { describe, it, expect } from 'vitest';
import { AppError } from '../src/middleware/error';

describe('AppError', () => {
  it('creates an AppError with code and statusCode', () => {
    const error = new AppError(404, 'NOT_FOUND', 'Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });
});
