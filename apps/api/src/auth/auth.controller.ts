import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterSchoolDto, RequestOtpDto, VerifyOtpDto } from './dto';
import { JwtAuthGuard } from './jwt.guard';
import { CurrentUser } from '../common/tenant.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register-school')
  registerSchool(@Body() dto: RegisterSchoolDto) {
    return this.auth.registerSchool(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.loginWithPassword(dto);
  }

  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }
}
