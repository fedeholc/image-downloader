export { DownloadFilters, DownloadFiltersSchema };

import { z } from "zod";

type DownloadFilters = {
  subPageMustInclude: string;
  imgMustInclude: string | string[];
  imgExclude: string[];
  minImageWidth: number;
  minImageHeight: number;
  usePlaywright?: boolean;
}

const DownloadFiltersSchema = z.object({
  minImageWidth: z.number(),
  minImageHeight: z.number(),
  imgMustInclude: z.union([z.string(), z.array(z.string())]),
  subPageMustInclude: z.string(),
});
