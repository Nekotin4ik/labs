import { NextFunction, Request, Response } from "express";
import { IMiddleware } from "./middleware.interface";


export class PermissionGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {    
        console.log(req.role);
        if (req.role == 'ADMIN') {
            return next();
        }
        res.status(403).send({ error: 'You don`t have a permission' }); //не уполномочен
    }
}