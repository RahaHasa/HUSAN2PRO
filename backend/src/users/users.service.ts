import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    // Телефон номерін форматтау - тек сандар және +
    if (updateData.phone) {
      updateData.phone = this.formatPhoneNumber(updateData.phone);
    }
    if (updateData.notificationWhatsApp) {
      updateData.notificationWhatsApp = this.formatPhoneNumber(updateData.notificationWhatsApp);
    }

    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.findOne(id);
    
    if (!updatedUser) {
      throw new Error('Пайдаланушы табылмады');
    }
    
    return updatedUser;
  }

  private formatPhoneNumber(phone: string): string {
    // Барлық бос орындар, жақшалар, сызықшаларды жою
    let cleaned = phone.replace(/[\s\(\)\-]/g, '');
    
    // Егер + жоқ болса және 7 немесе 8-мен басталса
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('8')) {
        cleaned = '+7' + cleaned.slice(1);
      } else if (cleaned.startsWith('7')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+7' + cleaned;
      }
    }
    
    return cleaned;
  }
}
