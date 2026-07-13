import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const Coordinates = z.object({
  lat: z.number(),
  long: z.number(),
});

export class GetWeatherDTO extends createZodDto(Coordinates) {}
