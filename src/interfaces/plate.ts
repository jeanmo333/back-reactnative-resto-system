import { ICategory } from "./category";
import { ISupplier } from "./supplier";

export interface IPlate {
  _id?: string;
  name: string;
  description?: string;
  prepared_price: number;
  sale_price: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
  category?: string;
  supplier?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}
