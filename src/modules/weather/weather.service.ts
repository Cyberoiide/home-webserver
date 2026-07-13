import { Injectable } from '@nestjs/common';
import { GetWeatherDTO } from './dto/getWeather.dto';
import { weatherAPIService } from 'src/app.service';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherAPIService: WeatherAPIService) {}
  async getWeather(data: GetWeatherDTO) {
    const query = `${data.lat},${data.long}`;
    const result = await this.weatherAPIService.getWeather(query);
    return { result };
  }
}
