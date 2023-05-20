import { IDetails } from "./details";
import { IUser } from "./user";

export interface IOrder {
  id?: string;
  total: number;
  profit: number;
  user?: IUser | string;
  details: IDetails[];

  createdAt?: string;
  updatedAt?: string;
}
