import { isUUID } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { BadRequestError } from "../helpers/api-erros";
import { IAddress } from "../interfaces";
import { addressRepository } from "../repositories/addressRepository";
import { Address } from "../entities/Address";

export class AddressController {
  async create(req: Request, res: Response) {
    const {
      title = "",
      street = "",
      number = "",
      city = "",
      phone = "",
      commune = "",
      country = "",
      firstname = "",
      lastname = "",
    } = req.body as IAddress;

    const titleToLowerCase = title.toLowerCase();

    if (
      [
        titleToLowerCase,
        street,
        number,
        city,
        phone,
        commune,
        country,
        firstname,
        lastname,
      ].includes("")
    ) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const addressExist = await addressRepository.findOneBy({
      title: titleToLowerCase,
    });
    if (addressExist) {
      throw new BadRequestError("direccion ya existe");
    }

    delete req.user.password;
    delete req.user.image;
    delete req.user.createdAt;
    delete req.user.isActive;
    delete req.user.roles;
    delete req.user.updateAt;
    delete req.user.token;
    delete req.user.phone;
    delete req.user.lastname;

    const newAddress = addressRepository.create({
      title: titleToLowerCase,
      street,
      number,
      city,
      phone,
      commune,
      country,
      firstname,
      lastname,
    });
    newAddress.user = req.user;

    try {
      await addressRepository.save(newAddress);
      return res.status(201).json({ newAddress, message: "Creado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const addresses = await addressRepository.find({
        where: {
          user: { id: req.user.id },
        },
        take: Number(limit),
        skip: Number(offset),
      });

      addresses.map((address) => {
        delete address.user.password;
        delete address.user.image;
        delete address.user.createdAt;
        delete address.user.isActive;
        delete address.user.roles;
        delete address.user.updateAt;
        delete address.user.token;
        delete address.user.phone;
        delete address.user.lastname;
      });

      return res.json(addresses);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findOne(req: Request, res: Response) {
    const { term } = req.params;
    let address: Address | null;

    if (isUUID(term)) {
      if (!isUUID(term)) throw new BadRequestError("direccion no valida");

      address = await addressRepository.findOne({
        where: { id: term, user: { id: req.user.id } },
      });
    } else {
      address = await addressRepository.findOne({
        where: { title: term.toLowerCase(), user: { id: req.user.id } },
      });
    }

    if (!address) throw new BadRequestError("Direccion no existe");

    delete address.user.password;
    delete address.user.image;
    delete address.user.createdAt;
    delete address.user.isActive;
    delete address.user.roles;
    delete address.user.updateAt;
    delete address.user.token;
    delete address.user.phone;
    delete address.user.lastname;

    return res.json(address);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    const {
      title,
      street,
      number,
      city,
      phone,
      commune,
      country,
      firstname,
      lastname,
    } = req.body as IAddress;
    const titleToLowerCase = title.toLowerCase();
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Direccion no valida");

    const address = await addressRepository.findOneBy({ id });
    if (!address) throw new BadRequestError("Direccion no existe");

    address.title = titleToLowerCase || address.title;
    address.street = street || address.street;
    address.number = number || address.number;
    address.city = city || address.city;
    address.phone = phone || address.phone;
    address.commune = commune || address.commune;
    address.country = country || address.country;
    address.firstname = firstname || address.firstname;
    address.lastname = lastname || address.lastname;

    try {
      await addressRepository.save(address);

      const addressUpdate = await addressRepository.findOneBy({ id });

      delete addressUpdate!.user.password;
      delete addressUpdate!.user.image;
      delete addressUpdate!.user.createdAt;
      delete addressUpdate!.user.isActive;
      delete addressUpdate!.user.roles;
      delete addressUpdate!.user.updateAt;
      delete addressUpdate!.user.token;
      delete addressUpdate!.user.phone;
      delete addressUpdate!.user.lastname;

      return res.json({ addressUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Direccion no valida");

    const address = await addressRepository.findOneBy({ id });
    if (!address) throw new BadRequestError("Dirreccion no existe");

    try {
      await addressRepository.delete(id);
      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
