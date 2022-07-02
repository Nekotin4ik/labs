import { UserModel } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository.interface";


export class UserRepository implements IUserRepository{
    prismaService: PrismaService;

    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
    }

    async create({email, password, name}: User): Promise<UserModel> {
        return this.prismaService.client.userModel.create({
            data: {
                email,
                password,
                name
            }
        });
    }

    async find(email: string): Promise<UserModel | null> {
        return this.prismaService.client.userModel.findFirst({
            where: {
                email
            }
        })
    }
}