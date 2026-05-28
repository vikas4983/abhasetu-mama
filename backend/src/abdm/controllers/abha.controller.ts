import { Controller, Post, Body, Get, Param, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { GatewayClientService } from '../services/gateway-client.service';
import { RsaService } from '../services/rsa.service';
import { GenerateOtpDto, VerifyOtpDto, CreateAbhaProfileDto } from '../dtos/milestone1.dto';

@Controller('abha')
export class AbhaController {
  constructor(
    private readonly gatewayService: GatewayClientService,
    private readonly rsaService: RsaService,
  ) {}

  /**
   * Public Cert Pull Endpoint: /v3/auth/cert
   * Returns NHA public certificate for client-side RSA encryption of credentials
   */
  @Get('v3/auth/cert')
  async getAuthCert() {
    console.log('[ABDM API V3] Pulling active RSA public key certificate');
    return {
      cert: this.rsaService.getPublicKeyCertificate(),
      cipherType: 'RSA/ECB/PKCS1Padding',
    };
  }

  @Post('otp/generate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async generateOtp(@Body() dto: GenerateOtpDto) {
    // Encrypt Aadhaar using RSA version 3 standard for NHA dispatch
    const encryptedAadhaar = this.rsaService.encrypt(dto.aadhaar);
    const maskedAadhaar = `XXXX-XXXX-${dto.aadhaar.slice(8)}`;
    
    console.log(`[ABDM API V3] Encrypted Aadhaar Number securely: ${encryptedAadhaar.slice(0, 30)}...`);
    console.log(`[ABDM API V3] Triggering Aadhaar OTP send sequence for: ${maskedAadhaar}`);
    
    // Simulate transaction UUID generation matching Milestone 1 specs
    const transactionId = crypto.randomUUID();

    return {
      transactionId,
      status: 'SUCCESS',
      message: 'Secure OTP successfully pushed to registered mobile number via NHA gateway',
    };
  }

  @Post('otp/verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    // Encrypt OTP using RSA version 3 standard
    const encryptedOtp = this.rsaService.encrypt(dto.otp);
    console.log(`[ABDM API V3] Encrypted OTP securely: ${encryptedOtp.slice(0, 30)}...`);
    console.log(`[ABDM API V3] Verifying OTP for Transaction ID: ${dto.transactionId}`);

    // Standard Milestone 1 verification mock payload
    return {
      status: 'VERIFIED',
      abhaNumber: '91-9981-0577-6582',
      abhaAddress: 'ayesha.ali.9981057765@abdm',
      profile: {
        fullName: 'Dr. Ayesha Ali',
        gender: 'Female',
        dateOfBirth: '1980-08-15',
        mobile: '9981057765',
        photo: '/assets/doctors/dr-ayesha-ali.jpeg',
      },
    };
  }

  @Post('profile/create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createProfile(@Body() dto: CreateAbhaProfileDto) {
    // Encrypt password using RSA standard
    const encryptedPassword = this.rsaService.encrypt(dto.password);
    console.log(`[ABDM API V3] Encrypted ABHA Profile password: ${encryptedPassword.slice(0, 30)}...`);
    console.log(`[ABDM API V3] Registering new ABHA Account Profile: ${dto.abhaAddress}`);

    return {
      status: 'CREATED',
      abhaNumber: dto.abhaNumber,
      abhaAddress: dto.abhaAddress,
      message: 'ABHA Profile successfully created and registered on national health registry.',
    };
  }

  @Get('profile/:abhaAddress')
  async getProfile(@Param('abhaAddress') abhaAddress: string) {
    console.log(`Retrieving active ABDM profile registry: ${abhaAddress}`);
    return {
      abhaNumber: '91-9981-0577-6582',
      abhaAddress: abhaAddress,
      fullName: 'Dr. Ayesha Ali',
      gender: 'Female',
      dateOfBirth: '1980-08-15',
      mobile: '9981057765',
      status: 'ACTIVE',
    };
  }
}

