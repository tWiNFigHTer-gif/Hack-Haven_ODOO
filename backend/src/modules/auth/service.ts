import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error';
import { validatePassword, hash, compare } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { sendMail } from '../../utils/mailer';
import {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schema';

export const signup = async (input: SignupInput) => {
  const passwordErrors = validatePassword(input.password);
  if (passwordErrors.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Password does not meet requirements', passwordErrors);
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Email already in use');
  }

  const passwordHash = await hash(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.CUSTOMER,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { user };
};

export const login = async (input: LoginInput) => {
  const invalidCredentialsMessage = 'Invalid email or password';

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHENTICATED', invalidCredentialsMessage);
  }

  const isPasswordValid = await compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(401, 'UNAUTHENTICATED', invalidCredentialsMessage);
  }

  const token = signToken({ sub: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  return { user };
};

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const response = {
    message: 'If the email exists in our system, a password reset link has been sent.',
  };

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive) {
    return response;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;
  await sendMail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
  });

  return response;
};

export const resetPassword = async (input: ResetPasswordInput) => {
  const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid or expired token');
  }

  const passwordErrors = validatePassword(input.password);
  if (passwordErrors.length > 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Password does not meet requirements', passwordErrors);
  }

  const newPasswordHash = await hash(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: 'Password reset successfully' };
};
