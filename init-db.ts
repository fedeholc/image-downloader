import fs from "fs";
import sqlite3 from "sqlite3";
const filepath = "./images.db";

//const tables = { images: "images", authors: "authors", albums: "albums" };

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
  nombre = "nombre",
  description = "description",
  image = "image",
  dateCreated = "dateCreated",
}
type Album = {
  id: number;
  nombre: string;
  description: string;
  image: string;
  dateCreated: string;
};


//* MAIN *

await deleteDbFile(filepath);

//create a database if it doesn't exist
const db = createDbConnection();

deleteTable(TableNames.album, db);
deleteTable(TableNames.author, db);
deleteTable(TableNames.image, db);

createTables(db);

insertAuthor({ id: 0, name: "Eugene Smith", description: "American photojournalist", image: "smith.jpg" }, db);

closeDbConnection(db);

//* FUNCTIONS *

function closeDbConnection(db: sqlite3.Database) {
  db.close((error) => {
    if (error) {
      return console.error(error.message);
    } else {
      console.log("Database connection closed");
    }
  });
}

async function deleteDbFile(filepath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (error) => {
        if (error) {
          console.error(error.message)
          reject(false);
        }
        else {
          console.log("Database file deleted");
          resolve(true);
        }
      });
    }
  });
}

function insertAuthor(author: Author, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.author} (${AuthorFields.name}, ${AuthorFields.description}, ${AuthorFields.image}) VALUES (?, ?, ?)`,
    [author.name, author.description, author.image],
    function (error) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Inserted a row with the ID: ${this.lastID}`);
    }
  );
}


function deleteTable(tableName: string, db: sqlite3.Database) {
  db.exec(`DROP TABLE IF EXISTS ${tableName}`, (error) => {
    if (error) {
      return console.error(error.message);
    }
    else {
      console.log("Table deleted.");
    }
  });
}


function createTables(db: sqlite3.Database) {

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${TableNames.image} (
    ${ImageFields.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${ImageFields.url} TEXT NOT NULL,
    ${ImageFields.description} TEXT,
    ${ImageFields.source} TEXT,
    ${ImageFields.albumId} INTEGER,
    ${ImageFields.authorId} INTEGER,
    FOREIGN KEY(${ImageFields.authorId}) REFERENCES ${TableNames.author}(id),
    FOREIGN KEY(${ImageFields.albumId}) REFERENCES ${TableNames.album}(id)
  )`,
    (error) => {
      if (error) {
        return console.error(error.message);
      } else {
        console.log("Table created.");
      }
    }
  );

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${TableNames.author} (
    ${AuthorFields.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${AuthorFields.name} TEXT NOT NULL,
    ${AuthorFields.description} TEXT,
    ${AuthorFields.image} TEXT)`,
    (error) => {
      if (error) {
        return console.error(error.message);
      }
      else {
        console.log("Table created.");
      }
    }
  );

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${TableNames.album} (
    ${AlbumFields.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${AlbumFields.nombre} TEXT NOT NULL,
    ${AlbumFields.description} TEXT,
    ${AlbumFields.image} TEXT,
    ${AlbumFields.dateCreated} TEXT)`,

    (error) => {
      if (error) {
        return console.error(error.message);
      }
      else {
        console.log("Table created.");
      }
    }
  );
}

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    console.log("Database already exists");
  } else {
    console.log("Creating database");
  }

  return new sqlite3.Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    } else {
      console.log("Connection with SQLite has been established");
    }

  });

}