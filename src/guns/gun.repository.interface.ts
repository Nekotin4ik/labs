import { GunModel, Prisma, UserModel } from "@prisma/client";
import { Gun } from "./gun.entity";


export interface IGunRepository {
    create: (gun: Gun) => Promise<GunModel>;
    find: (name: string) => Promise<GunModel | null>;
    updateGun: (id: number, type: string, magazine_size: number, weight: number, caliber: number) => Promise<GunModel | null>;
    removeGun: (name: string) => Promise<GunModel | null>;
    findGuns: (
        role: string,
        type?: string,
        magazine_size?: number,
        weight?: number,
        caliber?: number
    ) => Promise<GunModel[] | {type: string, magazine_size: number, weight: number, caliber: number}[] | null>;
    findOwner: (id: number) => Promise<UserModel | null>;
}