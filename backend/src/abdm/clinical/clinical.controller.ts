/**
 * @file        clinical.controller.ts
 * @description Controller handling clinical catalogs (pharmacy products, insurance policies, lab packages, and doctors Specialties).
 * @module      abdm/clinical
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Controller, Get, Post, Put, Delete, Body, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import * as express from 'express';

@Controller()
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  // --- PHARMACY PRODUCTS CATALOG CRUD ---
  @Get('pharmacy/products')
  async getProducts() {
    const products = await this.clinicalService.getProducts();
    return { status: 'success', products };
  }

  @UseGuards(JwtAuthGuard)
  @Post('pharmacy/products')
  async addProduct(@Body() body: any) {
    return this.clinicalService.saveProduct(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('pharmacy/products')
  async updateProduct(@Body() body: any) {
    return this.clinicalService.saveProduct(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('pharmacy/products')
  async deleteProduct(@Query('id') id: string) {
    return this.clinicalService.deleteProduct(id);
  }

  // --- INSURANCE POLICIES CATALOG CRUD ---
  @Get('insurance/policies')
  async getPolicies() {
    const policies = await this.clinicalService.getPolicies();
    return { status: 'success', policies };
  }

  @UseGuards(JwtAuthGuard)
  @Post('insurance/policies')
  async addPolicy(@Body() body: any) {
    return this.clinicalService.savePolicy(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('insurance/policies')
  async updatePolicy(@Body() body: any) {
    return this.clinicalService.savePolicy(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('insurance/policies')
  async deletePolicy(@Query('id') id: string) {
    return this.clinicalService.deletePolicy(id);
  }

  // --- LAB TESTS PACKAGES CATALOG CRUD ---
  @Get('lab-tests/packages')
  async getLabPackages() {
    const labPackages = await this.clinicalService.getLabPackages();
    return { status: 'success', labPackages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('lab-tests/packages')
  async addLabPackage(@Body() body: any) {
    return this.clinicalService.saveLabPackage(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('lab-tests/packages')
  async updateLabPackage(@Body() body: any) {
    return this.clinicalService.saveLabPackage(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('lab-tests/packages')
  async deleteLabPackage(@Query('id') id: string) {
    return this.clinicalService.deleteLabPackage(id);
  }

  // --- DOCTOR CONSULTATION FLOW DATA DIRECTORY ENDPOINTS ---
  @Get('doctor-consultation/specialties')
  async getSpecialtiesMatrix(@Res() res: express.Response) {
    try {
      const data = await this.clinicalService.getSpecialtiesMatrix();
      return res.status(HttpStatus.OK).json({ status: 'success', specialties: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Get('doctor-consultation/doctors')
  async getDoctors(
    @Query('medicalSystem') medicalSystem: string,
    @Query('speciality') speciality: string,
    @Query('specialistRole') specialistRole: string,
    @Query('search') search: string,
    @Res() res: express.Response
  ) {
    try {
      const data = await this.clinicalService.getDoctors(medicalSystem, speciality, specialistRole, search);
      return res.status(HttpStatus.OK).json({ status: 'success', doctors: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Post('doctor-consultation/doctors')
  async saveDoctor(@Body() body: any, @Res() res: express.Response) {
    try {
      const data = await this.clinicalService.saveDoctor(body);
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  @Delete('doctor-consultation/doctors')
  async deleteDoctor(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const data = await this.clinicalService.deleteDoctor(Number(id));
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
