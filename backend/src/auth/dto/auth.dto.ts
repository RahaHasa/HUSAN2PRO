export class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class ForgotPasswordDto {
  contact: string; // email or phone
  method: 'email' | 'phone';
}

export class ResetPasswordDto {
  contact: string;
  code: string;
  newPassword: string;
}
