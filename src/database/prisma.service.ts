import { PrismaClient } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";


export class PrismaService {
    client: PrismaClient;
    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.client = new PrismaClient();
        this.logger = logger;
    }

    async connect(): Promise<void> {
        try {
            await this.client.$connect();
            this.logger.log('[PrismaService] Successfully connected to Database!');
        } catch (e) {
            if (e instanceof Error) {
                this.logger.log('[PrismaService] Error! Problems with connection to Database!' + e.message);
            }
        }
    }

    async disconnect(): Promise<void> {
        await this.client.$disconnect();
    }
}