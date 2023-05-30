import { isUUID } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { Category } from "../entities/Category";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { categoryRepository } from "../repositories/categoryRepository";

export class CategoryController {
  async create(req: Request, res: Response) {
    const { name = "", description = "" } = req.body;

    const nameToLowerCase = name.toLowerCase();

    if ([nameToLowerCase, description].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const categoryExist = await categoryRepository.findOneBy({
      name: nameToLowerCase,
    });
    if (categoryExist) {
      throw new BadRequestError("Categoria ya existe");
    }

    delete req.user.password;
    delete req.user.image;
    delete req.user.createdAt;
    delete req.user.isActive;
    delete req.user.role;
    delete req.user.updateAt;
    delete req.user.token;
    delete req.user.phone;
    delete req.user.lastname;

    const newCategory = categoryRepository.create({
      name: nameToLowerCase,
      description,
    });
    newCategory.user = req.user;

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
      const numberOfCategories = await categoryRepository.count({
        where: {
          isActive: true,
        },
      });

      const categories = await categoryRepository.find({
        where: {
          isActive: true,
        },
        take: Number(limit),
        skip: Number(offset),
      });

      categories.map((category) => {
        delete category.user.password;
        delete category.user.image;
        delete category.user.createdAt;
        delete category.user.isActive;
        delete category.user.role;
        delete category.user.updateAt;
        delete category.user.token;
        delete category.user.phone;
        delete category.user.lastname;
      });

      return res.json({ categories, numberOfCategories });
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
        where: { id: term },
      });
    } else {
      category = await categoryRepository.findOne({
        where: { name: term.toLowerCase() },
      });
    }

    if (!category) throw new BadRequestError("Categoria no existe");

    if (category.isActive === false)
      throw new BadRequestError("category is not active");

    delete category.user.password;
    delete category.user.image;
    delete category.user.createdAt;
    delete category.user.isActive;
    delete category.user.role;
    delete category.user.updateAt;
    delete category.user.token;
    delete category.user.phone;
    delete category.user.lastname;

    return res.json(category);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    const { name, description, isActive } = req.body;
    const nameToLowerCase = name.toLowerCase();
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Categoria no valida");

    const category = await categoryRepository.findOneBy({ id });
    if (!category) throw new BadRequestError("Categoria no existe");

    category.name = nameToLowerCase || category.name;
    category.isActive = isActive || category.isActive;
    category.description = description || category.description;

    try {
      await categoryRepository.save(category);

      const categoryUpdate = await categoryRepository.findOneBy({ id });

      delete categoryUpdate!.user.password;
      delete categoryUpdate!.user.image;
      delete categoryUpdate!.user.createdAt;
      delete categoryUpdate!.user.isActive;
      delete categoryUpdate!.user.role;
      delete categoryUpdate!.user.updateAt;
      delete categoryUpdate!.user.token;
      delete categoryUpdate!.user.phone;
      delete categoryUpdate!.user.lastname;

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

    try {
      await categoryRepository.delete(id);
      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
