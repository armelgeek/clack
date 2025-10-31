import { UserRole } from './enums/user';

export type TUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  role: UserRole;
  banned: boolean;
  banReason: string;
  banExpires: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryPreference = {
  id?: string;
  userId: string;
  isNotified: boolean;
  minThreshold: number;
};
