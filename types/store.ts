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

export type TStoreAdmin = { 
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

  admins?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role : string ; 
    createdAt: Date;
  }[];
}