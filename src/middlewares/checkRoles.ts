import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/api-erros";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthorizedError("No autorizado");
  }

  const { role } = req.user;

  if (role === "admin") {
    next();
  } else {
    throw new UnauthorizedError("Solo administrador puede Hacer eso");
  }
};
