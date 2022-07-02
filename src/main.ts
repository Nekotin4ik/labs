import { App } from './app';
import { MiddlewareService } from './common/middleware.service';
import { PrismaService } from './database/prisma.service';
import { ExeptionFilter } from './errors/exeption.filter';
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
    const userService = new UserService(userRepository);
    // const middleware: UserLoginDto;
    const app = new App(
        logger,
        new UserController(logger, userService),
        new ExeptionFilter(logger),
        new MiddlewareService(UserLoginDto, logger),
        new PrismaService(logger),
    );
    await app.init();
}

bootstrap();