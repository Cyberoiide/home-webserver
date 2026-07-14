import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TvModule } from './modules/tv/tv.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), CacheModule.register({ isGlobal: true }), PrismaModule, TvModule, WeatherModule],
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
