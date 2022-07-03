import { UserModel } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { AuthGuard } from "../common/auth.guard";
import { BaseController } from "../common/base.controller";
import { MiddlewareService } from "../common/middleware.service";
import { ConfigService } from "../config/config.service";
import { HTTPError } from "../errors/http-error.class";
import { ILogger } from "../logger/logger.interface";
import { LoggerService } from "../logger/logger.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserService } from "./user.service";
import { IUserService } from "./user.service.interface";
import { IUsersController } from "./users.controller.interface";


export class UserController extends BaseController implements IUsersController{
    userService: IUserService;
    loggerService: LoggerService;
    configService: ConfigService;

    constructor(loggerService: LoggerService, userService: UserService, configService: ConfigService) {
        super(loggerService);
        this.loggerService = loggerService;
        this.userService = userService;
        this.configService = configService;
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
				path: "/info",
				method: "get",
				func: this.info,
                middlewares: [new AuthGuard()],
			},
            {
                path: "/all_users",
                method: "get",
                func: this.showUsers,
                middlewares: [new AuthGuard()],
            },
            {
                path: "/remove",
                method: "post",
                func: this.removeUser,
            }
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
        const loggedUser = await this.userService.getUserInfo(req.body.email) as UserModel; //не сцать, мы перед этим проверили наявность юзера
        const jwt = await this.signJWT(loggedUser.email, this.configService.get('SECRET'), loggedUser.role);
        this.ok(res, { jwt });
        this.loggerService.log('success');
    }

    async register(
        { body }: Request<{}, {}, UserRegisterDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = await this.userService.createUser(body);
        if (!result) {
            return next(new HTTPError(422, 'Such user already exist!'));
        }
        this.ok(res, { email: result.email, id: result.id });
    }      
    
    async info(
        { user }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const userInfo = await this.userService.getUserInfo(user);
        this.ok(res, { email: userInfo?.email, id: userInfo?.id, name: userInfo?.name });
    }

    async removeUser(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const deletedUser = await this.userService.deleteUser(body.id, body.email);
        if (!deletedUser) {
            return next(new HTTPError(433, 'Can`t find user with such parametrs!'));
        }
        this.ok(res, {
            email: deletedUser?.email,
            id: deletedUser?.id,
            name: deletedUser?.name,
            role: deletedUser?.role
        });
    }

    async showUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const results = await this.userService.getAllUsers();
        if (!results || results.length == 0) {
            return next(new HTTPError(433, 'There are no users yet'));
        }
        this.ok(res, results);
    }

    private signJWT(
        email: string,
        secret: string,
        role: string
    ): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
                    role,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}

}