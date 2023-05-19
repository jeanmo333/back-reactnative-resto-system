import { User } from "../entities/User";

export interface IAddress {
  id: string;
  title: string;
  street: string;
  number: string;
  city: string;
  firstname: string;
  lastname: string;
  phone: string;
  commune: string;
  country: string;
  user: Partial<User>;

  createdAt?: string;
  updatedAt?: string;
}
