export { ImageFields, Image };

enum ImageFields {
  id = "id",
  url = "url",
  description = "description",
  source = "source",
  albumId = "albumId",
  authorId = "authorId",
}

type Image = {
  id: number;
  url: string;
  description: string;
  source: string;
  albumId: number;
  authorId: number;
};
