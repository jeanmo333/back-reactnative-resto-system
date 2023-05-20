import { ICategory } from "./category";

export interface IPlateTemp {
  id?: string;
  name: string;
  description?: string;
  prepared_price: number;
  sale_price: number;
  stock: number;
  quantity: number;
  images?: string[];
  isActive?: boolean;
  category?: string | ICategory;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}
