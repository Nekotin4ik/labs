import { NextFunction, Request, Response } from "express";
import { HTTPError } from "../errors/http-error.class";
import { IMiddleware } from "./middleware.interface";


export class UserUpdateGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.role == 'USER' && req.body.role == 'ADMIN') {
            return next(new HTTPError(403, 'You don`t have permission!'));
        } else if (req.user === req.body.email || (req.role == 'ADMIN' && req.body.role == 'USER')) {
            next();
        } else {
            return next(new HTTPError(403, 'You don`t have permission!'));
        }
    }
}