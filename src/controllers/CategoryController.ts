import { isUUID } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { Category } from "../entities/Category";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { categoryRepository } from "../repositories/categoryRepository";
import { ICategory } from "../interfaces";

export class CategoryController {
  async create(req: Request, res: Response) {
    // const { name = "", description = "" } = req.body;

    const { name = "", description = "" } = JSON.parse(
      req.body.category
    ) as ICategory;

    const { tempFilePath } = req.files!.archive as any;

    if ([name, description].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const categoryExist = await categoryRepository.findOneBy({ name });
    if (categoryExist) {
      throw new BadRequestError("Categoria ya existe");
    }
    const newCategory = categoryRepository.create({ name, description });
    newCategory.user = req.user;

    //claudininary
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
    newCategory.image = secure_url;
    try {
      await categoryRepository.save(newCategory);
      return res.status(201).json({ newCategory, message: "Creado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const categories = await categoryRepository.find({
        where: {
          isActive: true,
          user: { id: req.user.id },
        },
        take: Number(limit),
        skip: Number(offset),
      });

      return res.json(categories);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findOne(req: Request, res: Response) {
    const { term } = req.params;
    let category: Category | null;

    if (isUUID(term)) {
      if (!isUUID(term)) throw new BadRequestError("Categoria no valida");

      category = await categoryRepository.findOne({
        where: { id: term, user: { id: req.user.id } },
      });
    } else {
      category = await categoryRepository.findOne({
        where: { name: term.toLowerCase(), user: { id: req.user.id } },
      });
    }

    if (!category) throw new BadRequestError("Categoria no existe");

    if (category.user.id !== req.user.id)
      throw new UnauthorizedError("acceso no permitido");

    if (category.isActive === false)
      throw new BadRequestError("category is not active");

    return res.json(category);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    // const { name, description, isActive } = req.body;

    const { name, description, isActive } = JSON.parse(
      req.body.category
    ) as ICategory;
    const { id } = req.params;
    const { tempFilePath } = req.files!.archive as any;

    if (!isUUID(id)) throw new BadRequestError("Categoria no valida");

    const category = await categoryRepository.findOneBy({ id });
    if (!category) throw new BadRequestError("Categoria no existe");

    if (category.user.id !== req.user.id)
      throw new UnauthorizedError("acceso no permitido");

    // Limpiar imágenes previas cloudinary
    if (category.image) {
      const arrayName = category.image.split("/");
      const nameFile = arrayName[arrayName.length - 1];
      const [public_id] = nameFile.split(".");
      cloudinary.uploader.destroy(public_id);
    }

    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

    category.name = name || category.name;
    category.isActive = isActive || category.isActive;
    category.description = description || category.description;
    category.image = secure_url || category.image;

    try {
      await categoryRepository.save(category);

      const categoryUpdate = await categoryRepository.findOneBy({ id });
      return res.json({ categoryUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Categoria no valida");

    const category = await categoryRepository.findOneBy({ id });
    if (!category) throw new BadRequestError("Categoria no existe");

    // if (category.user.id !== req.user.id)
    //   throw new UnauthorizedError("acceso no permitido");

    // Limpiar imágenes previas cloudinary
    if (category.image) {
      const arrayName = category.image.split("/");
      const nameFile = arrayName[arrayName.length - 1];
      const [public_id] = nameFile.split(".");
      cloudinary.uploader.destroy(public_id);
    }

    try {
      await categoryRepository.delete(id);
      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
