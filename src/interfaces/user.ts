export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  phone?: string;
  address?: string;
  image?: string;
  lastname?: string;
  web: string;
  isActive: boolean;
  token: string;

  createdAt?: string;
  updatedAt?: string;
}
