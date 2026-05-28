export declare class AppController {
    getSystemStatus(): {
        status: string;
        system: string;
        version: string;
        abdmMilestones: {
            M1: string;
            M2: string;
            M3: string;
        };
        database: string;
        cache: string;
        timestamp: string;
        developerContact: string;
    };
}
