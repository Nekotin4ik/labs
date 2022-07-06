import { GunModel, UserModel } from "@prisma/client";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserUpdateDto } from "./dto/user-update.dto";


export interface IUserService {
    createUser: (dto: UserRegisterDto) => Promise<UserModel | null>;
    validateUser: (dto: UserLoginDto) => Promise<Boolean>;
    getUserInfo: (email: string) => Promise<UserModel | null>;
    updateUser: (id: number, { email, name, password, role}: UserUpdateDto) => Promise<UserModel | null>;
    deleteUser: (email: string) => Promise<[UserModel, number] | null>;
    getGunsByUser: (email: string) => Promise<GunModel[] | null>;
    getAllUsers: (role: string) => Promise<UserModel[] | {email: string, name: string}[] | null>;
}