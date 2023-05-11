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
  folderNameApp,
  folderNamePlates,
  uploadFileClaudinary,
} from "../helpers/claudinary";

export class PlateController {
  async create(req: Request, res: Response) {
    //console.log(JSON.parse(req.body.plate));
    //console.log(req.files!.archives);

    const archives = req.files!.archives as any;
    const tempFilePaths = archives.map((archive: any) => archive.tempFilePath);

    const {
      name = "",
      description = "",
      prepared_price = 0,
      sale_price = 0,
      stock = 0,
      idCategory = "",
    } = JSON.parse(req.body.plate);

    let plateSave: any;
    let inserts = 0;

    if ([name, idCategory].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    if (archives.length > 3) {
      throw new BadRequestError("maximo 3 imagenes");
    }

    const plateName = await plateRepository.findOneBy({ name });
    if (plateName) {
      throw new BadRequestError("Plato ya existe");
    }

    const category = await categoryRepository.findOneBy({ id: idCategory });
    if (!category) {
      throw new BadRequestError("Categoria no existe");
    }

    const newPlate = plateRepository.create({
      name,
      description,
      prepared_price,
      sale_price,
      stock,
      category,
    });
    newPlate.user = req.user;

    try {
      plateSave = await plateRepository.save(newPlate);

      const start = async () => {
        await asyncForeach(tempFilePaths, async (archive: any) => {
          const secure_url = await uploadFileClaudinary(
            archive,
            `${folderNameApp}/${folderNamePlates}`
          );

          if (secure_url != undefined && secure_url != null) {
            // CREO LA IMAGEN EN CLAUDINARY
            if (inserts == 0) {
              plateSave.images = [...plateSave.images, secure_url];
            } else if (inserts == 1) {
              plateSave.images = [...plateSave.images, secure_url];
            } else if (inserts == 2) {
              plateSave.images = [...plateSave.images, secure_url];
            }
          }
          await plateRepository.update(
            { id: plateSave.id },
            { images: plateSave.images }
          );

          inserts = inserts + 1;

          if (inserts == tempFilePaths.length) {
            // TERMINO DE ALAMACENAR LAS TRES IMAGENES
            return res.status(201).json({
              plateSave,
              message: "Creado con exito",
            });
          }
        });
      };
      start();
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const plates = await plateRepository.find({
        where: {
          isActive: true,
          user: { id: req.user.id },
        },
        relations: {
          category: true,
        },
        take: Number(limit),
        skip: Number(offset),
      });

      return res.json(plates);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findOne(req: Request, res: Response) {
    const { term } = req.params;
    let plate: Plate | null;

    if (isUUID(term)) {
      plate = await plateRepository.findOne({
        where: { id: term, user: { id: req.user.id } },
      });
    } else {
      plate = await plateRepository.findOne({
        where: { name: term.toLowerCase(), user: { id: req.user.id } },
      });
    }

    if (!plate) throw new BadRequestError("Plato no existe");

    if (plate.isActive === false)
      throw new BadRequestError("plato no esta activo");

    return res.json(plate);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    const {
      name,
      description,
      prepared_price,
      sale_price,
      stock,
      // idCategory,
      isActive,
    } = req.body;
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Plato no valido");

    const plate = await plateRepository.findOneBy({ id });
    if (!plate) throw new BadRequestError("Platillo no existe");

    // const category = await categoryRepository.findOneBy({ id: idCategory });
    // if (!category) throw new BadRequestError("Categoria no existe");

    plate.name = name || plate.name;
    plate.description = description || plate.description;
    plate.prepared_price = prepared_price || plate.prepared_price;
    plate.sale_price = sale_price || plate.sale_price;
    plate.stock = stock || plate.stock;
    // plate.category = category || plate.category;
    plate.isActive = isActive;

    try {
      await plateRepository.save(plate);

      const plateUpdate = await plateRepository.findOneBy({ id });
      return res.json({ plateUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Plato no valida");

    const plate = await plateRepository.findOneBy({ id });
    if (!plate) throw new BadRequestError("Plato no existe");

    try {
      await plateRepository.delete(id);
      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
