import { NextFunction, Request, Response } from "express";
import { IMiddleware } from "./middleware.interface";


export class AuthGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.user) {
            console.log(req.role);
            if (req.role == 'ADMIN') {
                return next();
            }
            res.status(403).send({ error: 'You don`t have a permission' });
        }
        res.status(401).send({ error: 'You are not authorized!' });
    }
}