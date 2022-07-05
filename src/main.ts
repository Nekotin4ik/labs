import { App } from './app';
import { MiddlewareService } from './common/middleware.service';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { ExeptionFilter } from './errors/exeption.filter';
import { GunController } from './guns/gun.controller';
import { GunRepository } from './guns/gun.repository';
import { GunService } from './guns/gun.service';
import { LoggerService } from './logger/logger.service';
import { UserLoginDto } from './users/dto/user-login.dto';
import { UserRegisterDto } from './users/dto/user-register.dto';
import { UserRepository } from './users/user.repository';
import { UserService } from './users/user.service';
import { UserController } from './users/users.controller';


async function bootstrap() {
    const logger = new LoggerService();
    const prismaService = new PrismaService(logger);
    const userRepository = new UserRepository(prismaService);
    const configService = new ConfigService(logger);
    const gunRepository = new GunRepository(prismaService);
    const userService = new UserService(userRepository, gunRepository);
    const gunService = new GunService(gunRepository);
    const app = new App(
        logger,
        new UserController(logger, userService, configService),
        new ExeptionFilter(logger),
        new MiddlewareService(UserLoginDto, logger),
        new PrismaService(logger),
        configService,
        new GunController(logger, gunService)
    );
    await app.init();
}

bootstrap();