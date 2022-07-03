import { UserModel } from "@prisma/client";
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
    
    async removeUserById(id: number, email?: string): Promise<UserModel | null> {
        try {
            if (id && email) {
                return await this.prismaService.client.userModel.delete({
                    where: {
                        id,
                        email
                    }
                })
            } else if (id) {
                return await this.prismaService.client.userModel.delete({
                    where: {
                        id
                    }
                })
            } else if (email) {
                return await this.prismaService.client.userModel.delete({
                    where: {
                        email
                    }
                })
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }
}