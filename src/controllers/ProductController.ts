import { isUUID } from "class-validator";
import { Request, Response } from "express";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import { Product } from "../entities/Product";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { categoryRepository } from "../repositories/categoryRepository";
import { productRepository } from "../repositories/productRepository";

export class ProductController {
  async create(req: Request, res: Response) {
    //console.log(req.body);
    //console.log(req.files!.archives);

    const {
      name = "",
      description = "",
      prepared_price = 0,
      sale_price = 0,
      stock = 0,
      category = "",
    } = req.body;

    // let newImages: string[] = [];
    const archives = req.files!.archives as any;
    const tempFilePaths = archives.map((archive: any) => archive.tempFilePath);

    //const { tempFilePath } = req.files!.archive as any;

    if ([name, category].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    if (!isUUID(category)) throw new BadRequestError("Categoria no valido");

    const productName = await productRepository.findOneBy({ name });
    if (productName) {
      throw new BadRequestError("Producto ya existe");
    }

    const categoryName = await categoryRepository.findOneBy({ id: category });
    if (!categoryName) {
      throw new BadRequestError("Categoria no existe");
    }

    const newProduct = productRepository.create({
      name,
      description,
      prepared_price,
      sale_price,
      stock,
      category,
    });
    newProduct.user = req.user;
    //claudininary
    // const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
    // newProduct.image = secure_url;

    const newImages = tempFilePaths.map(async (archive: any) => {
      const result = await cloudinary.uploader.upload(archive);
      // newProduct.images = [...newProduct.images, secure_url];
      // newImages = [...newImages, secure_url];
      return result.secure_url;
    });

    newProduct.images.push(newImages);

    //res.json(newImages);
    // console.log(newProduct.images);
    try {
      //  await productRepository.save(newProduct);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findAll(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const products = await productRepository.find({
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

      return res.json(products);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  //********************************************************************** */

  async findOne(req: Request, res: Response) {
    const { term } = req.params;
    let product: Product | null;

    if (isUUID(term)) {
      product = await productRepository.findOne({
        where: { id: term, user: { id: req.user.id } },
      });
    } else {
      product = await productRepository.findOne({
        where: { name: term.toLowerCase(), user: { id: req.user.id } },
      });
    }

    if (!product) throw new BadRequestError("Producto no existe");

    if (product.user.id !== req.user.id)
      throw new UnauthorizedError("acceso no permitido");

    if (product.isActive === false)
      throw new BadRequestError("producto no esta activo");

    return res.json(product);
  }

  //********************************************************************** */

  async update(req: Request, res: Response) {
    const {
      name,
      description,
      prepared_price,
      sale_price,
      stock,
      category,
      isActive,
    } = req.body;
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Producto no valido");

    const product = await productRepository.findOneBy({ id });
    if (!product) throw new BadRequestError("Producto no existe");

    if (product.user.id !== req.user.id)
      throw new UnauthorizedError("acceso no permitido");

    product.name = name || product.name;
    product.description = description || product.description;
    product.prepared_price = prepared_price || product.prepared_price;
    product.sale_price = sale_price || product.sale_price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    product.isActive = isActive;

    try {
      await productRepository.save(product);

      const productUpdate = await productRepository.findOneBy({ id });
      return res.json({ productUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params;

    if (!isUUID(id)) throw new BadRequestError("Cliente no valida");

    const product = await productRepository.findOneBy({ id });
    if (!product) throw new BadRequestError("Producto no existe");

    if (product.user.id !== req.user.id)
      throw new UnauthorizedError("acceso no permitido");

    try {
      await productRepository.delete(id);
      return res.json({ message: "Eliminado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
