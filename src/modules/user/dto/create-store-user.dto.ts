import { IsEmail, IsNotEmpty, IsString, IsEnum } from "class-validator";
import { UserRole } from "types/enums/user";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStoreUserDto {
  @ApiProperty({ example: "John Doe", description: "Nom complet de l'utilisateur" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "john.doe@example.com", description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "+33712345678", description: "Numéro de téléphone" })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: "StrongPassword123!", description: "Mot de passe" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: UserRole.STORE_MANAGER, enum: UserRole, description: "Rôle de l'utilisateur" })
  @IsEnum(UserRole, { message: "Rôle invalide" })
  role: UserRole;

  @ApiProperty({ example: "store_123456", description: "ID du magasin auquel l'utilisateur sera assigné" })
  @IsString()
  @IsNotEmpty()
  storeId: string;
}
