import bcrypt from 'bcryptjs';

export const validatePassword = (pw: string): string[] => {
  const errors: string[] = [];
  if (pw.length < 9) {
    errors.push('Password must be at least 9 characters long');
  }
  if (!/[A-Z]/.test(pw)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(pw)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[^a-zA-Z0-9]/.test(pw)) {
    errors.push('Password must contain at least one special character');
  }
  return errors;
};

export const hash = async (pw: string): Promise<string> => {
  return bcrypt.hash(pw, 10);
};

export const compare = async (pw: string, hashStr: string): Promise<boolean> => {
  return bcrypt.compare(pw, hashStr);
};

