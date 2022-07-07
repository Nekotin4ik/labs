import { GunModel, UserModel } from "@prisma/client";
import { HTTPError } from "../errors/http-error.class";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserUpdateDto } from "./dto/user-update.dto";


export interface IUserService {
    createUser: (dto: UserRegisterDto) => Promise<UserModel | HTTPError | null>;
    validateUser: (dto: UserLoginDto) => Promise<Boolean | HTTPError>;
    getUserInfo: (email: string) => Promise<UserModel | null>;
    updateUser: (id: number, { email, name, password, role}: UserUpdateDto) => Promise<UserModel | null>;
    deleteUser: (email: string) => Promise<[UserModel, number] | null>;
    getGunsByUser: (email: string) => Promise<GunModel[] | null>;
    getAllUsersShortInfo: () => Promise<{email: string, name: string}[] | null>;
    getAllUsersFullInfo: () => Promise<UserModel[] | null>;
}