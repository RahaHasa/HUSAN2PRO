import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = this.usersRepository.create(registerDto);
    await this.usersRepository.save(user);

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async validateUser(userId: number) {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { contact, method } = forgotPasswordDto;
    
    // Find user by email or phone
    let user: User | null = null;
    if (method === 'email') {
      user = await this.usersRepository.findOne({ where: { email: contact } });
    } else {
      user = await this.usersRepository.findOne({ where: { phone: contact } });
    }

    if (!user) {
      throw new NotFoundException('Бұл email немесе телефон нөмірі базада табылмады');
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 Код для ${contact}: ${resetCode}`);
    
    // Save code and expiration (15 minutes)
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersRepository.save(user);
    console.log(`💾 Код сохранен в базе: ${resetCode}`);

    // Send email/SMS with code
    if (method === 'email') {
      const emailResult = await this.emailService.sendResetPasswordCode(user.email, resetCode);
      if (emailResult.demo) {
        // Demo mode - return code in response
        return {
          message: 'Растау коды жіберілді (demo режим)',
          code: resetCode, // Only for testing!
          contact: user.email,
        };
      }
    } else {
      // SMS sending
      await this.emailService.sendSMS(user.phone, resetCode);
    }

    return {
      message: 'Растау коды жіберілді',
      contact: method === 'email' ? user.email : user.phone,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { contact, code, newPassword } = resetPasswordDto;
    console.log(`🔍 Проверка кода для ${contact}: ${code}`);

    // Find user with valid reset token
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('(user.email = :contact OR user.phone = :contact)', { contact })
      .andWhere('user.resetPasswordToken = :code', { code })
      .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
      .getOne();
    
    console.log(`👤 Найден пользователь: ${user ? 'ДА' : 'НЕТ'}`);

    if (!user) {
      throw new BadRequestException('Растау коды қате немесе мерзімі өтіп кеткен');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await this.usersRepository.save(user);

    return {
      message: 'Құпия сөз сәтті өзгертілді',
    };
  }
}
