import { GunModel, UserModel } from "@prisma/client";
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

    async createGun({ name, type, magazine_size, weight, caliber, user_id}: GunFindDto): Promise<GunModel | null> {
        const newGun = new Gun(name, type, magazine_size, weight, caliber, user_id);
        const existedGun = await this.gunRepository.find(name);
        if (existedGun) {
            return null;
        }
        return this.gunRepository.create(newGun);
    }

    async getInfoGun(name: string): Promise<GunModel | null> {
        return this.gunRepository.find(name);
    }

    async updateGun({ name, type, magazine_size, weight, caliber }: GunUpdateDto): Promise<GunModel | null> {
        const gun = await this.gunRepository.find(name);
        if (!gun) {
            return null;
        }
        return this.gunRepository.updateGun( gun.id, type, magazine_size, weight, caliber);
    }

    async deleteGun(name: string): Promise<GunModel | null> {
        // const existedGun = await this.gunRepository.removeGun(name);
        // if (existedGun) {
        //     return existedGun;
        // }
        // return null;
        return this.gunRepository.removeGun(name);

    }

    async getInfoUser(id: number): Promise<UserModel | null> {
        return this.gunRepository.findOwner(id);
    }

    async getInfoOwner(name: string): Promise<UserModel | null> {
        const owner = await this.gunRepository.find(name);
        console.log(owner);
        if (!owner) {
            return null;
        }
        return this.gunRepository.findOwner(owner.user_id);
    }

    async getGuns(
        role: string,
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ): Promise<GunModel[] | {type: string, magazine_size: number, weight: number, caliber: number}[] | null> {
        if (type === undefined && magazine_size === undefined && weight === undefined && caliber === undefined) {
            return this.gunRepository.findGuns(role);
        }
        return this.gunRepository.findGuns(
            role,
            type,
            magazine_size,
            weight,
            caliber,
        );
    }

    // async getAllGuns(): Promise<GunModel[] | null> {

    // }
}