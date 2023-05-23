import { isUUID, MinLength } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { categoryRepository } from "../repositories/categoryRepository";
import asyncForeach from "../helpers/async_foreach";
import { plateRepository } from "../repositories/plateRepository";

import { Plate } from "../entities/Plate";
import {
  destroyImageClaudinary,
  folderNameApp,
  folderNamePlates,
  uploadFileClaudinary,
} from "../helpers/claudinary";
import { addressRepository } from "../repositories/addressRepository";
import { IPlateTemp } from "../interfaces/plateTemp";
import { IDetails } from "../interfaces";
import { Detail } from "../entities/Detail";
import { Order } from "../entities/Order";
import { orderRepository } from "../repositories/orderRepository";
import { detailRepository } from "../repositories/detailRepository";

function calcPrice(price: number, quantity: number) {
  return price * quantity;
}

export class OrderController {
  detailRepository: any;
  async create(req: Request, res: Response) {
    const { details, idAddress } = req.body;
    let detailToSave: IDetails[] = [];
    let total = 0;
    let subtotal = 0;

    const address = await addressRepository.findOneBy({ id: idAddress });
    if (!address) throw new BadRequestError("Address no existe");

    for await (const item of details) {
      const response = await plateRepository.findOneBy({ id: item.idProduct });
      subtotal = calcPrice(response?.sale_price!, item.quantity);
      total += subtotal;

      detailToSave.push({
        id: response!.id,
        quantity: item.quantity,
        subtotal: calcPrice(response?.sale_price!, item.quantity),
      });
    }

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
    delete req.user.roles;
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
        delete order.user.roles;
        delete order.user.updateAt;
        delete order.user.token;
        delete order.user.phone;
        delete order.user.lastname;
        delete order.address.user;
        order.details.map((detail) => {
          delete detail.plate.user;
        });
      });

      return res.json(orders);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  // //********************************************************************** */

  // async findOne(req: Request, res: Response) {
  //   const { term } = req.params;
  //   let plate: Plate | null;

  //   if (isUUID(term)) {
  //     plate = await plateRepository.findOne({
  //       where: { id: term },
  //       relations: {
  //         category: true,
  //       },
  //     });
  //   } else {
  //     plate = await plateRepository.findOne({
  //       where: { name: term.toLowerCase() },
  //       relations: {
  //         category: true,
  //       },
  //     });
  //   }

  //   if (!plate) throw new BadRequestError("Plato no existe");

  //   if (plate.isActive === false)
  //     throw new BadRequestError("plato no esta activo");

  //   delete plate.user.password;
  //   delete plate.user.image;
  //   delete plate.user.createdAt;
  //   delete plate.user.isActive;
  //   delete plate.user.roles;
  //   delete plate.user.updateAt;
  //   delete plate.user.token;
  //   delete plate.user.phone;
  //   delete plate.user.lastname;
  //   delete plate.category.createdAt;
  //   delete plate.category.updateAt;
  //   delete plate.category.isActive;
  //   delete plate.category.user;

  //   return res.json(plate);
  // }

  // //********************************************************************** */

  async updateStatus(req: Request, res: Response) {
    const validStatus = ["RECIBIDO", "PREPARANDO", "DESPACHADO", "ENTEGRADO"];
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

      const orderUpdate = await orderRepository.findOne({
        where: { id, user: { id: req.user.id } },
      });

      delete orderUpdate!.user.password;
      delete orderUpdate!.user.image;
      delete orderUpdate!.user.createdAt;
      delete orderUpdate!.user.isActive;
      delete orderUpdate!.user.roles;
      delete orderUpdate!.user.updateAt;
      delete orderUpdate!.user.token;
      delete orderUpdate!.user.phone;
      delete orderUpdate!.user.lastname;
      delete orderUpdate!.address.user;

      return res.json({ orderUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  // async remove(req: Request, res: Response) {
  //   const { id } = req.params;

  //   if (!isUUID(id)) throw new BadRequestError("Plato no valida");

  //   const plate = await plateRepository.findOneBy({ id });
  //   if (!plate) throw new BadRequestError("Plato no existe");

  //   try {
  //     await plateRepository.delete(id);

  //     // Limpiar imágenes previas
  //     plate.images.map(async (image) => {
  //       const arrayName = image.split("/");
  //       const nameFile = arrayName[arrayName.length - 1];
  //       const [public_id] = nameFile.split(".");
  //       await destroyImageClaudinary(
  //         `${folderNameApp}/${folderNamePlates}/${public_id}`
  //       );
  //     });
  //     return res.json({ message: "Eliminado con exito" });
  //   } catch (error) {
  //     console.log(error);
  //     throw new BadRequestError("revisar log servidor");
  //   }
  // }
}
