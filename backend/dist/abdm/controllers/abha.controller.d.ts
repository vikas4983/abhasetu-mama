import { GatewayClientService } from '../services/gateway-client.service';
import { RsaService } from '../services/rsa.service';
import { GenerateOtpDto, VerifyOtpDto, CreateAbhaProfileDto } from '../dtos/milestone1.dto';
export declare class AbhaController {
    private readonly gatewayService;
    private readonly rsaService;
    constructor(gatewayService: GatewayClientService, rsaService: RsaService);
    getAuthCert(): Promise<{
        cert: string;
        cipherType: string;
    }>;
    generateOtp(dto: GenerateOtpDto): Promise<{
        transactionId: `${string}-${string}-${string}-${string}-${string}`;
        status: string;
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        status: string;
        abhaNumber: string;
        abhaAddress: string;
        profile: {
            fullName: string;
            gender: string;
            dateOfBirth: string;
            mobile: string;
            photo: string;
        };
    }>;
    createProfile(dto: CreateAbhaProfileDto): Promise<{
        status: string;
        abhaNumber: string;
        abhaAddress: string;
        message: string;
    }>;
    getProfile(abhaAddress: string): Promise<{
        abhaNumber: string;
        abhaAddress: string;
        fullName: string;
        gender: string;
        dateOfBirth: string;
        mobile: string;
        status: string;
    }>;
}
