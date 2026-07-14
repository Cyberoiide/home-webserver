import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherAPIService {
	constructor(private readonly configService: ConfigService) {}
	async getWeather(query: string) {
		const weatherAPIKey = this.configService.get('WEATHER_API_KEY');
		const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherAPIKey}&q=${query}&days=3&aqi=yes&alerts=yes`;
		const response: Response = await fetch(url, {
			signal: AbortSignal.timeout(5000),
		});

		if (response.status !== 200) {
			throw new HttpException(
				'Unable to fetch weather data',
				response.status >= 500
					? HttpStatus.SERVICE_UNAVAILABLE
					: HttpStatus.BAD_GATEWAY,
			);
		}

		const data = await response.json();
		return data;
	}
}
