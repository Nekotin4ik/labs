import { GunModel, UserModel } from "@prisma/client";
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

    // async createUser(dto: UserRegisterDto): Promise<UserModel | null> {

    // };

    async validateUser({ email, password }: UserLoginDto): Promise<Boolean> {
        const existedUser = await this.userRepository.find(email);
        if (!existedUser) {
            return false;
        }
        const newUser = new User(existedUser.email, existedUser.name, existedUser.role, existedUser.password);
        return newUser.comparePassword(password);
    }

    async createUser({ email, name, password, role }: UserRegisterDto): Promise<UserModel | null> {
        if (role != 'USER' && role != 'ADMIN' && role != undefined) {
            return null;
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
        // while ()
        if (user) {
            const user_guns = await this.userRepository.findGunsByUser(user.id);
            if (user_guns) {
                for(const user_gun of user_guns) {
                    this.gunRepository.removeGun(user_gun.name);
                }
                this.userRepository.removeUserByEmail(email);
                return [user, user_guns.length]
            }
            return null;
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

    async getAllUsers(): Promise<UserModel[] | null> {
        const users = await this.userRepository.findAll();
        if (!users) {
            return null;
        }
        return users;
    }
}