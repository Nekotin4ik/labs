import { GunModel, UserModel } from "@prisma/client";
import { HTTPError } from "../errors/http-error.class";
import { GunRepository } from "../guns/gun.repository";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserUpdateDto } from "./dto/user-update.dto";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";
import { IUserService } from "./user.service.interface";


export class UserService implements IUserService{
    userRepository: UserRepository;
    gunRepository: GunRepository;

    constructor(userRepository: UserRepository, gunRepository: GunRepository) {
        this.userRepository = userRepository;
        this.gunRepository = gunRepository;
    }

    async validateUser({ email, password }: UserLoginDto): Promise<Boolean | HTTPError> {
        const errors: HTTPError[] = [];
        const existedUser = await this.userRepository.find(email);
        if (!existedUser) {
            return new HTTPError('Data', 403, 'Can`t find such user!', undefined, {email: email});
        }
        const newUser = new User(existedUser.email, existedUser.name, existedUser.role, existedUser.password);
        return newUser.comparePassword(password);
    }

    async createUser({ email, name, password, role }: UserRegisterDto): Promise<UserModel | HTTPError | null> {
        if (role != 'USER' && role != 'ADMIN' && role != undefined) {
            return new HTTPError('Data', 422, 'There is no such role!', undefined, {role: role});
        }
        //добавить логер?
        const newUser = new User(email, name, role);
        const salt = 10;
        await newUser.setPassword(password, salt);
        const existedUser = await this.userRepository.find(email);
        if (existedUser) {
            return null;
        }
        return this.userRepository.create(newUser);
    }

    async updateUser(id: number, { email, name, password, role}: UserUpdateDto): Promise<UserModel | null> {
        const updatedUser = new User(email, name, role);
        await updatedUser.setPassword(password, 10);
        return this.userRepository.updateUser(id, updatedUser);
    }

    async deleteUser(email: string): Promise<[UserModel, number] | null> {
        const user = await this.userRepository.find(email);
        if (user) {
            await this.userRepository.removeRelatedGuns(email);
            const result = await this.userRepository.removeUserByEmail(email);
            if (result) {
                return [result, 1];
            }
        }
        return null;
    }

    async getUserInfo(email: string): Promise<UserModel | null> {
        return this.userRepository.find(email);
    }

    async getGunsByUser(email: string): Promise<GunModel[] | null> {
        const user = await this.userRepository.find(email);
        if (!user) {
            return null;
        }
        return this.userRepository.findGunsByUser(user.id);
    }

    async getAllUsersShortInfo(): Promise<{email: string, name: string}[] | null> {
        return this.userRepository.findAllShortForm();
    }

    async getAllUsersFullInfo(): Promise<UserModel[] | null> {
        return this.userRepository.findAllFullForm();
    }
}