export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string[];
  phone?: string;
  address?: string;
  web: string;
  isActive: boolean;
  token: string;

  createdAt?: string;
  updatedAt?: string;
}
