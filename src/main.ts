import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const apiPrefix = configService.get('API_PREFIX') ?? 'api';
	app.setGlobalPrefix(apiPrefix);
	const port = process.env.PORT ?? 3000;
	await app.listen(port);
	Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
