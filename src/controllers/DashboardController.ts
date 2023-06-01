import { Request, Response } from "express";
import { plateRepository } from "../repositories/plateRepository";
import { LessThan, getConnection } from "typeorm";
import { orderRepository } from "../repositories/orderRepository";
import { OrderController } from "./OrderController";
import { Order } from "../entities/Order";

async function obtenerVentasDiarias() {
  try {
    const fechaActual = new Date().toISOString().split("T")[0]; // Obtener la fecha actual en formato YYYY-MM-DD

    const consulta = `
      SELECT *
      FROM orders
      WHERE created_at = $1
    `;

    const { rows } = await orderRepository.query(consulta, [fechaActual]);
    return rows;
  } catch (error) {
    console.error("Error al obtener las ventas diarias:", error);
  }
}

export class DashboardController {
  async dashboard(req: Request, res: Response) {
    const { limit = 5, offset = 0 } = req.query;

    let totalProfit = 0;
    let totalSale = 0;
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
        totalSale += order.total;
      }

      const fiveRecentOrders = await orderRepository.find({
        relations: {
          details: {
            plate: true,
          },
          user: true,
        },
        order: { createdAt: "DESC" },
        take: Number(limit),
        skip: Number(offset),
      });

      fiveRecentOrders.map((order) => {
        delete order.user.password;
        delete order.user.image;
        delete order.user.createdAt;
        delete order.user.isActive;
        delete order.user.role;
        delete order.user.updateAt;
        delete order.user.token;
        delete order.user.phone;
        delete order.user.lastname;
        delete order.address.user;
        order.details.map((detail) => {
          delete detail.plate.user;
        });
      });

      return res.json({
        platesWithNoInventory,
        plateslowInventory,
        totalProfit,
        totalSale,
        fiveRecentOrders,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
