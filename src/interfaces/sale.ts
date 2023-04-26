import { ICustomer } from "./customer";
import { IDetails } from "./details";
import { IUser } from "./user";

export interface ISale {
  id?: string;
  user?: IUser | string;
  customer?: ICustomer | string;
  details: IDetails[];
  discount?: string;

  createdAt?: string;
  updatedAt?: string;
}
