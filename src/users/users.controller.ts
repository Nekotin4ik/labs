import express, { NextFunction, Request, Response } from "express";
import { BaseController } from "../common/base.controller";
import { MiddlewareService } from "../common/middleware.service";
import { HTTPError } from "../errors/http-error.class";
import { ILogger } from "../logger/logger.interface";
import { LoggerService } from "../logger/logger.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserService } from "./user.service";
import { IUserService } from "./user.service.interface";
import { IUsersController } from "./users.controller.interface";


export class UserController extends BaseController implements IUsersController{
    // logger: LoggerService;
    userService: IUserService;
    loggerService: LoggerService;

    constructor(loggerService: LoggerService, userService: UserService) {
        super(loggerService);
        this.loggerService = loggerService;
        // this.logger = new LoggerService();
        this.userService = userService;
        this.bindRoutes([
            {
                path: "/login",
                method: "post",
                func: this.login,
                middlewares: [new MiddlewareService(UserLoginDto, loggerService)],
            },
            {
                path: "/register",
                method: "post",
                func: this.register,
                middlewares: [new MiddlewareService(UserRegisterDto, loggerService)],
            },
            {
				path: '/info',
				method: 'get',
				func: this.info,
			},
        ])
    }

    async login(
        req: Request<{}, {}, UserLoginDto>,
        res: Response,
        next: NextFunction
        ): Promise<void> {
        const result = await this.userService.validateUser(req.body);
        if (!result) {
            return next(new HTTPError(401, 'Auth Error!', 'login'));
        }
        this.loggerService.log('success');
    }

    async register(
        { body }: Request<{}, {}, UserRegisterDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = await this.userService.createUser(body);
        if (!result) {
            return next(new HTTPError(422, 'Suh user exist'));
        }
        this.ok(res, { email: result.email, id: result.id });
    }      
    
    // async info(
	// 	{ user }: Request<{}, {}, UserRegisterDto>,
	// 	res: Response,
	// 	next: NextFunction,
	// ): Promise<void> {
	// 	const userInfo = await this.userService.getUserInfo(user);
	// 	//user может быть налом, потому вопросики
	// 	this.ok(res, { email: userInfo?.email, id: userInfo?.id });

    // }
    async info() {

    }

}