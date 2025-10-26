import { User as PrismaUser } from '@prisma/client';

export class UserEntity implements Omit<PrismaUser, 'password'> {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  googleId: string | null;
  provider: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  creditBalance: number;
  totalCreditsSpent: number;
  totalCreditsEarned: number;
  creditUpdatedAt: Date;

  constructor(partial: Partial<PrismaUser>) {
    Object.assign(this, partial);
    delete (this as any).password;
  }
}
