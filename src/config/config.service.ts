import { config, DotenvConfigOutput, DotenvParseOutput } from "dotenv";
import { LoggerService } from "../logger/logger.service";
import { IConfigService } from "./config.service.interface";


export class ConfigService implements IConfigService {
    private config: DotenvParseOutput;
    logger: LoggerService;

    constructor(logger: LoggerService) {
        this.logger = logger;
        const result: DotenvConfigOutput = config();
        if (result.error) {
            this.logger.error('[ConfigService] Didn`t manage to read file .env or there is no such file');
        } else {
            this.logger.log('[ConfigService] Configuration .env loaded');
            this.config = result.parsed as DotenvParseOutput;
        }
    }

    get(key: string): string {
        return this.config[key];
    }
}