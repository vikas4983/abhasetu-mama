/**
 * @file        catalog.controller.ts
 * @description Controller handling public catalogs: pharmacy products, health insurance policies, and lab tests packages.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Put, Delete, Body, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller()
export class AbdmCatalogController {
  constructor(private readonly abdmService: AbdmService) {}

  // --- PHARMACY PRODUCTS CATALOG CRUD ---

  /**
   * @description Fetches all public pharmacy products.
   * @returns {Promise<{ status: string; products: any[] }>} List of products
   */
  @Get('pharmacy/products')
  async getProducts() {
    try {
      const products = await this.abdmService.getProducts();
      return { status: 'success', products };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to retrieve pharmacy products.' };
    }
  }

  /**
   * @description Creates a new pharmacy product catalog record.
   * @param {any} body - Product details.
   * @returns {Promise<any>} Created product record.
   */
  @UseGuards(JwtAuthGuard)
  @Post('pharmacy/products')
  async addProduct(@Body() body: any) {
    try {
      return await this.abdmService.saveProduct(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to add pharmacy product.' };
    }
  }

  /**
   * @description Updates an existing pharmacy product catalog record.
   * @param {any} body - Product details to update.
   * @returns {Promise<any>} Updated product record.
   */
  @UseGuards(JwtAuthGuard)
  @Put('pharmacy/products')
  async updateProduct(@Body() body: any) {
    try {
      return await this.abdmService.saveProduct(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to update pharmacy product.' };
    }
  }

  /**
   * @description Deletes a pharmacy product catalog record.
   * @param {string} id - Product code ID.
   * @returns {Promise<any>} Deletion status.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('pharmacy/products')
  async deleteProduct(@Query('id') id: string) {
    try {
      return await this.abdmService.deleteProduct(id);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to delete pharmacy product.' };
    }
  }

  // --- INSURANCE POLICIES CATALOG CRUD ---

  /**
   * @description Fetches all health insurance policies.
   * @returns {Promise<{ status: string; policies: any[] }>} List of insurance policies
   */
  @Get('insurance/policies')
  async getPolicies() {
    try {
      const policies = await this.abdmService.getPolicies();
      return { status: 'success', policies };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to retrieve insurance policies.' };
    }
  }

  /**
   * @description Creates a new health insurance policy record.
   * @param {any} body - Policy details.
   * @returns {Promise<any>} Created policy record.
   */
  @UseGuards(JwtAuthGuard)
  @Post('insurance/policies')
  async addPolicy(@Body() body: any) {
    try {
      return await this.abdmService.savePolicy(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to add insurance policy.' };
    }
  }

  /**
   * @description Updates an existing health insurance policy record.
   * @param {any} body - Policy details to update.
   * @returns {Promise<any>} Updated policy record.
   */
  @UseGuards(JwtAuthGuard)
  @Put('insurance/policies')
  async updatePolicy(@Body() body: any) {
    try {
      return await this.abdmService.savePolicy(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to update insurance policy.' };
    }
  }

  /**
   * @description Deletes an insurance policy record.
   * @param {string} id - Policy ID.
   * @returns {Promise<any>} Deletion status.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('insurance/policies')
  async deletePolicy(@Query('id') id: string) {
    try {
      return await this.abdmService.deletePolicy(id);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to delete insurance policy.' };
    }
  }

  // --- LAB TESTS PACKAGES CATALOG CRUD ---

  /**
   * @description Fetches all diagnostic lab tests packages.
   * @returns {Promise<{ status: string; labPackages: any[] }>} List of lab packages
   */
  @Get('lab-tests/packages')
  async getLabPackages() {
    try {
      const labPackages = await this.abdmService.getLabPackages();
      return { status: 'success', labPackages };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to retrieve lab packages.' };
    }
  }

  /**
   * @description Creates a new diagnostic lab package record.
   * @param {any} body - Package details.
   * @returns {Promise<any>} Created package record.
   */
  @UseGuards(JwtAuthGuard)
  @Post('lab-tests/packages')
  async addLabPackage(@Body() body: any) {
    try {
      return await this.abdmService.saveLabPackage(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to add lab package.' };
    }
  }

  /**
   * @description Updates an existing diagnostic lab package record.
   * @param {any} body - Package details to update.
   * @returns {Promise<any>} Updated package record.
   */
  @UseGuards(JwtAuthGuard)
  @Put('lab-tests/packages')
  async updateLabPackage(@Body() body: any) {
    try {
      return await this.abdmService.saveLabPackage(body);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to update lab package.' };
    }
  }

  /**
   * @description Deletes a diagnostic lab package record.
   * @param {string} id - Package ID.
   * @returns {Promise<any>} Deletion status.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('lab-tests/packages')
  async deleteLabPackage(@Query('id') id: string) {
    try {
      return await this.abdmService.deleteLabPackage(id);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Failed to delete lab package.' };
    }
  }
}
