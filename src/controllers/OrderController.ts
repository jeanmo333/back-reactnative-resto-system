import { isUUID } from "class-validator";
import { Request, Response } from "express";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import { BadRequestError } from "../helpers/api-erros";
import { plateRepository } from "../repositories/plateRepository";
import { addressRepository } from "../repositories/addressRepository";
import { IDetails } from "../interfaces";
import { Detail } from "../entities/Detail";
import { Order } from "../entities/Order";
import { orderRepository } from "../repositories/orderRepository";
import { detailRepository } from "../repositories/detailRepository";
import { Between } from "typeorm";

function calcPrice(price: number, quantity: number) {
  return price * quantity;
}

function calcProfit(
  sale_price: number,
  prepared_price: number,
  quantity: number
) {
  return (sale_price - prepared_price) * quantity;
}

export class OrderController {
  async create(req: Request, res: Response) {
    const { details, idAddress, idClientStripe } = req.body;
    let detailToSave: IDetails[] = [];
    let total = 0;
    let subtotal = 0;
    let profit = 0;
    let totalProfit = 0;

    const address = await addressRepository.findOneBy({ id: idAddress });
    if (!address) throw new BadRequestError("Address no existe");

    for await (const item of details) {
      const response = await plateRepository.findOneBy({ id: item.idProduct });
      subtotal = calcPrice(response?.sale_price!, item.quantity);
      profit = calcProfit(
        response?.sale_price!,
        response?.prepared_price!,
        item.quantity
      );
      total += subtotal;
      totalProfit += profit;

      detailToSave.push({
        id: response!.id,
        quantity: item.quantity,
        subtotal,
      });
    }

    const charge = await stripe.charges.create({
      amount: total,
      currency: "clp",
      source: idClientStripe,
      description: `ID Usuario: ${req.user.id}`,
    });

    const newDetailOrder = detailToSave.map((detail: any) => {
      const detailDb = new Detail();
      detailDb.plate = detail.id;
      detailDb.quantity = detail.quantity;
      detailDb.subtotal = detail.subtotal;
      return detailDb;
    });

    delete req.user.password;
    delete req.user.image;
    delete req.user.createdAt;
    delete req.user.isActive;
    delete req.user.role;
    delete req.user.updateAt;
    delete req.user.token;
    delete req.user.phone;
    delete req.user.lastname;

    try {
      await detailRepository.save(newDetailOrder);
      const order = new Order();
      order.user = req.user;
      order.total = total;
      order.address = address;
      order.idPayment = charge.id;
      order.profit = totalProfit;
      order.details = newDetailOrder as any;

      const savedOrder = await orderRepository.save(order);

      delete savedOrder.address.user;
      return res
        .status(201)
        .json({ savedOrder, message: "Pedido completado con exito" });
    } catch (error) {
      console.log(error);
    }
  }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const numberOfOrders = await orderRepository.count();
      const orders = await orderRepository.find({
        relations: {
          details: {
            plate: true,
          },
          user: true,
        },
        take: Number(limit),
        skip: Number(offset),
      });

      orders.map((order) => {
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

      return res.json({ orders, numberOfOrders });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async findMyOrders(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const numberOfMyOrders = await orderRepository.count({
        where: {
          user: { id: req.user.id },
        },
      });

      const orders = await orderRepository.find({
        where: {
          user: { id: req.user.id },
        },
        relations: {
          details: {
            plate: true,
          },
        },
        take: Number(limit),
        skip: Number(offset),
      });

      orders.map((order) => {
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

      return res.json({ orders, numberOfMyOrders });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async getOrdersByDay(req: Request, res: Response) {
    const { date } = req.params;
    const parsedDate = new Date(date);
    const startDate = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    ); // inicio del día
    const endDate = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate() + 1
    ); // fin del día

    try {
      const numberOfDayOrders = await orderRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });

      const ordersDay = await orderRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });

      ordersDay.map((order) => {
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
      });

      return res.json({ ordersDay, numberOfDayOrders });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async getOrdersByMonth(req: Request, res: Response) {
    const { month, year } = req.params;
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    const startDate = new Date(yearNumber, monthNumber - 1, 1); // inicio del mes
    const endDate = new Date(yearNumber, monthNumber, 0); // fin del mes

    try {
      const numberOfMonthOrders = await orderRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });

      const ordersMonth = await orderRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
      });

      ordersMonth.map((order) => {
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
      });
      return res.json({ ordersMonth, numberOfMonthOrders });
    } catch (error) {}
  }

  // //********************************************************************** */

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    let order: Order | null;

    order = await orderRepository.findOne({
      where: { id },
      relations: {
        details: {
          plate: true,
        },
      },
    });

    if (!order) throw new BadRequestError("Orden no existe");

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

    return res.json(order);
  }

  // //********************************************************************** */

  async updateStatus(req: Request, res: Response) {
    const validStatus = ["RECIBIDO", "PREPARANDO", "EN CAMINO", "ENTEGRADO"];
    const { status } = req.body;
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Order no valido");

    const orderExist = await orderRepository.findOneBy({ id });
    if (!orderExist) throw new BadRequestError("Order no existe");

    if (!validStatus.includes(status)) {
      throw new BadRequestError("Estado no valido");
    }

    try {
      await orderRepository.update(id, { status });

      const orderUpdate = await orderRepository.findOneBy({ id });

      delete orderUpdate!.user.password;
      delete orderUpdate!.user.image;
      delete orderUpdate!.user.createdAt;
      delete orderUpdate!.user.isActive;
      delete orderUpdate!.user.role;
      delete orderUpdate!.user.updateAt;
      delete orderUpdate!.user.token;
      delete orderUpdate!.user.phone;
      delete orderUpdate!.user.lastname;
      delete orderUpdate!.address.user;

      return res.json({ orderUpdate, message: "Estado cambiado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
