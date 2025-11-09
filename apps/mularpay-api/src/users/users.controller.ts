import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  UpdateProfileDto,
  VerifyBvnDto,
  VerifyNinDto,
  ChangePasswordDto,
  VerifyEmailDto,
  VerifyPhoneDto,
} from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  @Get('profile')
  async getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Change password
   * POST /api/users/change-password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  /**
   * Verify BVN (Bank Verification Number)
   * POST /api/users/verify-bvn
   */
  @Post('verify-bvn')
  @HttpCode(HttpStatus.OK)
  async verifyBvn(
    @GetUser('id') userId: string,
    @Body() verifyBvnDto: VerifyBvnDto,
  ) {
    return this.usersService.verifyBvn(userId, verifyBvnDto);
  }

  /**
   * Verify NIN (National Identification Number)
   * POST /api/users/verify-nin
   */
  @Post('verify-nin')
  @HttpCode(HttpStatus.OK)
  async verifyNin(
    @GetUser('id') userId: string,
    @Body() verifyNinDto: VerifyNinDto,
  ) {
    return this.usersService.verifyNin(userId, verifyNinDto);
  }

  /**
   * Send email verification code
   * POST /api/users/send-email-verification
   */
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  async sendEmailVerification(@GetUser('id') userId: string) {
    return this.usersService.sendEmailVerification(userId);
  }

  /**
   * Verify email with code
   * POST /api/users/verify-email
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @GetUser('id') userId: string,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    return this.usersService.verifyEmail(userId, verifyEmailDto.code);
  }

  /**
   * Send phone verification code
   * POST /api/users/send-phone-verification
   */
  @Post('send-phone-verification')
  @HttpCode(HttpStatus.OK)
  async sendPhoneVerification(@GetUser('id') userId: string) {
    return this.usersService.sendPhoneVerification(userId);
  }

  /**
   * Verify phone with code
   * POST /api/users/verify-phone
   */
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @GetUser('id') userId: string,
    @Body() verifyPhoneDto: VerifyPhoneDto,
  ) {
    return this.usersService.verifyPhone(userId, verifyPhoneDto.code);
  }
}
