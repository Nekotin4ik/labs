import { UserModel } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { getFactoryDetails } from "inversify/lib/utils/binding_utils";
import { getSymbolDescription } from "inversify/lib/utils/serialization";
import { sign } from "jsonwebtoken";
import { AuthGuard } from "../common/auth.guard";
import { BaseController } from "../common/base.controller";
import { MiddlewareService } from "../common/middleware.service";
import { PermissionGuard } from "../common/permission.guard";
import { UserUpdateGuard } from "../common/user-update.guard";
import { ConfigService } from "../config/config.service";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
import { ILogger } from "../logger/logger.interface";
import { LoggerService } from "../logger/logger.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserUpdateDto } from "./dto/user-update.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { IUserService } from "./user.service.interface";
import { IUsersController } from "./users.controller.interface";

export class UserController extends BaseController implements IUsersController {
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
                path: "/user_guns/:email",
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
        const errors: HTTPError[] = [];
        const result = await this.userService.validateUser(req.body);
        if (!result) {
            errors.push(
                new HTTPError('Authorization', 401, 'Wrong password!', undefined, {'password': req.body.password})
            );
        }
        if (result instanceof HTTPError) {
            errors.push(result);
        }
        const loggedUser = await this.userService.getUserInfo(req.body.email) as UserModel; //не сцать, мы перед этим проверили наявность юзера
        const jwt = await this.signJWT(loggedUser.email, this.configService.get('SECRET'), loggedUser.role);
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        }
        this.ok(res, { jwt });
    }

    async register(
        { body }: Request<{}, {}, UserRegisterDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const result = await this.userService.createUser(body);
        if (!result) {
            errors.push(
                new HTTPError('Data', 400, 'Such user already exist!', undefined, {email: body.email})
            ); //некоректный запрос
        } else if (result instanceof HTTPError) {
            errors.push(result);
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (result instanceof User) {
            this.ok(res, { email: result.email, id: result.id });
        }
    }

    async info(
        { user }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const userInfo = await this.userService.getUserInfo(user);
        if (!userInfo) {
            errors.push(
                new HTTPError('Data', 402, 'There is no such user, wait... You don`t even exist', undefined, {email: user})
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (userInfo instanceof User) {
            this.ok(res, { email: userInfo.email, id: userInfo.id, name: userInfo.name });
        }
    }
    async updateUser(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const user = await this.userService.getUserInfo(body.email);
        if (!user) {
            errors.push(
                new HTTPError('Data', 422, 'There is no such user!', undefined, {email: body.email})
            );
        } else if (user) {
            let detail = '';
            if (typeof body.name !== 'string') {
                detail += 'Field "name" must be "string"\n';
            } else if (typeof body.password !== 'string') {
                detail += 'Field "password" must be "string"\n';
            } else if (body.role != 'ADMIN' && body.role != 'USER') {
                detail += 'Field "role" must be "ADMIN" or "USER"\n';
            }
            if (detail.length > 0) {
                errors.push(
                    new HTTPError(
                        'Data',
                        400,
                        'Can`t update user with that parametrs!',
                        detail,
                        {name: body.name, password: body.password, role: body.role})
                );
            }
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (user) {
            const result = this.userService.updateUser(user.id, body);
        this.ok(res, { message: 'User successfully updated!' });
        }
    }

    async removeUser(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        if (!body.email) {
            errors.push(
                new HTTPError('Data', 400, 'Input is empty!', 'Field "email" is empty! Email is required!', {email: body.email})
            ); //некоректный запрос
        }
        const deletedUser = await this.userService.deleteUser(body.email);
        if (!deletedUser) {
            errors.push(
                new HTTPError('Data', 422, 'Can`t find such user!', undefined, {email: body.email})
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (deletedUser) {
            this.ok(res, {
                email: deletedUser[0].email,
                id: deletedUser[0].id,
                name: deletedUser[0].name,
                role: deletedUser[0].role,
                amount_of_guns: deletedUser[1]
            });
        }
    }

    async showUsers(
        { role }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        let results = undefined;
        if (role == 'ADMIN') {
            results = await this.userService.getAllUsersFullInfo();
        } else if (role == 'USER') {
            results = await this.userService.getAllUsersShortInfo();
        }
        if (!results || results.length == 0) {
            errors.push(
                new HTTPError('Data', 422, 'There are no users yet')
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        }
        this.ok(res, results);
    }

    async showGunsOfUsers(
        { params }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        if (!params.email) {
            errors.push(
                new HTTPError('Data', 400, 'Input is empty!', 'Field "email" is required!', {email: params.email})
            ); //некоректный запрос
        }
        const results = await this.userService.getGunsByUser(params.email)
        if (!results) {
            errors.push(
                new HTTPError('Data', 404, 'Can`t find such user!', undefined, {email: params.email})
            ); //не найдено
        } else if (results.length == 0) {
            this.ok(res, { message: 'This user has no guns!' });
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
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