export { Source, DownloadFilters, TableNames, AuthorFields, Author, ImageFields, Image, AlbumFields, Album };

enum TableNames {
  image = "image",
  author = "author",
  album = "album",
}

enum AuthorFields {
  id = "id",
  name = "name",
  description = "description",
  image = "image",
}

type Author = {
  id: number;
  name: string;
  description: string;
  image: string;
};

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

enum AlbumFields {
  id = "id",
  name = "nombre",
  description = "description",
  image = "image",
  dateCreated = "dateCreated",
}
type Album = {
  id: number;
  name: string;
  description: string;
  image: string;
  dateCreated: string;
};

type Source = {
  id: string;
  url: string;
  name: string;
}

type DownloadFilters = {
  subPageMustInclude: string;
  imgMustInclude: string;
  minImageWidth: number;
  minImageHeight: number;
}