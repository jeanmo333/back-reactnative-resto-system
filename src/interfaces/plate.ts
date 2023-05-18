import { ICategory } from "./category";

export interface IPlate {
  id?: string;
  name: string;
  description?: string;
  prepared_price: number;
  sale_price: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
  category?: string | ICategory;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}
