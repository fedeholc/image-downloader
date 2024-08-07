import sqlite3 from "sqlite3";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import readline from "readline";
import { AlbumFields } from "./types/Album";
import { AuthorSchema } from "./types/Author";
import { AuthorFields } from "./types/Author";
import { ImageFields } from "./types/Image";
import { TableNames } from "./types/Tables";
import { Author } from "./types/Author";

import { createDbConnection, deleteDbFile, deleteTable, closeDbConnection } from "./utils-db";


//* MAIN *


const __filename = fileURLToPath(import.meta.url);
/* const __dirname = path.dirname(__filename);
 */
// read filename from argument
if (process.argv.length < 3) {
  console.error("Usage: node add-author.js <filename>");
  process.exit(1);
}

// check if filename exists and its a json file
const filename = process.argv[2];
if (!fs.existsSync(filename) || !filename.endsWith(".json")) {
  console.error("File not found or not a json file");
  process.exit(1);
}

// read file
console.log("Processing ", filename)
const author: Author = JSON.parse(fs.readFileSync(filename, "utf8"));

try {
  const validatedData = AuthorSchema.parse(author);
  console.log('Validation succeeded:', validatedData);
} catch (error) {
  console.error('Validation failed:', error.errors);
  process.exit(1);
}


let filepath: string = "./images.db";


const db = createDbConnection(filepath);

insertAuthor(author, db);

closeDbConnection(db);

//* FUNCTIONS *


function insertAuthor(author: Author, db: sqlite3.Database) {

  db.run(
    `INSERT INTO ${TableNames.author} (${AuthorFields.id},${AuthorFields.name}, ${AuthorFields.description}, ${AuthorFields.image}) VALUES (?,?, ?, ?)`,
    [author.id, author.name, author.description, author.image],
    function (error) {
      if (error) {
        console.error(error.message);
      } else {
        console.log(`Inserted a row`);
      }
    }
  );
}
