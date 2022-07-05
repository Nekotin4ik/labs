import { User } from "../users/user.entity";


export class Gun {

    constructor(
        private readonly _name: string,
        private readonly _type: string,
        private readonly _magazine_size: number,
        private readonly _weight: number,
        private readonly _caliber: number,
        private readonly _user_id: number,
    ) {

    }

    get name(): string {
        return this._name;
    }

    get type(): string {
        return this._type;
    }

    get magazine_size(): number {
        return this._magazine_size;
    }

    get weight(): number {
        return this._weight;
    }

    get caliber(): number {
        return this._caliber;
    }

    get user_id(): number {
        return this._user_id;
    }


}