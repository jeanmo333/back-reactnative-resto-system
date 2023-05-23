import { IOrder } from "./order";
import { IPlate } from "./plate";

export interface IDetails {
  id?: string;
  plate?: IPlate;
  subtotal: number;
  order?: IOrder;
  quantity: number;
}
