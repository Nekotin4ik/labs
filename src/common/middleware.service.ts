import { IMiddleware } from "./middleware.interface";
import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../logger/logger.service";
import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { HTTPError } from "../errors/http-error.class";
import { GlobalError } from "../errors/global-error.class";

export class MiddlewareService implements IMiddleware {
    logger: LoggerService;

    constructor(private classToValidate: ClassConstructor<object>, logger: LoggerService) {
        this.logger = logger;
    }
    execute({ body }: Request, res: Response, next: NextFunction): void {
        this.logger.log(body);
        const check = plainToClass(this.classToValidate, body);
        const global_errors: HTTPError[] = [];
        validate(check).then((errors) => {
            for (const error of errors) {
                global_errors.push(
                    new HTTPError(
                        'Data',
                        422,
                        'Wrong ' + error.property,
                        'Field "' + error.property + '" must exist and with correct type',
                        {property: error.property, value: error.value})
                )
                console.log(error);
            }
            if (global_errors.length > 0) {
                return next(new GlobalError(global_errors));
            } else {
                next();
            }
        }); 
    }
}