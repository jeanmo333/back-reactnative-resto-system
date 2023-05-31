import { Request, Response } from "express";
import { plateRepository } from "../repositories/plateRepository";
import { LessThan } from "typeorm";
import { orderRepository } from "../repositories/orderRepository";

export class DashboardController {
  async dashboard(req: Request, res: Response) {
    let totalProfit = 0;
    try {
      const platesWithNoInventory = await plateRepository.count({
        where: {
          stock: 0,
          isActive: true,
        },
      });

      const plateslowInventory = await plateRepository.count({
        where: {
          stock: LessThan(10),
          isActive: true,
        },
      });

      const orders = await orderRepository.find();

      for await (const order of orders) {
        totalProfit += order.profit;
      }

      return res.json({
        platesWithNoInventory,
        plateslowInventory,
        totalProfit,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
