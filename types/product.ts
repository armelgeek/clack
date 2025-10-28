export type TProduct = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  image?: string;
  images?: string[];
  owner?: string;
  priceHT: number;
  priceTTC: number;
  vat: string;
  status: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
