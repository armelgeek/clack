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

  private formatAddress(addr: any) {
    return {
      ...addr,
      latitude: addr.latitude ? parseFloat(addr.latitude) : undefined,
      longitude: addr.longitude ? parseFloat(addr.longitude) : undefined,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    };
  }

  async getAddresses(userId: string) {
    const addresses = await this.addressesRepository.findByUserId(userId);
    
    // Convert latitude/longitude from string to number
    const formattedAddresses = addresses.map(addr => this.formatAddress(addr));
    
    return { addresses: formattedAddresses };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const address = await this.addressesRepository.create(userId, dto);
    return this.formatAddress(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressesRepository.findByIdAndUserId(addressId, userId);
    
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updatedAddress = await this.addressesRepository.update(addressId, dto);
    return this.formatAddress(updatedAddress);
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
    return this.formatAddress(updatedAddress);
  }
}
