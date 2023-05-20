import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";

export const orderRepository = AppDataSource.getRepository(Order);
