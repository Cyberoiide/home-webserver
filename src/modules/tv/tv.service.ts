import { Injectable } from '@nestjs/common';
import type { TvCommandDto } from './dto/tv-command.dto';

@Injectable()
export class TvService {
	power(_dto: TvCommandDto): { ok: true } {
		// No real TV protocol wired up yet — this is a template for future
		// device modules. Fill in the actual device call here.
		return { ok: true };
	}

	status(): { action: 'unknown' } {
		return { action: 'unknown' };
	}
}
