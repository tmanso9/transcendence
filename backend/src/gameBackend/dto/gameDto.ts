import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class GameDTO {
	@IsString()
	@IsNotEmpty()
	winnerId: string

	@IsString()
	@IsNotEmpty()
	loserId: string

	@IsNotEmpty()
	loserScore: any
}