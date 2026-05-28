import { Controller, Post, Body, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dtos/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: AdminLoginDto) {
    console.log(`[Admin Portal] Session authentication request for: ${dto.email}`);
    return this.adminService.login(dto);
  }
}
