import { GunModel, UserModel } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AuthGuard } from "../common/auth.guard";
import { BaseController } from "../common/base.controller";
import { BodyNameGuard } from "../common/body-name.guard";
import { MiddlewareService } from "../common/middleware.service";
import { PermissionGuard } from "../common/permission.guard";
import { HTTPError } from "../errors/http-error.class";
import { LoggerService } from "../logger/logger.service";
import { GunFindDto } from "./dto/gun-find.dto";
import { GunUpdateDto } from "./dto/gun-update.dto";
import { IGunController } from "./gun.controller.interface";
import { GunService } from "./gun.service";


export class GunController extends BaseController implements IGunController {
    loggerService: LoggerService;
    gunService: GunService;

    constructor(loggerService: LoggerService, gunService: GunService) {
        super(loggerService)
        this.loggerService = loggerService;
        this.gunService = gunService;
        this.bindRoutes([
            {
                path: '/buy',
                method: 'post',
                func: this.buyGun,
                middlewares: [new AuthGuard(), new MiddlewareService(GunFindDto, loggerService)]
            },
            {
                path: '/show_gun',
                method: 'get',
                func: this.showGun,
                middlewares: [new AuthGuard(), new PermissionGuard(), new BodyNameGuard()],
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
                path: '/show_owner',
                method: 'get',
                func: this.showOwner,
                middlewares: [new AuthGuard(), new PermissionGuard(), new BodyNameGuard()],
            },
            {
                path: '/show_guns',
                method: 'get',
                func: this.showGuns,
                middlewares: [new AuthGuard()],
            }
        ])
    }

    async buyGun({ body }: Request<{}, {}, GunFindDto>, res: Response, next: NextFunction): Promise<void> {
        const user = await this.gunService.getInfoUser(body.user_id); //или по другому?
        if (!user) {
            return next(new HTTPError(422, 'There is no such user!')); //необрабатываемый экземпляр
        }
        const result = await this.gunService.createGun(body);
            if (!result) {
                return next(new HTTPError(422, 'Such gun already exist!')); //необрабатываемый экземпляр
            }
            this.ok(res, { type: result.type, id: result.id })
    }

    async showGun({ body }: Request, res: Response, next: NextFunction): Promise<void> {
        const result = await this.gunService.getInfoGun(body.name);
        if (!result) {
            return next(new HTTPError(422, 'No such gun!')); //необрабатываемый экземпляр
        }
        this.ok(res, { name: result.name, type: result.type, weight: result.weight, calibre: result.caliber })
    }

    async updateGun({ body }: Request<{}, {}, GunUpdateDto>, res: Response, next: NextFunction): Promise<void> {
        const result = await this.gunService.updateGun(body);
        if (!result) {
            return next(new HTTPError(422, 'Can`t update gun!')); //необрабатываемый экземпляр
        }
        this.ok(
            res,
            {
                message: result.name + 'Was successfully update with: ',
                type: body.type,
                magazine_size: body.magazine_size,
                weight: body.weight,
                caliber: body.caliber
            })
    }

    async deleteGun({ body }: Request, res: Response, next: NextFunction): Promise<void> {
        const result = await this.gunService.deleteGun(body.name);
        if (!result) {
            return next(new HTTPError(422, 'No such gun!')); //необрабатываемый экземпляр
        }
        this.ok(res, { name: result.name, type: result.type, weight: result.weight, calibre: result.caliber })
    }

    //вывод владельца по названию оружия
    async showOwner({ body }: Request, res: Response, next: NextFunction): Promise<void> {
        if (!body.name) {
            return next(new HTTPError(400, 'There is no name in input')); //некорректный запрос
        }
        const result = await this.gunService.getInfoOwner(body.name);
        if (!result) {
            return next(new HTTPError(422, 'No such gun!')); //необрабатываемый экземпляр
        }
        this.ok(res, { name: result.name, email: result.email })
    }

    async showGuns({ body, role }: Request, res: Response, next: NextFunction): Promise<void> {
        const results = await this.gunService.getGuns(body.type, body.magazine_size, body.weight, body.caliber);
        if (!results) {
            return next(new HTTPError(400, 'Invalid input try to check data!')); //некорректный запрос
        } else if (results.length == 0) {
            return next(new HTTPError(422, 'No guns with such parametrs!')); //необрабатываемый экземпляр
        }
        if (role == 'ADMIN') {
            let results_output: [string, string, number, number, number, string][] = [];
            for (const result of results) {
                let owner = await this.gunService.getInfoOwner(result.name);
                if (owner != null) {
                    results_output.push([
                        result.name,
                        result.type,
                        result.magazine_size,
                        result.weight,
                        result.caliber,
                        owner.name,
                    ])
                } 
            }
            this.ok(res, results_output);
        } else {
            let results_output: [string, number, number, number][] = [];
            for (const result of results) {
                let owner = await this.gunService.getInfoOwner(result.name);
                if (owner != null) {
                    results_output.push([
                        result.type,
                        result.magazine_size,
                        result.weight,
                        result.caliber
                    ])
                } 
            }
            this.ok(res, results_output);
        }
        
        
    }
}