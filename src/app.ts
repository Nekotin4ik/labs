import express, { Express, NextFunction, Response, Request } from 'express';
import { Server } from 'http';
// import { userRouter } from './users/user.router';
import { ExeptionFilter } from './errors/exeption.filter';
// import { IExeptionFilter } from './errors/exeption.filter.interface';
// import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { MiddlewareService } from './common/middleware.service';
import { UserController } from './users/users.controller';
import { UserRegisterDto } from './users/dto/user-register.dto';
import { UserLoginDto } from './users/dto/user-login.dto';
import { PrismaService } from './database/prisma.service';
import { json } from 'body-parser';
import { AuthMiddleware } from './common/auth.middleware';
import { ConfigService } from './config/config.service';

export class App {
    app: Express;
    server: Server;
    port: number;
    exeptionFilter: ExeptionFilter;
    logger: LoggerService;
    middlewareService: MiddlewareService;
    userController: UserController;
    prismaService: PrismaService;
    configService: ConfigService;

    constructor(
        logger: LoggerService,
        userController: UserController,
        exeptionFilter: ExeptionFilter,
        middlewareService: MiddlewareService,
        prismaService: PrismaService,
        configService: ConfigService,
    ) {
        this.app = express();
        this.port = 8000;
        this.logger = logger;
        this.userController = userController;
        this.exeptionFilter = exeptionFilter;
        this.middlewareService = middlewareService;
        this.prismaService = prismaService;
        this.configService = configService;
    }

    useMiddleware(): void {
        this.app.use(json());
        // this.app.use(this.middlewareService.execute.bind(this.middlewareService));
        const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
        this.app.use(authMiddleware.execute.bind(authMiddleware));
    }

    useRoutes(): void {
        this.app.use('/users', this.userController.router);
        
    }

    useExeptionFilters(): void {
        this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
    }

    public async init(): Promise<void> {
        this.useMiddleware();
        this.useRoutes();
        this.useExeptionFilters();
        await this.prismaService.connect();
        this.server = this.app.listen(this.port);
        this.logger.log('I hope it works on http://localhost:' + this.port);    
    }
}