import fs from "fs";
import sqlite3 from "sqlite3";
const filepath = "./images.db";

//const tables = { images: "images", authors: "authors", albums: "albums" };

enum tableNames {
  images = "images",
  authors = "authors",
  albums = "albums",
}

enum authorFields {
  id = "id",
  name = "name",
  description = "description",
  image = "image",
}

//delete the database file if it exists
if (fs.existsSync(filepath)) {
  fs.unlink(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
  });
}


function insertRow() {
  //const [name, color, weight] = process.argv.slice(2);
  const [name, color, weight] = ["Jaws", "white", "2000"];
  db.run(
    `INSERT INTO ${tableNames.authors} (name, color, weight) VALUES (?, ?, ?)`,
    [name, color, weight],
    function (error) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Inserted a row with the ID: ${this.lastID}`);
    }
  );
}

//create a database if it doesn't exist
const db = createDbConnection();

deleteTables(db);
createTables(db);

db.close((error) => {
  if (error) {
    return console.error(error.message);
  }
});

function deleteTables(db: sqlite3.Database) {
  db.exec("DROP TABLE IF EXISTS images");
  db.exec("DROP TABLE IF EXISTS authors");
  db.exec("DROP TABLE IF EXISTS albums");

}

function createTables(db: sqlite3.Database) {

  db.exec(
    `CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    description TEXT,
    source TEXT,
    albumId INTEGER,
    authorId INTEGER,
    FOREIGN KEY(authorId) REFERENCES authors(id),
    FOREIGN KEY(albumId) REFERENCES albums(id)
  )`,
    (error) => {
      if (error) {
        return console.error(error.message);
      }
    }
  );

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${tableNames.authors} (
    ${authorFields.id} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${authorFields.name} TEXT NOT NULL,
    ${authorFields.description} TEXT,
    ${authorFields.image} TEXT)`,
    (error) => {
      if (error) {
        return console.error(error.message);
      }
    }
  );

  db.exec(
    `CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    description TEXT,
    image TEXT,
    creationDate TEXT)`,

    (error) => {
      if (error) {
        return console.error(error.message);
      }
    }
  );
}

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
    });
    console.log("Connection with SQLite has been established");
    return db;
  }
}