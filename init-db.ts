import fs from "fs";
import sqlite3 from "sqlite3";
const filepath = "./images.db";


//create a database if it doesn't exist
const db = createDbConnection();

//if not exist create a table
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
  `CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    description TEXT,
    image TEXT)`,
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