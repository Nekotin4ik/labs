import express, { Express, NextFunction, Response, Request } from 'express';
import { Server } from 'http';
import { userRouter } from './users/user.router';
import { ExeptionFilter } from './errors/exeption.filter';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';

export class App {
    app: Express;
    server: Server;
    port: number;
    exeptionFilter: ExeptionFilter;
    logger: LoggerService;

    constructor(logger: LoggerService, exeptionFilter: ExeptionFilter) {
        this.app = express();
        this.port = 8000;
        this.logger = logger;
        this.exeptionFilter = exeptionFilter;
    }

    useRoutes(): void {
        this.app.use(userRouter);
        // const test = express.Router();
        // test.get('users/login', (req, res) => {
        //     res.send(req.body + req.header);
        // });
        
        // test.post('/hello', (req, res) => {
        //     res.status(200).send('hi');
        // })
    }

    useExeptionFilters(): void {
        this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
    }

    public init(): void {
        this.useRoutes();
        this.useExeptionFilters();
        this.server = this.app.listen(this.port);
        this.logger.log('Hmmm, i think i will work on http://localhost:' + this.port);    
    }
}