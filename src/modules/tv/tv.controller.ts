import { Body, Controller, Get, Post } from '@nestjs/common';
import { TvCommandDto } from './dto/tv-command.dto';
import { TvService } from './tv.service';

@Controller('tv')
export class TvController {
	constructor(private readonly tvService: TvService) {}

	@Post('power')
	power(@Body() dto: TvCommandDto) {
		return this.tvService.power(dto);
	}

	@Get('status')
	status() {
		return this.tvService.status();
	}
}
