import { UserModel } from "@prisma/client";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";
import { IUserService } from "./user.service.interface";


export class UserService implements IUserService{
    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
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

    async deleteUser(id: number, email?: string): Promise<UserModel | null> {
        return this.userRepository.removeUserById(id, email);
    }

    async getUserInfo(email: string): Promise<UserModel | null> {
        return this.userRepository.find(email);
    }

    async getAllUsers(): Promise<UserModel[] | null> {
        const users = await this.userRepository.findAll();
        if (!users) {
            return null;
        }
        let users_output: UserModel[] = [];
        for (const user of users) {
            users_output.push({
                id: user.id,
                name: user.name,
                email: user.email,
                password: '***',
                role: user.role
            })
        }
        return users_output;
    }
}