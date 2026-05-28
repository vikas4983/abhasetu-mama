import { AdminService } from './admin.service';
import { AdminLoginDto } from './dtos/admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(dto: AdminLoginDto): Promise<{
        statusCode: number;
        message: string;
        accessToken: string;
        role: string;
        expiresIn: number;
    }>;
}
