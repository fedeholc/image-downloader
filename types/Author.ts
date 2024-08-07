export { AuthorFields, Author, AuthorSchema };


import { z } from 'zod';

// Define el esquema del álbum
const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
});

enum AuthorFields {
  id = "id",
  name = "name",
  description = "description",
  image = "image",
}

type Author = {
  id: string;
  name: string;
  description: string;
  image: string;
};
