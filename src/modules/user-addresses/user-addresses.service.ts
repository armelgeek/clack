import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserAddressesRepository } from './user-addresses.repository';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';

@Injectable()
export class UserAddressesService {
  private readonly logger = new Logger(UserAddressesService.name);

  constructor(private readonly addressesRepository: UserAddressesRepository) {}

  async getAddresses(userId: string) {
    const addresses = await this.addressesRepository.findByUserId(userId);
    return addresses;
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const address = await this.addressesRepository.create(userId, dto);
    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressesRepository.findByIdAndUserId(addressId, userId);
    
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = await this.addressesRepository.update(addressId, dto);
    return updatedAddress;
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressesRepository.findByIdAndUserId(addressId, userId);
    
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressesRepository.delete(addressId);
    return { message: 'Address deleted successfully' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.addressesRepository.findByIdAndUserId(addressId, userId);
    
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = await this.addressesRepository.setDefault(userId, addressId);
    return updatedAddress;
  }
}
