import { UserModel } from "@prisma/client";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";


export interface IUserService {
    createUser: (dto: UserRegisterDto) => Promise<UserModel | null>;
    validateUser: (dto: UserLoginDto) => Promise<Boolean>;
    getUserInfo: (email: string) => Promise<UserModel | null>;
    deleteUser: (id: number, email?: string) => Promise<UserModel | null>;
    getAllUsers: () => Promise<UserModel[] | null>;
}