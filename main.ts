import { App } from './app';
import { ExeptionFilter } from './errors/exeption.filter';
import { LoggerService } from './logger/logger.service';


async function bootstrap() {
    const app = new App(new LoggerService(), new ExeptionFilter());
    app.init();
}

bootstrap();