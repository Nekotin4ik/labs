import { NextFunction, Request, Response } from "express";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
import { IMiddleware } from "./middleware.interface";


export class PermissionGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {    
        console.log(req.role);
        if (req.role == 'ADMIN') {
            return next();
        }
        return next(new GlobalError([
            new HTTPError(
                'Authorization',
                403,
                'You don`t have a permission',
                'Probably You trying to perform things that aren`t allowed to USERs',
                {'Your role': req.role})
        ])); //не уполномочен
    }
}