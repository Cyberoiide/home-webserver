import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TvModule } from './modules/tv/tv.module';
import { WeatherModule } from './modules/weather/weather.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServersModule } from './servers/servers.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.register({ isGlobal: true, ttl: 600_000 }),
		PrismaModule,
		TvModule,
		WeatherModule,
		ServersModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
	],
})
export class AppModule {}
