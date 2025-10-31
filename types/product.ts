import { ProductOwner, ProductStatus } from './enums/product';

export type TClientProduct = {
  id: string;
  image: string;
  name: string;
  category_id: string;
  pv_ttc: number;
  pv_ht: number;
  tva: string;
  stock: number;
};

export type TProduct = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  priceHT: number;
  priceTTC: number;
  vat: string;
  status: ProductStatus | string;
  quantity: number;
  owner: ProductOwner | string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
