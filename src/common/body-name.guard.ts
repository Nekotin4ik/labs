import { NextFunction, Request, Response } from "express";
import { IMiddleware } from "./middleware.interface";


export class BodyNameGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if (req.body.name) {
            return next();
        }
        res.status(400).send({ error: 'Field name is requiered!' }); //некорректный запрос
    }
}