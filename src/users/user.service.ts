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
        const newUser = new User(existedUser.email, existedUser.name, existedUser.password);
        return newUser.comparePassword(password);
    }

    async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
        const newUser = new User(email, name);
        const salt = 10;
        await newUser.setPassword(password, salt);
        const existedUser = await this.userRepository.find(email);
        if (existedUser) {
            return null;
        }
        return this.userRepository.create(newUser);
    }

    

    // async getUserInfo: (email: string) => Promise<UserModel | null>;
}