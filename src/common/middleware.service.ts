import { IMiddleware } from "./middleware.interface";
import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../logger/logger.service";
import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";

export class MiddlewareService implements IMiddleware {
    logger: LoggerService;

    constructor(private classToValidate: ClassConstructor<object>, logger: LoggerService) {
        this.logger = logger;
    }
    execute({ body }: Request, res: Response, next: NextFunction): void {
        this.logger.log(body);
        const check = plainToClass(this.classToValidate, body);
        validate(check).then((errors) => {
            if (errors.length > 0) {
                res.status(422).send(errors);
            } else {
                next();
            }
        }); 
    }
}