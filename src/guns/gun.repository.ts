import { GunModel, Prisma, UserModel } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { LoggerService } from "../logger/logger.service";
import { Gun } from "./gun.entity";
import { IGunRepository } from "./gun.repository.interface";


export class GunRepository implements IGunRepository{
    prismaService: PrismaService;
    logger: LoggerService;

    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
    }

    async create({ name, type, magazine_size, weight, caliber, user_id }: Gun): Promise<GunModel> {
        return this.prismaService.client.gunModel.create({
            data: {
                name,
                type,
                magazine_size,
                weight,
                caliber,
                user_id
            }
        })
    }

    async find(name: string): Promise<GunModel | null> {
        return this.prismaService.client.gunModel.findUnique({
            where: {
                name
            }
        })
    }

    async updateGun(
        id: number,
        type: string,
        magazine_size: number,
        weight: number,
        caliber: number
    ): Promise<GunModel | null> {
        return this.prismaService.client.gunModel.update({
            where: {
                id
            },
            data: {
                type,
                magazine_size,
                weight,
                caliber
            }
        })
    }

    async removeGun(name: string): Promise<GunModel | null> {
        return this.prismaService.client.gunModel.delete({
            where: {
                name
            }
        })
    }

    async findGuns(
        role: string,
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ): Promise<GunModel[] | {type: string, magazine_size: number, weight: number, caliber: number}[] | null> {
        try {
            if (role == 'USER') {
                return await this.prismaService.client.gunModel.findMany({
                    where: {
                        type,
                        magazine_size,
                        weight,
                        caliber
                    },
                    select: {
                        type: true,
                        magazine_size: true,
                        weight: true,
                        caliber: true
                    }
                })
            }
            return await this.prismaService.client.gunModel.findMany({
                where: {
                    type,
                    magazine_size,
                    weight,
                    caliber
                }
            })
        } catch (e) {
            return null;
        }
    }

    async findOwner(id: number): Promise<UserModel | null> {
        return this.prismaService.client.userModel.findFirst({
            where: {
                id
            }
        })
    }
}