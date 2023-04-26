import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../helpers/api-erros";



export const isAdmin = async ( 
    req: Request,
    res: Response,
    next: NextFunction ) => {

    if ( !req.user ) {
        throw new UnauthorizedError("No autorizado");
    }

    const { roles} = req.user;
    
    if ( !roles?.includes("admin")) {
        throw new UnauthorizedError("Solo administrador puede Hacer eso");
    }

    next();
}

