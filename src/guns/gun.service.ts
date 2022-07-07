import { GunModel, UserModel } from "@prisma/client";
import { HTTPError } from "../errors/http-error.class";
import { UserRepository } from "../users/user.repository";
import { GunFindDto } from "./dto/gun-find.dto";
import { GunUpdateDto } from "./dto/gun-update.dto";
import { Gun } from "./gun.entity";
import { GunRepository } from "./gun.repository";
import { IGunService } from "./gun.service.interface";


export class GunService implements IGunService {
    gunRepository: GunRepository;
    //userRepository: UserRepository; //лучше обратиться к существующему методу или в пушках своё обращение к пользователю?

    constructor(gunRepository: GunRepository) {
        this.gunRepository = gunRepository;
    }

    async createGun({ name, type, magazine_size, weight, caliber, user_id}: GunFindDto): Promise<GunModel | HTTPError | null> {
        const newGun = new Gun(name, type, magazine_size, weight, caliber, user_id);
        const existedGun = await this.gunRepository.find(name);
        if (existedGun) {
            return new HTTPError('Data', 422, 'Such gun already exist!', undefined, {name: name});
        }
        return this.gunRepository.create(newGun);
    }

    async getInfoGun(name: string): Promise<GunModel | null> {
        return this.gunRepository.find(name);
    }

    async updateGun({ name, type, magazine_size, weight, caliber }: GunUpdateDto): Promise<GunModel | HTTPError | null> {
        const gun = await this.gunRepository.find(name);
        if (!gun) {
            return new HTTPError(
                'Data',
                422,
                'There is no such gun!',
                'Couldn`t find a gun with this "name"',
                {name: name}
            );
        }
        return this.gunRepository.updateGun(gun.id, type, magazine_size, weight, caliber);
    }

    async deleteGun(name: string): Promise<GunModel | null> {
        return this.gunRepository.removeGun(name);

    }

    async getInfoUser(id: number): Promise<UserModel | null> {
        return this.gunRepository.findOwner(id);
    }

    async getInfoOwner(name: string): Promise<UserModel | null> {
        const gun = await this.gunRepository.find(name);
        if (!gun) {
            return null;
        }
        return this.gunRepository.findOwner(gun.user_id);
    }

    async getGunsShortInfo(
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ): Promise<{type: string, magazine_size: number, weight: number, caliber: number}[] | null> {
        return this.gunRepository.findGunsShortForm(
            type,
            magazine_size,
            weight,
            caliber,
        );
    }

    async getGunsFullInfo(
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ): Promise<GunModel[] | null> {
        // if (type === undefined && magazine_size === undefined && weight === undefined && caliber === undefined) {
        //     return this.gunRepository.findGuns();
        // }
        return this.gunRepository.findGunsFullForm(
            type,
            magazine_size,
            weight,
            caliber,
        );
    }

    // async getAllGuns(): Promise<GunModel[] | null> {

    // }
}