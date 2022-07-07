import { GunModel, UserModel } from "@prisma/client";
import { HTTPError } from "../errors/http-error.class";
import { GunFindDto } from "./dto/gun-find.dto";
import { GunUpdateDto } from "./dto/gun-update.dto";
import { Gun } from "./gun.entity";


export interface IGunService {
    createGun: (dto: GunFindDto) => Promise<GunModel | HTTPError | null>;
    getInfoGun: (name: string) => Promise<GunModel | null>;
    updateGun: ({ name, type, magazine_size, weight, caliber }: GunUpdateDto) => Promise<GunModel | HTTPError | null>;
    deleteGun: (name: string) => Promise<GunModel | null>;
    getInfoOwner: (name: string) => Promise<UserModel | null>;
    getInfoUser: (id: number) => Promise<UserModel | null>;
    getGunsShortInfo: (
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ) => Promise<{type: string, magazine_size: number, weight: number, caliber: number}[] | null>;
    getGunsFullInfo: (
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ) => Promise<GunModel[] | null>;
}