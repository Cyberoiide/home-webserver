import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TvCommandSchema = z.object({
	action: z.enum(['on', 'off', 'mute']),
});

export class TvCommandDto extends createZodDto(TvCommandSchema) {}
