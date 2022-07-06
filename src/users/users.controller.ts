import { UserModel } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { AuthGuard } from "../common/auth.guard";
import { BaseController } from "../common/base.controller";
import { MiddlewareService } from "../common/middleware.service";
import { PermissionGuard } from "../common/permission.guard";
import { UserUpdateGuard } from "../common/user-update.guard";
import { ConfigService } from "../config/config.service";
import { HTTPError } from "../errors/http-error.class";
import { ILogger } from "../logger/logger.interface";
import { LoggerService } from "../logger/logger.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserUpdateDto } from "./dto/user-update.dto";
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
				path: "/update",
				method: "post",
				func: this.updateUser,
                middlewares: [new AuthGuard(), new UserUpdateGuard(), new MiddlewareService(UserUpdateDto, loggerService)],
			},
            {
                path: "/all_users",
                method: "get",
                func: this.showUsers,
                middlewares: [new AuthGuard()],
            },
            {
                path: "/remove",
                method: "delete",
                func: this.removeUser,
                middlewares: [new AuthGuard()],
            },
            {
                path: "/user_guns",
                method: "get",
                func: this.showGunsOfUsers,
                middlewares: [new AuthGuard()],
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
    }

    async register(
        { body }: Request<{}, {}, UserRegisterDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = await this.userService.createUser(body);
        if (!result) {
            return next(new HTTPError(400, 'Such user already exist!')); //некоректный запрос
        }
        this.ok(res, { email: result.email, id: result.id });
    }      
    
    async info(
        { user }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const userInfo = await this.userService.getUserInfo(user);
        if (!userInfo) {
            return next(new HTTPError(402, 'There is no such user, wait... You don`t even exist')); //необрабатываемый экземпляр
        }
        this.ok(res, { email: userInfo?.email, id: userInfo?.id, name: userInfo?.name });
    }

    async updateUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const user = await this.userService.getUserInfo(req.body.email);
        if (!user) {
            return next(new HTTPError(400, 'There is no such user!'));
        }
        const result = this.userService.updateUser(user.id, req.body);
        if (!result) {
            return next(new HTTPError(400, 'Can`t update this user!'));
        }
        this.ok(res, { message: 'User successfully updated!' });
    }

    async removeUser(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        if (!body.email) {
            return next(new HTTPError(400, 'Input is empty! Email is required!')); //некоректный запрос
        }
        const deletedUser = await this.userService.deleteUser(body.email);
        if (!deletedUser) {
            return next(new HTTPError(422, 'Can`t find user with such parametrs!')); //необрабатываемый экземпляр
        }
        this.ok(res, {
            email: deletedUser[0].email,
            id: deletedUser[0].id,
            name: deletedUser[0].name,
            role: deletedUser[0].role,
            amount_of_guns: deletedUser[1]
        });
    }

    async showUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const results = await this.userService.getAllUsers(req.role);
        if (!results || results.length == 0) {
            return next(new HTTPError(422, 'There are no users yet')); //необрабатываемый экземпляр
        }
        this.ok(res, results);  
    }

    async showGunsOfUsers(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        if (!body.email) {
            return next(new HTTPError(400, 'Input is empty!')); //некоректный запрос
        }
        const results = await this.userService.getGunsByUser(body.email)
        if (!results) {
            return next(new HTTPError(404, 'Can`t find such user!')); //не найдено
        } else if (results.length == 0) {
            this.ok(res, { message: 'This user has no guns!' });
        } else {
            this.ok(res, results);
        }
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