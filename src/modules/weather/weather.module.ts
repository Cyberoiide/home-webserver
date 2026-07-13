import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherAPIService } from 'src/app.service';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAPIService],
})
export class WeatherModule {}
