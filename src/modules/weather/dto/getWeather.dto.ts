import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const Coordinates = z.object({
  lat: z.coerce.number(),
  long: z.coerce.number(),
});

export class GetWeatherDTO extends createZodDto(Coordinates) {}
