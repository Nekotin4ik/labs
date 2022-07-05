import { IsEmail, IsString } from "class-validator";

export class UserUpdateDto {
	@IsEmail({}, { message: 'Invalid email input!' })
	email: string;

	@IsString({ message: 'There is no password in input' })
	password: string;

	@IsString({ message: 'There is no name in input' })
	name: string;
	
	@IsString({ message: 'There is no role in input' })
	role: string | undefined;
}