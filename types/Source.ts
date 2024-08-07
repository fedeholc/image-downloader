export { Source, SourceSchema };

import { z } from "zod";
type Source = {
  id: string;
  url: string;
  name: string;
}

const SourceSchema = z.object({
  id: z.string(),
  url: z.string(),
  name: z.string(),
});

