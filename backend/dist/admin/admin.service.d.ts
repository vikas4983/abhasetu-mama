import { AdminLoginDto } from './dtos/admin.dto';
export declare class AdminService {
    login(dto: AdminLoginDto): Promise<{
        statusCode: number;
        message: string;
        accessToken: string;
        role: string;
        expiresIn: number;
    }>;
}
