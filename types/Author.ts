export { AuthorFields, Author };
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
