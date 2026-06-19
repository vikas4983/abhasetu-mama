/**
 * @file        utility.controller.ts
 * @description Controller handling utility routes including postal code lookup and transaction settlements.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import * as express from 'express';

@Controller()
export class AbdmUtilityController {
  constructor(private readonly abdmService: AbdmService) {}

  /**
   * @description Settles a clinical appointment transaction and logs it.
   * @param {any} body - The transaction details payload.
   * @returns {Promise<any>} Settle result with transaction ID.
   */
  @Post('appointments/transaction')
  async addTransaction(@Body() body: any) {
    try {
      return await this.abdmService.addTransaction(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to record transaction.' };
    }
  }

  /**
   * @description Looks up geographic location details (district/state) by pin code.
   * @param {string} pincode - 6-digit postal code.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Location details.
   */
  @Get('pincode/:pincode')
  async getPincode(@Param('pincode') pincode: string, @Res() res: express.Response) {
    try {
      const result = await this.abdmService.getPincodeDetails(pincode);
      if (result.status === 'error') {
        return res.status(HttpStatus.NOT_FOUND).json(result);
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
