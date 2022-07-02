import { IsEmail, IsString } from "class-validator";

export class UserRegisterDto {
	@IsEmail({}, { message: 'Invalid email input!' })
	email: string;

	@IsString({ message: 'There is no password in input' })
	password: string;

	@IsString({ message: 'There is no name in input' })
	name: string;
}