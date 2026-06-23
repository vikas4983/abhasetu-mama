/**
 * @file        admin.controller.ts
 * @description Controller mapping administrative routes (login, configurations, transactions, audit logs, pincode listings, facility register, and document upload).
 * @module      abdm/admin
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Get, Post, Put, Delete, Body, Query, Param, Res, Req, HttpStatus, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService
  ) {}

  @Post('admin/login')
  async adminLogin(@Body() body: any) {
    const { email, password } = body;
    return this.authService.validateAndLogin(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/config')
  async getConfig() {
    const config = await this.adminService.getConfig();
    return { status: 'success', config };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/config')
  async saveConfig(@Body() body: any) {
    return this.adminService.saveConfig(body);
  }

  // --- AUDIT LOGS ---
  @UseGuards(JwtAuthGuard)
  @Get('admin/logs')
  async getLogs() {
    const logs = await this.adminService.getLogs();
    return { status: 'success', logs };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/logs')
  async addLog(@Body() body: any) {
    const { event, status, details } = body;
    await this.adminService.addLog(event, status, details);
    return { status: 'success' };
  }

  @Post('appointments/transaction')
  async addTransaction(@Body() body: any) {
    return this.adminService.addTransaction(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/transactions')
  async getTransactions() {
    const transactions = await this.adminService.getTransactions();
    return { status: 'success', transactions };
  }

  // --- MULTI-ROLE FACILITY REGISTRY ENDPOINTS ---
  @Post('admin/register-facility')
  async registerFacility(@Body() body: any, @Res() res: express.Response) {
    try {
      const result = await this.adminService.registerFacility(body);
      if (result.status === 'success') {
        return res.status(HttpStatus.CREATED).json(result);
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/facilities')
  async getFacilities(
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('role') role: string,
    @Query('marked') marked: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Res() res: express.Response
  ) {
    try {
      const result = await this.adminService.getFacilities({ search, status, role, marked, sortBy, sortOrder });
      return res.status(HttpStatus.OK).json({ status: 'success', facilities: result });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/status')
  async updateFacilityStatus(
    @Query('id') id: string,
    @Body('status') status: string,
    @Res() res: express.Response
  ) {
    try {
      const result = await this.adminService.updateFacilityStatus(Number(id), status);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/mark')
  async toggleFacilityMark(
    @Query('id') id: string,
    @Body('isMarked') isMarked: boolean,
    @Res() res: express.Response
  ) {
    try {
      const result = await this.adminService.toggleFacilityMark(Number(id), isMarked);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/facilities')
  async deleteFacility(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const result = await this.adminService.deleteFacility(Number(id));
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/add')
  async adminAddFacility(@Body() body: any, @Res() res: express.Response) {
    try {
      const result = await this.adminService.registerFacility({ ...body, status: 'approved' });
      if (result.status === 'success') {
        return res.status(HttpStatus.CREATED).json(result);
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Post('admin/upload-doc')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDoc(@UploadedFile() file: any, @Res() res: express.Response) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'No file uploaded.' });
      }
      const uploadDir = path.join(process.cwd(), '../public/uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return res.status(HttpStatus.OK).json({
        status: 'success',
        url: `/uploads/${filename}`
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/pincodes')
  async getPincodes(@Res() res: express.Response) {
    try {
      const result = await this.adminService.getPincodes();
      return res.status(HttpStatus.OK).json({ status: 'success', pincodes: result });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/pincodes')
  async createPincode(@Body() body: any, @Res() res: express.Response) {
    try {
      const { pincode, district, state } = body;
      const result = await this.adminService.createPincode(pincode, district, state);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/pincodes/:pincode')
  async updatePincode(
    @Param('pincode') pincode: string,
    @Body() body: any,
    @Res() res: express.Response
  ) {
    try {
      const { district, state } = body;
      const result = await this.adminService.updatePincode(pincode, district, state);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/pincodes/:pincode')
  async deletePincode(@Param('pincode') pincode: string, @Res() res: express.Response) {
    try {
      const result = await this.adminService.deletePincode(pincode);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
