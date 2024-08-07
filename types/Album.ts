export { AlbumFields, Album, AlbumSchema };

import { z } from 'zod';

// Define el esquema del álbum
const AlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  dateCreated: z.string(),
});

enum AlbumFields {
  id = "id",
  name = "nombre",
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
