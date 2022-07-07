import { NextFunction, Request, Response } from "express";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
import { IMiddleware } from "./middleware.interface";


export class AuthGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.user) {
            return next();
        }
        return next(new GlobalError([
            new HTTPError('Authorization', 403, 'You are not authorized!', undefined, {user: req.user})
        ]))
        // res.status(400).send({ error: 'You are not authorized!' });
    }
}