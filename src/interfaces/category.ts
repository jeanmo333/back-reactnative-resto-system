export interface ICategory {
  id?: string;
  name: string;
  description: string;
  isActive?: boolean;
  user?: string;

  createdAt?: string;
  updatedAt?: string;
}
