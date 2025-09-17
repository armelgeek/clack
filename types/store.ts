import { StoreStatus } from './enums/store';

export type TStore = {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  openingHours?: any;
  status: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
