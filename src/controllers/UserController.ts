import { Request, Response } from "express";
import { BadRequestError } from "../helpers/api-erros";
import { userRepository } from "../repositories/userRepository";
import bcrypt, { hash, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import generarId from "../helpers/generarId";
import emailForgetPassword from "../helpers/emailForgetPassword";
import emailRegister from "../helpers/emailRegister";
import { IUser } from "../interfaces";
import { MessagePort } from "worker_threads";

export class UserController {
  async create(req: Request, res: Response) {
    const {
      name = "",
      email = "",
      password = "",
      phone = "",
      address = "",
      web = "",
    } = req.body as IUser;

    if ([name, email, password].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const userExists = await userRepository.findOneBy({ email });

    if (userExists) {
      throw new BadRequestError("Usuario ya existe");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      web,
    });

    try {
      await userRepository.save(newUser);
      // send email
      //   emailRegister({
      //     email,
      //     name,
      //     token: newUser.token,
      //   });

      //const { password: _, ...user } = newUser;

      return res.status(201).json({ message: "Registrado con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async createByAdmin(req: Request, res: Response) {
    const {
      name = "",
      email = "",
      password = "",
      phone = "",
      address = "",
      web = "",
      roles = "",
    } = req.body;

    if ([name, email, password, roles].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const userExists = await userRepository.findOneBy({ email });

    if (userExists) {
      throw new BadRequestError("Usuario ya existe");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      web,
      roles,
    });

    try {
      await userRepository.save(newUser);

      // send email
      //   emailRegister({
      //     email,
      //     name,
      //     token: newUser.token,
      //   });

      const { password: _, ...user } = newUser;

      return res.status(201).json(user);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async getAllUsersByAdmin(req: Request, res: Response) {
    const { limit = 10, offset = 0 } = req.query;
    try {
      const users = await userRepository.find({
        where: {
          isActive: true,
        },
        take: Number(limit),
        skip: Number(offset),
      });

      return res.json(users);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }
  /***************************************************************************** */
  async updateUserByAdmin(req: Request, res: Response) {
    const { id } = req.params;
    const { email } = req.body;

    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestError("usuario no existe");
    }

    if (user.email !== req.body.email) {
      const existEmail = await userRepository.findOneBy({ email });

      if (existEmail) {
        throw new BadRequestError("Ese email ya esta en uso");
      }
    }

    try {
      const userUpdate = await userRepository.update(id!, req.body);
      res.json(userUpdate);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async login(req: Request, res: Response) {
    const { email = "", password = "" } = req.body;

    if ([email, password].includes("")) {
      throw new BadRequestError("Hay Campo vacio");
    }

    const user = await userRepository.findOneBy({ email });

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
      expiresIn: "8h",
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

    const userExist = await userRepository.findOneBy({ email });
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

  async updateProfile(req: Request, res: Response) {
    const { id } = req.user;
    const { email, name, phone, address, web } = req.body;

    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestError("usuario no existe");
    }

    if (user.email !== req.body.email) {
      const existEmail = await userRepository.findOneBy({ email });

      if (existEmail) {
        throw new BadRequestError("Ese email ya esta en uso");
      }
    }

    try {
      const userUpdate = await userRepository.update(id!, {
        email,
        name,
        phone,
        address,
        web,
      });
      res.json(userUpdate);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("revisar log servidor");
    }
  }

  /*********************************************************************/

  async updatePassword(req: Request, res: Response) {
    // Leer los datos
    const { id } = req.user;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario existe
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestError("Ese email ya esta en uso");
    }

    const verifyPass = await bcrypt.compare(pwd_actual, user.password);

    if (!verifyPass) {
      throw new BadRequestError("password actual no valido");
    }

    try {
      user.password = pwd_nuevo;
      await userRepository.save(user);
      res.json({ msg: "Password Almacenado Con exito" });
    } catch (error) {
      console.log(error);
      throw new BadRequestError("hubo un error");
    }
  }
}
