import { GunModel, UserModel } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AuthGuard } from "../common/auth.guard";
import { BaseController } from "../common/base.controller";
import { BodyNameGuard } from "../common/body-name.guard";
import { MiddlewareService } from "../common/middleware.service";
import { PermissionGuard } from "../common/permission.guard";
import { GlobalError } from "../errors/global-error.class";
import { HTTPError } from "../errors/http-error.class";
import { LoggerService } from "../logger/logger.service";
import { GunFindDto } from "./dto/gun-find.dto";
import { GunUpdateDto } from "./dto/gun-update.dto";
import { IGunController } from "./gun.controller.interface";
import { Gun } from "./gun.entity";
import { GunService } from "./gun.service";


export class GunController extends BaseController implements IGunController {
    loggerService: LoggerService;
    gunService: GunService;
    message = 'There is no such gun!';

    constructor(loggerService: LoggerService, gunService: GunService) {
        super(loggerService)
        this.loggerService = loggerService;
        this.gunService = gunService;
        this.bindRoutes([
            {
                path: '/register',
                method: 'post',
                func: this.registerGun,
                middlewares: [new AuthGuard(), new MiddlewareService(GunFindDto, loggerService)]
            },
            {
                path: '/show_gun/:name',
                method: 'get',
                func: this.showGun,
                middlewares: [new AuthGuard(), new PermissionGuard()], //new BodyNameGuard()
            },
            {
                path: '/update',
                method: 'post',
                func: this.updateGun,
                middlewares: [new AuthGuard(),
                    new PermissionGuard(),
                    new BodyNameGuard(),
                    new MiddlewareService(GunUpdateDto, loggerService)
                ],
            },
            {
                path: '/remove',
                method: 'delete',
                func: this.deleteGun,
                middlewares: [new AuthGuard(), new PermissionGuard(), new BodyNameGuard()],
            },
            {
                path: '/show_owner/:name',
                method: 'get',
                func: this.showOwner,
                middlewares: [new AuthGuard(), new PermissionGuard()], //new BodyNameGuard()
            },
            {
                path: '/show_guns/:type?/:magazine_size?/:weight?/:caliber?',
                method: 'get',
                func: this.showGuns,
                middlewares: [new AuthGuard()],
            }
        ])
    }

    async registerGun(
        { body }: Request<{}, {}, GunFindDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const user = await this.gunService.getInfoUser(body.user_id); //или по другому? скорее всего переделать, через нормальные взаимосвязи в бд
        if (!user) {
            errors.push(
                new HTTPError(
                    'Data',
                    422,
                    'There is no such user!',
                    'Such user doesn`t exist. Try another email!',
                    {user_id: body.user_id}
                )
            ); //необрабатываемый экземпляр
        }
        const result = await this.gunService.createGun(body);
        if (!result) {
            errors.push(
                new HTTPError(
                    'Data',
                    422,
                    'Can`t create gun with parametrs!',
                    undefined,
                    {
                        name: body.name,
                        type: body.type,
                        magazine_size: body.magazine_size,
                        weight: body.weight,
                        caliber: body.caliber
                    }
                )
            );
        } else if (result instanceof HTTPError) {
            errors.push(result);
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (result && result instanceof Gun) {
            this.ok(res, { name: result.name, type: result.type });
        }
    }

    async showGun(
        { params }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const result = await this.gunService.getInfoGun(params.name);
        if (!result) {
            errors.push(
                new HTTPError('Data', 422, this.message, undefined, {name: params.name})
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (result) {
            this.ok(res, { name: result.name, type: result.type, weight: result.weight, calibre: result.caliber })
        }
        
    }

    async updateGun(
        { body }: Request<{}, {}, GunUpdateDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const result = await this.gunService.updateGun(body);
        if (!result) {
            errors.push(
                new HTTPError('Data', 422, 'Can`t update gun!', undefined)
            ); //необрабатываемый экземпляр
        } else if (result instanceof HTTPError) {
            errors.push(result);
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        }
        this.ok(
            res,
            {
                message: body.name + ' was successfully update with: ',
                type: body.type,
                magazine_size: body.magazine_size,
                weight: body.weight,
                caliber: body.caliber
            })
    }

    async deleteGun(
        { body }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        const result = await this.gunService.deleteGun(body.name);
        if (!result) {
            errors.push(
                new HTTPError(
                    'Data',
                    422,
                    this.message,
                    'Couldn`t find gun with this "name"!',
                    {name: body.name})
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (result) {
            this.ok(res, {
                message: 'Gun was successfully deleted:',
                name: result.name,
                type: result.type,
                weight: result.weight,
                calibre: result.caliber
            });
        }
    }

    //вывод владельца по названию оружия
    async showOwner(
        { params }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        if (!params.name) {
            errors.push(
                new HTTPError('Data', 400, 'Input is empty!', 'Parametr "name" mustn`t be empty!', {name: params.name})
            ); //некорректный запрос
        }
        const result = await this.gunService.getInfoOwner(params.name);
        if (!result) {
            errors.push(
                new HTTPError(
                    'Data',
                    422,
                    this.message,
                    'Couldn`t find a gun with this "name"',
                    {name: params.name}
                )
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (result) {
            this.ok(res, { name: result.name, email: result.email });
        }
    }

    async showGuns(
        { params, role }: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const errors: HTTPError[] = [];
        let magazine_size = undefined;
        let weight = undefined;
        let caliber = undefined;
        
        if (params.magazine_size) {
            magazine_size = parseInt(params.magazine_size);
        }
        if (params.weight) {
            weight = parseFloat(params.weight);
        }
        if (params.caliber) {
            caliber = parseFloat(params.caliber);
        }

        let results = undefined;
        if (role == 'ADMIN') {
            results = await this.gunService.getGunsFullInfo(params.type, magazine_size, weight, caliber);
        } else if (role == 'USER') {
            results = await this.gunService.getGunsShortInfo(params.type, magazine_size, weight, caliber);
        }
        //проверить отработку ошибки снизу
        if (!results) {
            errors.push(
                new HTTPError('Data', 400, 'Invalid input!', undefined)
            ); //некорректный запрос
        } else if (results.length == 0) {
            errors.push(
                new HTTPError(
                    'Data',
                    422,
                    this.message,
                    'Couldn`t find guns with received parametrs!',
                    {
                        type: params.type,
                        magazine_size: magazine_size,
                        weight: weight,
                        caliber: caliber})
            ); //необрабатываемый экземпляр
        }
        if (errors.length > 0) {
            return next(new GlobalError(errors));
        } else if (results) {
            this.ok(res, results);
        }
    }
}