import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/api-erros";
import { userRepository } from "../repositories/userRepository";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new UnauthorizedError("No Hay token en la peticion");
  }

  try {
  const tokenJwt = authorization.split(" ")[1];
  const { id } = jwt.verify(tokenJwt, process.env.JWT_PASS ?? "") as JwtPayload;
  const user = await userRepository.findOneBy({ id });

  if (!user) {
    throw new UnauthorizedError("No autorizado");
  }
  const { password: _,token, ...loggedUser } = user;
  req.user = loggedUser;
  next();
} catch (error) { 
 throw new UnauthorizedError("Token no Válido");
}
};
