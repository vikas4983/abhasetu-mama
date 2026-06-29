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
import { PincodeDirectoryService } from './pincode-directory.service';
import { StakeholderOpsService } from './stakeholder-ops.service';
import { StakeholderProfileService } from './stakeholder-profile.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { StakeholderJwtGuard } from '../../auth/stakeholder-jwt.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtUserPayload } from '../../auth/auth-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { sanitizeAdminConfigForClient } from './utils/admin-config.util';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly pincodeDirectory: PincodeDirectoryService,
    private readonly stakeholderOps: StakeholderOpsService,
    private readonly stakeholderProfile: StakeholderProfileService,
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
    return { status: 'success', config: sanitizeAdminConfigForClient(config) };
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

  /** @description Admin dashboard KPIs and chart data */
  @UseGuards(JwtAuthGuard)
  @Get('admin/dashboard')
  async getDashboard() {
    const [pinStats, logs, transactions, facilities] = await Promise.all([
      this.pincodeDirectory.getStats(),
      this.adminService.getLogs(),
      this.adminService.getTransactions(),
      this.adminService.getFacilities({}),
    ]);

    const successLogs = logs.filter((l: { status: string }) => l.status === 'SUCCESS').length;
    const pendingFacilities = facilities.filter((f: { status: string }) => f.status === 'pending').length;
    const revenue = transactions.reduce((sum: number, t: { total_fee?: number }) => sum + Number(t.total_fee || 0), 0);

    const facilitiesByRole = facilities.reduce(
      (acc: Record<string, number>, f: { role?: string }) => {
        const r = f.role || 'unknown';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      },
      {},
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const auditTrend = days.map((day, i) => ({
      day,
      count: Math.max(1, Math.floor(logs.length / 7) + (i % 3) * 2),
    }));

    return {
      status: 'success',
      kpis: {
        totalOffices: pinStats.totalOffices,
        auditEvents: logs.length,
        successRate: logs.length ? Math.round((successLogs / logs.length) * 100) : 0,
        transactions: transactions.length,
        revenue,
        pendingFacilities,
        approvedFacilities: facilities.filter((f: { status: string }) => f.status === 'approved').length,
      },
      charts: {
        topStates: pinStats.topStates,
        recentLogStatuses: logs.slice(0, 20).map((l: { status: string; event: string }) => ({ status: l.status, event: l.event })),
        facilitiesByRole: Object.entries(facilitiesByRole).map(([role, count]) => ({ role, count })),
        auditTrend,
      },
    };
  }

  /** @description Paginated pincode directory (full CSV dataset) */
  @UseGuards(JwtAuthGuard)
  @Get('admin/pincode-directory')
  async listPincodeDirectory(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('state') state: string,
    @Query('district') district: string,
    @Query('pincode') pincode: string,
  ) {
    const result = await this.pincodeDirectory.list({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '25', 10),
      search,
      state,
      district,
      pincode,
    });
    return { status: 'success', ...result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/pincode-directory')
  async createPincodeDirectoryRow(@Body() body: Record<string, string>, @Res() res: express.Response) {
    const result = await this.pincodeDirectory.create({
      circle_name: body.circle_name || null,
      region_name: body.region_name || null,
      division_name: body.division_name || null,
      office_name: body.office_name,
      pincode: body.pincode,
      office_type: body.office_type || null,
      delivery: body.delivery || null,
      district: body.district || null,
      state_name: body.state_name,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
    } as any);
    const status = result.status === 'success' ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    return res.status(status).json(result);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/pincode-directory/:id')
  async updatePincodeDirectoryRow(@Param('id') id: string, @Body() body: Record<string, string>) {
    return this.pincodeDirectory.update(parseInt(id, 10), body as any);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/pincode-directory/:id')
  async deletePincodeDirectoryRow(@Param('id') id: string) {
    return this.pincodeDirectory.delete(parseInt(id, 10));
  }

  /** @description Bulk import from pincode_directory.csv (project root or PINCODE_CSV_PATH) */
  @UseGuards(JwtAuthGuard)
  @Post('admin/pincode-directory/import')
  async importPincodeCsv(@Body() body: { filePath?: string }) {
    return this.pincodeDirectory.importFromCsv(body?.filePath);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/pincode-directory/stats')
  async pincodeDirectoryStats() {
    const stats = await this.pincodeDirectory.getStats();
    return { status: 'success', stats };
  }

  /** @description Remove duplicate pincode + office rows (keeps oldest id) */
  @UseGuards(JwtAuthGuard)
  @Post('admin/pincode-directory/remove-duplicates')
  async removePincodeDuplicates() {
    return this.pincodeDirectory.removeDuplicates();
  }

  /** @description Stakeholder profile — read */
  @UseGuards(StakeholderJwtGuard)
  @Get('stakeholder/profile')
  async getStakeholderProfile(@CurrentUser() user: JwtUserPayload) {
    return this.stakeholderProfile.getProfile(user.id);
  }

  /** @description Stakeholder profile — update details */
  @UseGuards(StakeholderJwtGuard)
  @Put('stakeholder/profile')
  async saveStakeholderProfile(@CurrentUser() user: JwtUserPayload, @Body() body: Record<string, unknown>) {
    return this.stakeholderProfile.saveProfile(user.id, body as any);
  }

  /** @description Stakeholder profile photo upload */
  @UseGuards(StakeholderJwtGuard)
  @Post('stakeholder/profile/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStakeholderPhoto(
    @CurrentUser() user: JwtUserPayload,
    @UploadedFile() file: any,
    @Res() res: express.Response,
  ) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'No file uploaded.' });
      }
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Only JPEG, PNG, or WebP images allowed.' });
      }
      const uploadDir = path.join(process.cwd(), '../public/uploads/profiles');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(file.originalname) || '.jpg';
      const filename = `profile-${user.id}-${Date.now()}${ext.replace(/[^a-zA-Z0-9.]/g, '')}`;
      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      const url = `/uploads/profiles/${filename}`;
      const result = await this.stakeholderProfile.updatePhoto(user.id, url);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message });
    }
  }

  /** @description Facility stakeholder operations — current user */
  @UseGuards(StakeholderJwtGuard)
  @Get('stakeholder-ops')
  async getStakeholderOps(@CurrentUser() user: JwtUserPayload) {
    return this.stakeholderOps.getOpsForUser(user.id, user.role);
  }

  @UseGuards(StakeholderJwtGuard)
  @Put('stakeholder-ops')
  async saveStakeholderOps(@CurrentUser() user: JwtUserPayload, @Body() body: Record<string, unknown>) {
    return this.stakeholderOps.saveOps(user.id, user.role, body);
  }

  /** @description Master admin — per-facility insights with charts data */
  @UseGuards(JwtAuthGuard)
  @Get('admin/facilities/:id/insights')
  async facilityInsights(@Param('id') id: string) {
    return this.stakeholderOps.getFacilityInsights(parseInt(id, 10));
  }

  /** @description Urgent block — sets status to blocked */
  @UseGuards(JwtAuthGuard)
  @Post('admin/facilities/block')
  async blockFacility(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const result = await this.adminService.updateFacilityStatus(Number(id), 'blocked');
      await this.adminService.addLog('facility.blocked', 'WARN', `Facility id=${id} blocked by admin`);
      return res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Block failed';
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message });
    }
  }
}
