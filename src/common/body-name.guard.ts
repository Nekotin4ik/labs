import { NextFunction, Request, Response } from "express";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
import { IMiddleware } from "./middleware.interface";


export class BodyNameGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.body.name) {
            return next();
        }
        return next(new GlobalError([
            new HTTPError('Data', 400, 'Field "name" is requiered!', undefined, {name: req.body.name})
        ])); //некорректный запрос
    }
}