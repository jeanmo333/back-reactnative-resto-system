import { IOrder } from "./order";
import { IPlate } from "./plate";

export interface IDetails {
  plate: IPlate;
  subtotal: number;
  order: IOrder;
  quantity: number;
}
