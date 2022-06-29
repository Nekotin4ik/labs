import { Request, Response, NextFunction } from "express";
import { ILogger } from "../logger/logger.interface";
//import {};

export class ExeptionFilter {
    local_logger: ILogger;

    catch(err: Error, req: Request, res: Response, next: NextFunction): void {
        this.local_logger.error(err.message);
        res.status(500).send({ err: err.message });
    }
}