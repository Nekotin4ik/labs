import { Request, Response, NextFunction } from "express";
import { ILogger } from "../logger/logger.interface";
import { LoggerService } from "../logger/logger.service";
import { IExeptionFilter } from "./exeption.filter.interface";
import { GlobalError } from "./global-error.class";
import { HTTPError } from "./http-error.class";

export class ExeptionFilter implements IExeptionFilter{
    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    catch(err: Error | GlobalError, req: Request, res: Response, next: NextFunction): void {
        if (err instanceof GlobalError) {
            this.logger.error(' Ошибка ' + err.general_status_code + ': ' + err.general_message);
            res.status(err.general_status_code).send({ ERROR: err.errors });
        } else {
            this.logger.error(err.message);
            res.status(500).send({ err: err.message });
        }
    }
}

// catch(err: Error | HTTPError, req: Request, res: Response, next: NextFunction): void {
//     if (err instanceof HTTPError) {
//         this.logger.error('[' + err.context + '] Ошибка ' + err.statusCode + ': ' + err.message);
//         res.status(err.statusCode).send({ err: err.message });
//     } else {
//         this.logger.error(err.message);
//         res.status(500).send({ err: err.message });
//     }
// }