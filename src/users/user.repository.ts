import { GunModel, UserModel } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { LoggerService } from "../logger/logger.service";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository.interface";


export class UserRepository implements IUserRepository{
    prismaService: PrismaService;
    logger: LoggerService;

    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
    }

    async create({ email, password, name, role }: User): Promise<UserModel> {
        return this.prismaService.client.userModel.create({
            data: {
                email,
                password,
                name,
                role
            }
        });
    }

    async find(email: string): Promise<UserModel | null> {
        return this.prismaService.client.userModel.findFirst({
            where: {
                email,
                
            }
        })     
    }

    async findAll(): Promise<UserModel[] | null> {
        return this.prismaService.client.userModel.findMany({
            
        });
    }

    async updateUser(id: number, {email, name, password, role }: User): Promise<UserModel | null> {
        return this.prismaService.client.userModel.update({
            where: {
                id
            },
            data: {
                email,
                name,
                password,
                role
            }
        })
    }
    
    async removeUserByEmail(email: string): Promise<UserModel | null> {
        return this.prismaService.client.userModel.delete({
            where: {
                email
            }
        })
    }

    async findGunsByUser(user_id: number): Promise<GunModel[] | null> {
        return this.prismaService.client.gunModel.findMany({
            where: {
                user_id
            }
        })
    }
}