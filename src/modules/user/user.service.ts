import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserRole } from 'types/enums/user';
import { CreateStoreUserDto } from './dto/create-store-user.dto';
import { MailService } from './mail.service';
import { StoreRepository } from '../store/store.repository';
import { FetchUsersDto } from './dto/fetch-users.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly storeRepository: StoreRepository,
  ) {}

  async fetchAllUsers(dto: FetchUsersDto) {
    return this.userRepository.findAll(
      dto.page,
      dto.limit,
      dto.name,
      dto.email,
      dto.roles,
    );
  }

  async getStoreManagers() {
    return this.userRepository.findByRole(UserRole.STORE_MANAGER);
  }
  async updateUserStatus(userId: string, status: boolean, storeId: string) {
    const user = await this.userRepository.findById(userId);
    const isVerified = await this.userRepository.verifyUser(userId, storeId);

    if (!isVerified) {
      throw new BadRequestException("L'utilisateur n'est pas lié à ce magasin");
    }

    await this.userRepository.updateStatus(userId, status);

    const store = await this.storeRepository.findById(storeId);

    if (status) {
      await this.mailService.sendActivationEmail(user.email, store?.name);
    } else {
      await this.mailService.sendDeactivationEmail(user.email, store?.name);
    }
  }

  async createStoreUser(dto: CreateStoreUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Cet email existe déjà');
    }
    await this.userRepository.signUpUser({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      role: dto.role,
    });
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException(
        "Erreur lors de la création de l'utilisateur",
      );
    }

    await this.userRepository.linkUserToStore(user.id, dto.storeId);

    const store = await this.storeRepository.findById(dto.storeId);

    if (store)
      await this.mailService.sendStoreAssignmentEmail(
        dto.email,
        store.name,
        dto.password,
      );

    return { success: true, userId: user.id };
  }
}
