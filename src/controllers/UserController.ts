import { Request, Response } from "express";
import { BadRequestError } from "../helpers/api-erros";
import { userRepository } from "../repositories/userRepository";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

import generarId from "../helpers/generarId";
import { IUser } from "../interfaces";
import { isUUID } from "class-validator";
import {
  destroyImageClaudinary,
  folderNameApp,
  folderNameUsers,
  uploadFileClaudinary,
} from "../helpers/claudinary";

export class UserController {
  async create(req: Request, res: Response) {
    //  console.log(JSON.parse(req.body.user));

    // const { name = "", email = "", password = "" } = req.body;

    const { name = "", email = "", password = "" } = JSON.parse(
      req.body.user
    ) as IUser;

    const emailToLowerCase = email.toLowerCase();

    const { tempFilePath } = req.files!.archive as any;

    if ([name, emailToLowerCase, password].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const userExists = await userRepository.findOneBy({
      email: emailToLowerCase,
    });

    if (userExists) {
      throw new BadRequestError("Usuario ya existe");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email: emailToLowerCase,
      password: hashPassword,
    });

    const secure_url = await uploadFileClaudinary(
      tempFilePath,
      `${folderNameApp}/${folderNameUsers}`
    );
    newUser.image = secure_url;
    try {
      await userRepository.save(newUser);
      return res.status(201).json({ message: "Registrado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  async login(req: Request, res: Response) {
    const { email = "", password = "" } = req.body;

    const emailToLowerCase = email.toLowerCase();

    if ([emailToLowerCase, password].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const user = await userRepository.findOneBy({ email: emailToLowerCase });

    if (!user) {
      throw new BadRequestError("Email o password no valido");
    }

    const verifyPass = await bcrypt.compare(password, user.password);

    if (!verifyPass) {
      throw new BadRequestError("Email o password no valido");
    }

    // if (!user.isActive) {
    //   throw new BadRequestError("Tu cuenta no ha sido confirmado");
    // }

    const token = jwt.sign({ id: user.id }, process.env.JWT_PASS ?? "", {
      expiresIn: "12h",
    });

    const { password: _, ...userLogin } = user;

    return res.json({
      user: userLogin,
      token: token,
    });
  }

  /*********************************************************************/

  async getProfile(req: Request, res: Response) {
    return res.json(req.user);
  }

  /*********************************************************************/

  async confirmAccount(req: Request, res: Response) {
    const { token } = req.params;
    const userConfirm = await userRepository.findOneBy({ token });

    if (!userConfirm) {
      throw new BadRequestError("Token no válido");
    }

    try {
      userConfirm.token = "";
      userConfirm.isActive = true;
      await userRepository.save(userConfirm);

      res.json({ message: "Usuario Confirmado Con Exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body;

    const emailToLowerCase = email.toLowerCase();

    const userExist = await userRepository.findOneBy({
      email: emailToLowerCase,
    });
    if (!userExist) {
      throw new BadRequestError("El Usuario no existe");
    }

    try {
      userExist.token = generarId();
      await userRepository.save(userExist);

      // Enviar Email con instrucciones
      //   emailForgetPassword({
      // 	email,
      // 	name: userExist.name,
      // 	token: userExist.token,
      //   });

      res.json({ message: "Hemos enviado un email con las instrucciones" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async verifyToken(req: Request, res: Response) {
    const { token } = req.params;

    const ValidToken = await userRepository.findOneBy({ token });

    if (ValidToken) {
      // El TOken es válido el usuario existe
      res.json({ message: "Token válido y el usuario existe" });
    } else {
      throw new BadRequestError("Token no válido");
    }
  }

  /*********************************************************************/

  async newPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userRepository.findOneBy({ token });
    if (!user) {
      throw new BadRequestError("Hubo un error");
    }

    try {
      user.token = "";
      user.password = await hash(password, 10);
      await userRepository.save(user);
      res.json({ message: "Password modificado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async updateProfileWithImage(req: Request, res: Response) {
    const { id } = req.user as IUser;
    const { tempFilePath } = req.files!.archive as any;
    const { name, phone, lastname } = JSON.parse(req.body.user);

    if (!isUUID(id)) {
      const e = new Error("usuario no valida");
      return res.status(400).json({ message: e.message });
    }

    const user = await userRepository.findOneBy({ id });
    if (!user) {
      const e = new Error("usuario no existe");
      return res.status(400).json({ message: e.message });
    }

    // Limpiar imágenes previas cloudinary
    const arrayName = user.image.split("/");
    const nameFile = arrayName[arrayName.length - 1];
    const [public_id] = nameFile.split(".");
    await destroyImageClaudinary(
      `${folderNameApp}/${folderNameUsers}/${public_id}`
    );

    const secure_url = await uploadFileClaudinary(
      tempFilePath,
      `${folderNameApp}/${folderNameUsers}`
    );
    user.image = secure_url;

    try {
      user.name = name || user.name;
      user.lastname = lastname || user.lastname;
      user.phone = phone || user.phone;

      const userUpdate = await userRepository.save(user);
      res.json({ userUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      const e = new Error("hubo un error");
      return res.status(400).json({ message: e.message });
    }
  }

  async updateProfileWithoutImage(req: Request, res: Response) {
    const { id } = req.user as IUser;
    const { name, phone, lastname } = req.body;

    if (!isUUID(id)) {
      const e = new Error("usuario no valida");
      return res.status(400).json({ message: e.message });
    }

    const user = await userRepository.findOneBy({ id });
    if (!user) {
      const e = new Error("usuario no existe");
      return res.status(400).json({ message: e.message });
    }

    try {
      user.name = name || user.name;
      user.lastname = lastname || user.lastname;
      user.phone = phone || user.phone;

      const userUpdate = await userRepository.save(user);
      res.json({ userUpdate, message: "Editado con exito" });
    } catch (error) {
      console.log(error);
      const e = new Error("hubo un error");
      return res.status(400).json({ message: e.message });
    }
  }

  /*********************************************************************/

  async updatePassword(req: Request, res: Response) {
    const { id } = req.user;
    const { pwd_now, pwd_new } = req.body;
    //console.log(pwd_now, pwd_new);

    // Comprobar que el veterinario existe
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestError("Usuario no existe");
    }

    const verifyPass = await bcrypt.compare(pwd_now, user.password);

    if (!verifyPass) {
      throw new BadRequestError("password actual no valido");
    }

    try {
      user.password = await bcrypt.hash(pwd_new, 10);
      await userRepository.save(user);
      res.json({ message: "Password editado Con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("hubo un error");
    }
  }

  async getByAdmin(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;

    try {
      const numberOfUsers = await userRepository.count();
      const users = await userRepository.find({
        take: Number(limit),
        skip: Number(offset),
      });

      return res.json({ users, numberOfUsers });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
}
