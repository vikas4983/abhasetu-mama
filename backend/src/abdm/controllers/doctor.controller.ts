/**
 * @file        doctor.controller.ts
 * @description Controller handling doctor profiles, specialties matrix index, and telehealth consults.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Get, Post, Delete, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import * as express from 'express';

@Controller()
export class AbdmDoctorController {
  constructor(private readonly abdmService: AbdmService) {}

  /**
   * @description Retrieves the medical specialty hierarchy / system matrix.
   * @param {express.Response} res - Express response object.
   * @returns {Promise<express.Response>} Specialties matrix list.
   */
  @Get('doctor-consultation/specialties')
  async getSpecialtiesMatrix(@Res() res: express.Response) {
    try {
      const data = await this.abdmService.getSpecialtiesMatrix();
      return res.status(HttpStatus.OK).json({ status: 'success', specialties: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Searches/Filters registered doctor profiles in the directory.
   * @param {string} medicalSystem - Filter by clinical system (Allopathy, Ayurveda, etc.).
   * @param {string} speciality - Filter by specialty category.
   * @param {string} specialistRole - Filter by doctor specific designation.
   * @param {string} search - Search query name string.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} List of matching doctors.
   */
  @Get('doctor-consultation/doctors')
  async getDoctors(
    @Query('medicalSystem') medicalSystem: string,
    @Query('speciality') speciality: string,
    @Query('specialistRole') specialistRole: string,
    @Query('search') search: string,
    @Res() res: express.Response
  ) {
    try {
      const data = await this.abdmService.getDoctors(medicalSystem, speciality, specialistRole, search);
      return res.status(HttpStatus.OK).json({ status: 'success', doctors: data });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Adds or updates a doctor profile in the consultation directory.
   * @param {any} body - Doctor profile details.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Saved doctor profile response.
   */
  @Post('doctor-consultation/doctors')
  async saveDoctor(@Body() body: any, @Res() res: express.Response) {
    try {
      const data = await this.abdmService.saveDoctor(body);
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }

  /**
   * @description Deletes a doctor profile from the consultation directory.
   * @param {string} id - Database doctor ID.
   * @param {express.Response} res - Express response.
   * @returns {Promise<express.Response>} Deletion status result.
   */
  @Delete('doctor-consultation/doctors')
  async deleteDoctor(@Query('id') id: string, @Res() res: express.Response) {
    try {
      const data = await this.abdmService.deleteDoctor(Number(id));
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
    }
  }
}
