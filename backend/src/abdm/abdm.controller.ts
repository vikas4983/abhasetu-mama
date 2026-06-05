import { Controller, Get, Post, Put, Delete, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { AbdmService } from './abdm.service';
import * as express from 'express';

@Controller()
export class AbdmController {
  constructor(private readonly abdmService: AbdmService) {}

  // 1. gateway handshakes
  @Get('sessions')
  async getSessions() {
    return this.abdmService.getGatewaySession();
  }

  // 2. M1 Aadhaar onboarding otp request and verify loops
  @Post('enroll')
  async enroll(@Body() body: any, @Res() res: express.Response) {
    const { action, aadhaar, otp, txnId } = body;

    if (action === 'request-otp') {
      const result = await this.abdmService.requestAadhaarOtp(aadhaar);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    }

    if (action === 'verify-otp') {
      const result = await this.abdmService.verifyAadhaarOtp(otp, txnId);
      if (result.status === 'error') {
        return res.status(HttpStatus.BAD_REQUEST).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    }

    return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid onboarding action.' });
  }

  // 3. Admin configuration
  @Get('admin/config')
  getConfig() {
    return this.abdmService.getConfig();
  }

  @Post('admin/config')
  saveConfig(@Body() body: any) {
    return this.abdmService.saveConfig(body);
  }

  // 4. Audit logs
  @Get('admin/logs')
  getLogs() {
    return this.abdmService.getLogs();
  }

  @Post('admin/logs')
  addLog(@Body() body: any) {
    const { event, status, details } = body;
    this.abdmService.addLog(event, status, details);
    return { status: 'success' };
  }

  // 5. Pharmacy catalog CRUD
  @Get('pharmacy/products')
  getProducts() {
    return this.abdmService.getProducts();
  }

  @Post('pharmacy/products')
  addProduct(@Body() body: any) {
    return this.abdmService.saveProduct(body);
  }

  @Put('pharmacy/products')
  updateProduct(@Body() body: any) {
    return this.abdmService.saveProduct(body);
  }

  @Delete('pharmacy/products')
  deleteProduct(@Query('id') id: string) {
    return this.abdmService.deleteProduct(id);
  }

  // 6. Insurance policies catalog
  @Get('insurance/policies')
  getPolicies() {
    return this.abdmService.getPolicies();
  }

  // 7. Lab packages catalog
  @Get('lab-tests/packages')
  getLabPackages() {
    return this.abdmService.getLabPackages();
  }
}
