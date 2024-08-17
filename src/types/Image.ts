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
  id: string;
  url: string;
  description: string;
  source: string;
  albumId: string;
  authorId: string;
};
