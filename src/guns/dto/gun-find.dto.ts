import { IsEmail, IsInt, IsNumber, IsString, Max, Min, } from "class-validator";

export class GunFindDto {

    @IsString({ message: 'There is no name in input' })
    name: string;

    @IsString({ message: 'There is no type in input' })
    type: string;
    
    @IsInt({ message: 'The size of magazine should be Int and exist' })
    @Min(3) //шт
    @Max(100)
    magazine_size: number;

    @IsNumber()
    @Min(1) //кг
    @Max(20)
    weight: number;

    @IsNumber()
    @Min(2.7) //мм
    @Max(20)
    caliber: number;

    @IsInt({ message: 'The gun must have an owner' })
    @Min(1)
    user_id: number; 
}