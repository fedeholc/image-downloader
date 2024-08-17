export { AlbumFields, Album, AlbumSchema };

import { z } from 'zod';

const AlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  dateCreated: z.string(),
});

enum AlbumFields {
  id = "id",
  name = "name",
  description = "description",
  image = "image",
  dateCreated = "dateCreated",
}

type Album = {
  id: string;
  name: string;
  description: string;
  image: string;
  dateCreated: string;
};
