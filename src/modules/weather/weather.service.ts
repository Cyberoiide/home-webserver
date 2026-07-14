import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { GetWeatherDTO } from './dto/getWeather.dto';
import { WeatherAPIService } from './weather-api.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherAPIService: WeatherAPIService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getWeather(data: GetWeatherDTO) {
    const query = `${data.lat},${data.long}`;
    const cached = await this.cacheManager.get(query);
    if (cached) return cached;

    const result = await this.weatherAPIService.getWeather(query);
    await this.cacheManager.set(query, result);
    return result;
  }
}
