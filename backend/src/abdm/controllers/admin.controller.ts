/**
 * @file        admin.controller.ts
 * @description Controller handling admin logins, global system config management, logs fetch, facility registry approvals, and pincode settings.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Put, Delete, Body, Query, Param, Res, Req, HttpStatus, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AbdmAdminController {
  constructor(
    private readonly abdmService: AbdmService,
    private readonly authService: AuthService
  ) {}

  /**
   * @description Authenticates administrative portal users.
   * @param {any} body - User credentials (email, password).
   * @returns {Promise<any>} Auth tokens and role payload.
   */
  @Post('admin/login')
  async adminLogin(@Body() body: any) {
    try {
      const { email, password } = body;
      return await this.authService.validateAndLogin(email, password);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * @description Get active global bridge properties.
   * @returns {Promise<any>} Bridge configurations object.
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/config')
  async getConfig() {
    try {
      const config = await this.abdmService.getConfig();
      return { status: 'success', config };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to fetch config.' };
    }
  }

  /**
   * @description Save/update global system bridge configurations.
   * @param {any} body - Key-value pair configuration settings object.
   * @returns {Promise<any>} Update status results.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/config')
  async saveConfig(@Body() body: any) {
    try {
      return await this.abdmService.saveConfig(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to save config.' };
    }
  }

  /**
   * @description Get recent compliance/detailed audit logs.
   * @returns {Promise<any>} Audit log list object.
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/logs')
  async getLogs() {
    try {
      const logs = await this.abdmService.getLogs();
      return { status: 'success', logs };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to fetch logs.' };
    }
  }

  /**
   * @description Submits a manual clinical system audit log.
   * @param {any} body - Log status details.
   * @returns {Promise<any>} Success status output.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/logs')
  async addLog(@Body() body: any) {
    try {
      const { event, status, details } = body;
      await this.abdmService.addLog(event, status, details);
      return { status: 'success' };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to add log.' };
    }
  }

  /**
   * @description Get clinical billing transactions history.
   * @returns {Promise<any>} Transactions lists.
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/transactions')
  async getTransactions() {
    try {
      const transactions = await this.abdmService.getTransactions();
      return { status: 'success', transactions };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to fetch transactions.' };
    }
  }

  /**
   * @description Submits a public request for registering a facility.
   * @param {any} body - Facility details.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Creation result and login password.
   */
  @Post('admin/register-facility')
  async registerFacility(@Body() body: any, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.registerFacility(body);
      if (result.status === 'success') {
        return res.status(HttpStatus.CREATED).json(result);
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Searches and lists registered facilities.
   * @param {string} search - Search name query string.
   * @param {string} status - Facility approval status filter.
   * @param {string} role - Facility role type.
   * @param {string} marked - Star-marked filter boolean string.
   * @param {string} sortBy - Sort key field.
   * @param {string} sortOrder - Sort direction ordering.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Facilities list.
   */
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
      const result = await this.abdmService.getFacilities({ search, status, role, marked, sortBy, sortOrder });
      return res.status(HttpStatus.OK).json({ status: 'success', facilities: result });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Approves/Rejects facility registrations.
   * @param {string} id - Database facility user ID.
   * @param {string} status - Status code.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Updated status details.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/status')
  async updateFacilityStatus(
    @Query('id') id: string,
    @Body('status') status: string,
    @Res() res: express.Response
  ) {
    try {
      const result = await this.abdmService.updateFacilityStatus(Number(id), status);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Toggles star-marked priority status of a facility.
   * @param {string} id - Database facility user ID.
   * @param {boolean} isMarked - marked value boolean.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Mark update state.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/mark')
  async toggleFacilityMark(
    @Query('id') id: string,
    @Body('isMarked') isMarked: boolean,
    @Res() res: express.Response
  ) {
    try {
      const result = await this.abdmService.toggleFacilityMark(Number(id), isMarked);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Deletes a facility from the bridge.
   * @param {string} id - Facility user database ID.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Deletion status result.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('admin/facilities')
  async deleteFacility(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.deleteFacility(Number(id));
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Direct admin action to register an already approved facility.
   * @param {any} body - Facility profile fields.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Registration status.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/add')
  async adminAddFacility(@Body() body: any, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.registerFacility({ ...body, status: 'approved' });
      if (result.status === 'success') {
        return res.status(HttpStatus.CREATED).json(result);
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Uploads a document attachment.
   * @param {any} file - The file binary attachment.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Uploaded document link path.
   */
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

  /**
   * @description Gets pincode database records.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Pincodes list.
   */
  @UseGuards(JwtAuthGuard)
  @Get('admin/pincodes')
  async getPincodes(@Res() res: express.Response) {
    try {
      const result = await this.abdmService.getPincodes();
      return res.status(HttpStatus.OK).json({ status: 'success', pincodes: result });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Registers a new pincode location mapping.
   * @param {any} body - Location data (pincode, district, state).
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Pincode registration state status.
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin/pincodes')
  async createPincode(@Body() body: any, @Res() res: express.Response) {
    try {
      const { pincode, district, state } = body;
      const result = await this.abdmService.createPincode(pincode, district, state);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Updates an existing pincode location mapping.
   * @param {string} pincode - Postal code parameter string.
   * @param {any} body - Location parameters to update.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Update status result.
   */
  @UseGuards(JwtAuthGuard)
  @Put('admin/pincodes/:pincode')
  async updatePincode(
    @Param('pincode') pincode: string,
    @Body() body: any,
    @Res() res: express.Response
  ) {
    try {
      const { district, state } = body;
      const result = await this.abdmService.updatePincode(pincode, district, state);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Deletes a pincode mapping record.
   * @param {string} pincode - Postal code parameter.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Deletion status result.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('admin/pincodes/:pincode')
  async deletePincode(@Param('pincode') pincode: string, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.deletePincode(pincode);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
