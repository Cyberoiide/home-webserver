import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const Coordinates = z.object({
	lat: z.coerce.number().min(-90).max(90),
	long: z.coerce.number().min(-180).max(180),
});

export class GetWeatherDTO extends createZodDto(Coordinates) {}
