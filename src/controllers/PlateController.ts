import { isUUID, MinLength } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { BadRequestError } from "../helpers/api-erros";
import { categoryRepository } from "../repositories/categoryRepository";
import { plateRepository } from "../repositories/plateRepository";
import { Plate } from "../entities/Plate";
import {
  destroyImageClaudinary,
  folderNameApp,
  folderNamePlates,
  uploadFileClaudinary,
} from "../helpers/claudinary";

export class PlateController {
  async create(req: Request, res: Response) {
    const { tempFilePath } = req.files!.archive as any;

    const {
      name = "",
      description = "",
      prepared_price = 0,
      sale_price = 0,
      stock = 0,
      idCategory = "",
    } = JSON.parse(req.body.plate);

    const nameToLowerCase = name.toLowerCase();

    if ([nameToLowerCase, idCategory].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const plateName = await plateRepository.findOneBy({
      name: nameToLowerCase,
    });
    if (plateName) {
      throw new BadRequestError("Plato ya existe");
    }

    const category = await categoryRepository.findOneBy({ id: idCategory });
    if (!category) {
      throw new BadRequestError("Categoria no existe");
    }

    //delete some user column
    delete req.user.password;
    delete req.user.image;
    delete req.user.createdAt;
    delete req.user.isActive;
    delete req.user.role;
    delete req.user.updateAt;
    delete req.user.token;
    delete req.user.phone;
    delete req.user.lastname;

    const newPlate = plateRepository.create({
      name: nameToLowerCase,
      description,
      prepared_price,
      sale_price,
      stock,
      category,
    });
    newPlate.user = req.user;

    const secure_url = await uploadFileClaudinary(
      tempFilePath,
      `${folderNameApp}/${folderNamePlates}`
    );
    newPlate.image = secure_url;

    try {
      const plateSave = await plateRepository.save(newPlate);

      //delete some category column
      delete plateSave.category.createdAt;
      delete plateSave.category.updateAt;
      delete plateSave.category.isActive;
      delete plateSave.category.user;
      delete plateSave.category.user;
      return res.json({ plateSave, message: "Creado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  ///****************************metodo para crear plato con 3 images***************************** */
  //   async create(req: Request, res: Response) {
  //     //console.log(JSON.parse(req.body.plate));
  //     //console.log(req.files!.archives);

  //     const archives = req.files!.archives as any;
  //     const tempFilePaths = archives.map((archive: any) => archive.tempFilePath);

  //     const {
  //       name = "",
  //       description = "",
  //       prepared_price = 0,
  //       sale_price = 0,
  //       stock = 0,
  //       idCategory = "",
  //     } = JSON.parse(req.body.plate);

  //     const nameToLowerCase = name.toLowerCase();

  //     let plateSave: any;
  //     let inserts = 0;

  //     if ([nameToLowerCase, idCategory].includes("")) {
  //       throw new BadRequestError("Hay Campo vacio");
  //     }

  //     if (archives.length > 3) {
  //       throw new BadRequestError("maximo 3 imagenes");
  //     }

  //     const plateName = await plateRepository.findOneBy({
  //       name: nameToLowerCase,
  //     });
  //     if (plateName) {
  //       throw new BadRequestError("Plato ya existe");
  //     }

  //     const category = await categoryRepository.findOneBy({ id: idCategory });
  //     if (!category) {
  //       throw new BadRequestError("Categoria no existe");
  //     }

  //     //delete some user column
  //     delete req.user.password;
  //     delete req.user.image;
  //     delete req.user.createdAt;
  //     delete req.user.isActive;
  //     delete req.user.role;
  //     delete req.user.updateAt;
  //     delete req.user.token;
  //     delete req.user.phone;
  //     delete req.user.lastname;

  //     const newPlate = plateRepository.create({
  //       name: nameToLowerCase,
  //       description,
  //       prepared_price,
  //       sale_price,
  //       stock,
  //       category,
  //     });
  //     newPlate.user = req.user;

  //     try {
  //       plateSave = await plateRepository.save(newPlate);

  //       //delete some category column
  //       delete plateSave.category.createdAt;
  //       delete plateSave.category.updateAt;
  //       delete plateSave.category.isActive;
  //       delete plateSave.category.user;
  //       delete plateSave.category.user;

  //       const start = async () => {
  //         await asyncForeach(tempFilePaths, async (archive: any) => {
  //           const secure_url = await uploadFileClaudinary(
  //             archive,
  //             `${folderNameApp}/${folderNamePlates}`
  //           );

  //           if (secure_url != undefined && secure_url != null) {
  //             // CREO LA IMAGEN EN CLAUDINARY
  //             if (inserts == 0) {
  //               plateSave.images = [...plateSave.images, secure_url];
  //             } else if (inserts == 1) {
  //               plateSave.images = [...plateSave.images, secure_url];
  //             } else if (inserts == 2) {
  //               plateSave.images = [...plateSave.images, secure_url];
  //             }
  //           }
  //           await plateRepository.update(
  //             { id: plateSave.id },
  //             { images: plateSave.images }
  //           );

  //           inserts = inserts + 1;

  //           if (inserts == tempFilePaths.length) {
  //             // TERMINO DE ALAMACENAR LAS TRES IMAGENES
  //             return res.status(201).json({
  //               plateSave,
  //               message: "Creado con exito",
  //             });
  //           }
  //         });
  //       };
  //       start();
  //     } catch (error) {
  //       console.log(error);
  //       throw new BadRequestError("revisar log servidor");
  //     }
  //   }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const numberOfPlates = await plateRepository.count();

      const plates = await plateRepository.find({
        where: {
          isActive: true,
        },
        relations: {
          category: true,
        },
        order: { createdAt: "DESC" },
        take: Number(limit),
        skip: Number(offset),
      });

      plates.map((plate) => {
        delete plate.user.password;
        delete plate.user.image;
        delete plate.user.createdAt;
        delete plate.user.isActive;
        delete plate.user.role;
        delete plate.user.updateAt;
        delete plate.user.token;
        delete plate.user.phone;
        delete plate.user.lastname;
        delete plate.category.createdAt;
        delete plate.category.updateAt;
        delete plate.category.isActive;
        delete plate.category.user;
      });

      return res.json({ plates, numberOfPlates });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async findAllByCategory(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;
    const { term } = req.params;

    try {
      const plates = await plateRepository.find({
        where: {
          isActive: true,
          category: {
            name: term,
          },
        },
        relations: {
          category: true,
        },
        order: { createdAt: "DESC" },
        take: Number(limit),
        skip: Number(offset),
      });

      plates.map((plate) => {
        delete plate.user.password;
        delete plate.user.image;
        delete plate.user.createdAt;
        delete plate.user.isActive;
        delete plate.user.role;
        delete plate.user.updateAt;
        delete plate.user.token;
        delete plate.user.phone;
        delete plate.user.lastname;
        delete plate.category.createdAt;
        delete plate.category.updateAt;
        delete plate.category.isActive;
        delete plate.category.user;
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
        where: { id: term },
        relations: {
          category: true,
        },
      });
    } else {
      plate = await plateRepository.findOne({
        where: { name: term.toLowerCase() },
        relations: {
          category: true,
        },
      });
    }

    if (!plate) throw new BadRequestError("Plato no existe");

    if (plate.isActive === false)
      throw new BadRequestError("plato no esta activo");

    delete plate.user.password;
    delete plate.user.image;
    delete plate.user.createdAt;
    delete plate.user.isActive;
    delete plate.user.role;
    delete plate.user.updateAt;
    delete plate.user.token;
    delete plate.user.phone;
    delete plate.user.lastname;
    delete plate.category.createdAt;
    delete plate.category.updateAt;
    delete plate.category.isActive;
    delete plate.category.user;

    return res.json(plate);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    const { idCategory, ...rest } = JSON.parse(req.body.plate);
    const { id } = req.params;
    const { tempFilePath } = req.files!.archive as any;
    let plateTosave;

    if (!isUUID(id)) throw new BadRequestError("Plato no valido");

    const plate = await plateRepository.findOneBy({ id });
    if (!plate) throw new BadRequestError("Platillo no existe");

    const category = await categoryRepository.findOneBy({ id: idCategory });
    if (!category) throw new BadRequestError("Categoria no existe");
    plate.category = category;

    // Limpiar imágenes previas cloudinary
    const arrayName = plate.image.split("/");
    const nameFile = arrayName[arrayName.length - 1];
    const [public_id] = nameFile.split(".");
    await destroyImageClaudinary(
      `${folderNameApp}/${folderNamePlates}/${public_id}`
    );

    const secure_url = await uploadFileClaudinary(
      tempFilePath,
      `${folderNameApp}/${folderNamePlates}`
    );

    try {
      await plateRepository.update(id, { ...rest, image: secure_url });

      const plateUpdate = await plateRepository.findOne({
        where: { id },
        relations: {
          category: true,
        },
      });

      delete plateUpdate!.user.password;
      delete plateUpdate!.user.image;
      delete plateUpdate!.user.createdAt;
      delete plateUpdate!.user.isActive;
      delete plateUpdate!.user.role;
      delete plateUpdate!.user.updateAt;
      delete plateUpdate!.user.token;
      delete plateUpdate!.user.phone;
      delete plateUpdate!.user.lastname;

      delete plateUpdate!.category.createdAt;
      delete plateUpdate!.category.updateAt;
      delete plateUpdate!.category.isActive;
      delete plateUpdate!.category.user;

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
      // Limpiar imágenes previas
      const arrayName = plate.image.split("/");
      const nameFile = arrayName[arrayName.length - 1];
      const [public_id] = nameFile.split(".");
      await destroyImageClaudinary(
        `${folderNameApp}/${folderNamePlates}/${public_id}`
      );

      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
