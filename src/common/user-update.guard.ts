import { NextFunction, Request, Response } from "express";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
// import { HTTPErrorr } from "../errors/test.class";
import { IMiddleware } from "./middleware.interface";


export class UserUpdateGuard implements IMiddleware {
    execute(req: Request, res: Response, next: NextFunction): void {
        if ((req.user === req.body.email && !(req.role == 'USER' && req.body.role == 'ADMIN'))
        || (req.role == 'ADMIN' && req.body.role == 'USER')) {
            next();
        } else {
            return next(new GlobalError([
                new HTTPError(
                    'Authorization',
                    403,
                    'You don`t have permission!',
                    undefined,
                    {'Your role': req.role, 'Aimed role': req.body.role}
                )
            ]));
        }
    }
}